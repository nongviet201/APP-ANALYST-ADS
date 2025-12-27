
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TabView, AppMemory, RowData, SheetConfig } from './types';
import { getMemory, saveMemory, updateSheetConfig, extractSheetId } from './services/storageService';
import { fetchSheetData, parseTableData } from './services/googleSheetService';
import { analyzeData } from './services/geminiService';
import { POLLING_INTERVAL_MS, DEFAULT_SHEET_URL } from './constants';
import { DataTable } from './components/DataTable';
import { ProductKnowledge } from './components/ProductKnowledge';
import { Button } from './components/Button';
import { Layout } from './components/Layout';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>(TabView.HOURLY);
  const [memory, setMemory] = useState<AppMemory>(getMemory());
  const [hourlyData, setHourlyData] = useState<RowData[]>([]);
  const [adsData, setAdsData] = useState<RowData[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  
  // Temporary state for editing settings
  const [tempConfigs, setTempConfigs] = useState<{ [key: string]: SheetConfig } | null>(null);

  const intervalRef = useRef<any>(null);

  // --- Logic Fetch Data ---
  const fetchDataForTab = useCallback(async (tab: TabView, forceExpand = false) => {
    if (!memory.sheetId) return;
    if (tab === TabView.SETTINGS) return;

    // Map TabView to config key
    let configName = '';
    if (tab === TabView.HOURLY) configName = 'BC_GIỜ';
    if (tab === TabView.ADS) configName = 'Việt_Ads';
    if (tab === TabView.KNOWLEDGE) configName = '%Hòa_TT';

    const config = memory.configs[configName];
    if (!config || config.isVisible === false) return;
    
    // Only show full-screen loading if we have NO data yet
    const hasExistingData = tab === TabView.HOURLY ? hourlyData.length > 0 : (tab === TabView.ADS ? adsData.length > 0 : false);
    if (!hasExistingData && !forceExpand) setIsUpdating(true);
    
    setSyncStatus('syncing');

    try {
      const fetchConfig: SheetConfig = forceExpand 
        ? { ...config, lastRow: config.lastRow + 5 } 
        : config;

      const rawCsvGrid = await fetchSheetData(memory.sheetId, fetchConfig);
      
      if (tab === TabView.KNOWLEDGE) {
        const newMemory = {
             ...memory,
             productKnowledgeCache: rawCsvGrid,
             lastKnowledgeUpdate: Date.now()
        };
        setMemory(newMemory);
        saveMemory(newMemory);
      } else {
        const parsed = parseTableData(rawCsvGrid);
        
        if (forceExpand && parsed.length > 0) {
             const newTotalRows = Math.max(config.lastRow, rawCsvGrid.length);
             if (newTotalRows > config.lastRow) {
                 const newConfigs = updateSheetConfig(configName, { lastRow: newTotalRows });
                 setMemory(prev => ({ ...prev, configs: newConfigs }));
             }
        }

        if (tab === TabView.HOURLY) setHourlyData(parsed);
        if (tab === TabView.ADS) setAdsData(parsed);
      }
      
      setSyncStatus('success');
      // Briefly show success LED then go back to idle
      setTimeout(() => setSyncStatus('idle'), 4000);

    } catch (error: any) {
      console.error(`Error fetching ${tab}:`, error);
      setSyncStatus('idle');
    } finally {
      setIsUpdating(false);
    }
  }, [memory, hourlyData.length, adsData.length]);

  // --- Startup & Auto-Update every 30s ---
  useEffect(() => {
    if (memory.sheetId && !memory.productKnowledgeCache) {
      fetchDataForTab(TabView.KNOWLEDGE);
    }
  }, [memory.sheetId]); 

  useEffect(() => {
    if (!memory.sheetId) return;

    // Initial fetch for tab
    fetchDataForTab(activeTab);

    // Set 30s polling
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchDataForTab(activeTab);
    }, POLLING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTab, fetchDataForTab, memory.sheetId]);

  // Initialize temp configs when opening settings
  useEffect(() => {
    if (showConfig) {
      setTempConfigs(JSON.parse(JSON.stringify(memory.configs)));
    }
  }, [showConfig, memory.configs]);

  // --- Actions ---
  const handleExpandScan = () => fetchDataForTab(activeTab, true);
  const handleManualRefresh = () => fetchDataForTab(activeTab, false);

  const handleAiAnalyze = async () => {
    let contextData = activeTab === TabView.HOURLY ? hourlyData : adsData;
    let contextName = activeTab === TabView.HOURLY ? "Báo Cáo Giờ" : "Việt Ads";
    
    if (contextData.length === 0) return;

    setIsAnalyzing(true);
    try {
        const result = await analyzeData(contextData, contextName);
        setAiAnalysis(result);
    } catch (e) {
        alert("Lỗi phân tích AI. Kiểm tra API Key.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent, url: string) => {
      e.preventDefault();
      const extractedId = extractSheetId(url);
      if (!extractedId) {
          alert("Link Google Sheet không hợp lệ.");
          return;
      }
      
      // Update history
      const currentHistory = memory.urlHistory || [];
      const updatedHistory = [url, ...currentHistory.filter(h => h !== url)].slice(0, 5);

      const newMem = { 
        ...memory, 
        sheetUrl: url, 
        sheetId: extractedId,
        urlHistory: updatedHistory,
        configs: tempConfigs || memory.configs
      };
      
      setMemory(newMem);
      saveMemory(newMem);
      setShowConfig(false);
      
      // Reset current data to force a clean fetch
      setHourlyData([]);
      setAdsData([]);
  };

  const handleConfigChange = (key: string, field: keyof SheetConfig, value: any) => {
    if (!tempConfigs) return;
    setTempConfigs({
      ...tempConfigs,
      [key]: {
        ...tempConfigs[key],
        [field]: value
      }
    });
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    const updatedHistory = (memory.urlHistory || []).filter(h => h !== url);
    const newMem = { ...memory, urlHistory: updatedHistory };
    setMemory(newMem);
    saveMemory(newMem);
  };

  const renderConfigSection = (label: string, configKey: string) => {
    if (!tempConfigs) return null;
    const config = tempConfigs[configKey];
    if (!config) return null;

    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-700 text-sm">{label}</h3>
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase font-bold text-slate-400">Hiển thị</label>
            <input 
              type="checkbox" 
              checked={config.isVisible !== false} 
              onChange={(e) => handleConfigChange(configKey, 'isVisible', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
          </div>
        </div>
        
        {config.isVisible !== false && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tên Tab trên Sheet</label>
              <input 
                type="text" 
                value={config.sheetName}
                onChange={(e) => handleConfigChange(configKey, 'sheetName', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Ví dụ: Sheet1"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cột Bắt đầu</label>
              <input 
                type="text" 
                value={config.rangeStart}
                onChange={(e) => handleConfigChange(configKey, 'rangeStart', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                placeholder="A1"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cột Kết thúc</label>
              <input 
                type="text" 
                value={config.rangeEndCol}
                onChange={(e) => handleConfigChange(configKey, 'rangeEndCol', e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                placeholder="Z"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Render Configuration ---
  if (!memory.sheetId || showConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-2xl space-y-8 border border-slate-100 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="text-center">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-100 mb-5">
                 <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
             </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Cấu hình Hệ thống</h1>
            <p className="text-slate-400 mt-1 text-sm">Kết nối & Cài đặt nguồn dữ liệu</p>
          </div>
          
          <form onSubmit={(e) => handleSaveSettings(e, (e.currentTarget.elements.namedItem('url') as HTMLInputElement).value)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Link Google Sheet</label>
              <div className="relative group">
                <input 
                  name="url" 
                  defaultValue={memory.sheetUrl || DEFAULT_SHEET_URL} 
                  type="url"
                  className="w-full pl-5 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  required
                />
              </div>
            </div>

            {/* Sheet Tabs Configuration */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Cấu hình Trang tính</h2>
              {renderConfigSection('Module: Báo Cáo Giờ', 'BC_GIỜ')}
              {renderConfigSection('Module: Quảng Cáo (Ads)', 'Việt_Ads')}
              {renderConfigSection('Module: Kho Kiến Thức', '%Hòa_TT')}
            </div>

            <div className="pt-2">
               <Button type="submit" className="w-full py-4 rounded-2xl text-base font-bold">Lưu & Áp dụng</Button>
               {memory.sheetId && (
                  <button 
                    type="button" 
                    onClick={() => setShowConfig(false)} 
                    className="w-full text-center text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-4 transition-colors"
                  >
                      Hủy bỏ
                  </button>
               )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- Render Dashboard ---
  return (
    <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onOpenSettings={() => setShowConfig(true)}
        configs={memory.configs}
    >
      <div className="flex flex-col gap-4 h-full pb-10 md:pb-0">
        
        {/* AI Analysis Result Panel */}
        {aiAnalysis && (
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-100 animate-fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🤖</div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">AI Phân tích Chiến dịch</h3>
                          <p className="text-xs text-slate-400 font-medium">Dựa trên dữ liệu {activeTab === TabView.HOURLY ? 'Báo cáo giờ' : 'Việt Ads'}</p>
                        </div>
                    </div>
                    <button 
                      onClick={() => setAiAnalysis("")} 
                      className="text-slate-300 hover:text-slate-600 bg-slate-50 p-2 rounded-xl transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-sm md:text-base italic">
                    {aiAnalysis}
                </div>
            </div>
        )}

        {/* The Main Unified Table with Integrated Controls */}
        <div className="flex-1 min-h-[400px]">
          {activeTab === TabView.HOURLY && (
            <DataTable 
              title="Báo Cáo Giờ" 
              data={hourlyData} 
              isUpdating={isUpdating}
              isAnalyzing={isAnalyzing}
              onAnalyze={handleAiAnalyze}
              onExpand={handleExpandScan}
              onRefresh={handleManualRefresh}
              status={syncStatus}
            />
          )}
          
          {activeTab === TabView.ADS && (
            <DataTable 
              title="Việt Ads" 
              data={adsData} 
              isUpdating={isUpdating}
              isAnalyzing={isAnalyzing}
              onAnalyze={handleAiAnalyze}
              onExpand={handleExpandScan}
              onRefresh={handleManualRefresh}
              status={syncStatus}
            />
          )}

          {activeTab === TabView.KNOWLEDGE && (
            <ProductKnowledge 
              data={memory.productKnowledgeCache} 
              lastUpdated={memory.lastKnowledgeUpdate}
              onRefresh={() => fetchDataForTab(TabView.KNOWLEDGE, false)}
            />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default App;
