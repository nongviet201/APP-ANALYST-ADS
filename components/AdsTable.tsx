
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

interface AdsTableProps {
  data: any[];
  title: string;
  isUpdating?: boolean;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
  onExpand?: () => void;
  onRefresh?: () => void;
  status?: 'syncing' | 'success' | 'idle';
}

const formatValue = (key: string, value: any) => {
  return value;
};

const getCellStyle = (key: string, value: any, isFirstColumn: boolean) => {
  const lowerKey = key.toLowerCase();
  
  if (isFirstColumn) {
    return 'font-bold text-slate-900 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]';
  }
  
  if ((lowerKey.includes('lợi nhuận') || lowerKey.includes('%') || lowerKey.includes('roi') || lowerKey.includes('chi phí') || lowerKey.includes('thành tiền')) && typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]+/g,""));
    if (!isNaN(num)) {
      if (num < 0) return 'text-rose-600 font-bold tabular-nums';
      if (lowerKey.includes('lợi nhuận') && num > 0) return 'text-emerald-600 font-bold tabular-nums';
    }
    return 'text-slate-700 font-semibold tabular-nums';
  }
  
  return 'text-slate-600';
};

export const AdsTable: React.FC<AdsTableProps> = ({ 
  data, 
  title, 
  isUpdating, 
  isAnalyzing, 
  onAnalyze, 
  onExpand,
  onRefresh, 
  status = 'idle'
}) => {
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Drag to scroll refs
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setViewMode('cards');
    }
  }, []);

  useEffect(() => {
    if (status === 'success') {
      setLastSyncTime(new Date().toLocaleTimeString());
    }
  }, [status]);

  // Drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setStartY(e.pageY - tableContainerRef.current.offsetTop);
    setScrollLeft(tableContainerRef.current.scrollLeft);
    setScrollTop(tableContainerRef.current.scrollTop);
  };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const y = e.pageY - tableContainerRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    tableContainerRef.current.scrollLeft = scrollLeft - walkX;
    tableContainerRef.current.scrollTop = scrollTop - walkY;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center shadow-sm">
         <h3 className="text-sm font-semibold text-slate-900">Đang tải dữ liệu Ads...</h3>
      </div>
    );
  }

  const keys = Object.keys(data[0]);
  
  // --- IDENTIFY SPECIAL COLUMNS ---
  const accountKey = keys[0]; // Assume first column is always Account ID/Name
  const campaignNameKey = keys.find(k => k.toLowerCase().includes('tên chiến dịch')) || keys.find(k => k.toLowerCase().includes('name')) || '';
  const statusKey = keys.find(k => k.toLowerCase().includes('trạng thái') || k.toLowerCase().includes('status')) || '';
  const updatedKey = keys.find(k => k.toLowerCase().includes('updated') || k.toLowerCase().includes('cập nhật')) || '';
  // Error key logic: contains 'lỗi', 'error' OR is the last column
  const errorKey = keys.find(k => {
    const lower = k.toLowerCase();
    return lower.includes('lỗi') || lower.includes('error') || lower.includes('ghi chú') || lower.includes('cảnh báo');
  }) || keys[keys.length - 1]; 

  const sheetUpdateTime = updatedKey && data.length > 0 ? data[0][updatedKey] : null;

  // --- FILTER KEYS FOR DISPLAY ---
  // We manually place Account, Status, and Campaign. We filter the rest to follow.
  const restKeys = keys.filter(k => 
    k !== accountKey && 
    k !== campaignNameKey && 
    k !== statusKey && 
    k !== updatedKey && 
    k !== errorKey
  );

  let ledClass = "bg-slate-300";
  if (status === 'syncing') ledClass = "bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]";
  if (status === 'success') ledClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header Ads */}
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${ledClass}`}></div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
                <span className="text-[10px] text-slate-400 font-semibold tracking-tight whitespace-nowrap">App sync: {lastSyncTime}</span>
                {sheetUpdateTime && (
                   <span className="text-[10px] text-indigo-500 font-semibold tracking-tight md:border-l md:border-slate-200 md:pl-3 whitespace-nowrap">Sheet: {sheetUpdateTime}</span>
                )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="hidden md:flex p-2 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors"
          >
            {viewMode === 'table' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-16zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-16z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            )}
          </button>

          {onRefresh && (
            <button onClick={onRefresh} disabled={status === 'syncing'} className="p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl border border-slate-100 transition-colors">
              <svg className={`w-5 h-5 ${status === 'syncing' ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}

          {onAnalyze && (
            <Button onClick={onAnalyze} isLoading={isAnalyzing} className="text-xs py-2 px-4 h-9 shadow-none bg-slate-900 hover:bg-black border-none rounded-xl">
              <span>✨ AI</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={tableContainerRef}
        className={`flex-1 overflow-auto custom-scrollbar bg-slate-50/50 ${viewMode === 'table' ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onMouseDown={viewMode === 'table' ? onMouseDown : undefined}
        onMouseLeave={viewMode === 'table' ? onMouseLeave : undefined}
        onMouseUp={viewMode === 'table' ? onMouseUp : undefined}
        onMouseMove={viewMode === 'table' ? onMouseMove : undefined}
      >
        {viewMode === 'table' ? (
          <table className="w-full text-left border-collapse select-none md:select-auto">
            <thead className="bg-slate-50 sticky top-0 z-30">
              <tr>
                {/* 1. Account Name Header */}
                <th className="px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap sticky left-0 z-40 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] pl-5">
                  {accountKey}
                </th>
                
                {/* 2. Status (TT) Header - Compact */}
                <th className="px-2 py-3 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 text-center w-10">
                  TT
                </th>

                {/* 3. Campaign Header */}
                {campaignNameKey && (
                  <th className="px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                    {campaignNameKey}
                  </th>
                )}

                {/* 4. Rest of Headers */}
                {restKeys.map((key) => (
                  <th key={key} className="px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data.map((row, idx) => {
                const statusValue = row[statusKey];
                const isActive = statusValue?.toString().toLowerCase() === 'active';
                const errorText = row[errorKey];
                // Check if there is text in the error column
                const hasError = errorText && errorText.toString().trim().length > 0;

                return (
                  <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                    {/* 1. Account Name Cell */}
                    <td className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(accountKey, row[accountKey], true)}`}>
                        <div className="flex flex-col">
                            {/* Color logic: Red if hasError, else Green */}
                            <span className={hasError ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                                {formatValue(accountKey, row[accountKey])}
                            </span>
                            {/* Display Error Text if exists */}
                            {hasError && (
                                <span className="text-[9px] text-rose-500 italic mt-0.5 max-w-[150px] truncate block">
                                    {errorText}
                                </span>
                            )}
                        </div>
                    </td>

                    {/* 2. Status (TT) Cell */}
                    <td className="px-2 py-3 border-b border-slate-100 text-center w-10">
                        <div className="flex justify-center">
                            <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                        </div>
                    </td>

                    {/* 3. Campaign Name Cell */}
                    {campaignNameKey && (
                        <td className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(campaignNameKey, row[campaignNameKey], false)}`}>
                            {formatValue(campaignNameKey, row[campaignNameKey])}
                        </td>
                    )}

                    {/* 4. Rest of Cells */}
                    {restKeys.map((key) => (
                      <td key={key} className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(key, row[key], false)}`}>
                         {formatValue(key, row[key])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* Card View (Mobile) - Keep consistent with Table Logic */
          <div className="p-3 md:p-4 space-y-4">
            {data.map((row, rowIdx) => {
              const statusValue = row[statusKey];
              const isActive = statusValue?.toString().toLowerCase() === 'active';
              const displayName = campaignNameKey ? row[campaignNameKey] : row[keys[1]]; 
              const displayId = row[accountKey];
              const errorText = row[errorKey];
              const hasError = errorText && errorText.toString().trim().length > 0;

              return (
                <div key={rowIdx} className={`bg-white rounded-2xl border ${hasError ? 'border-rose-100' : 'border-slate-100'} shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300`}>
                  <div className={`bg-white px-5 py-4 border-b ${hasError ? 'border-rose-50' : 'border-slate-50'} relative`}>
                     <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col">
                            {/* Account ID Color Logic */}
                            <span className={`text-[12px] font-black uppercase tracking-widest ${hasError ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {displayId}
                            </span>
                             {/* Error Text Mobile */}
                            {hasError && <span className="text-[10px] text-rose-500 font-medium italic mt-0.5">{errorText}</span>}
                        </div>
                        <span className="text-[10px] font-bold text-slate-300">#{rowIdx + 1}</span>
                     </div>
                     <div className="flex items-center gap-2.5 mt-2">
                        {/* Status Dot */}
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                        <h3 className="text-base md:text-lg font-bold text-slate-800 leading-snug">{displayName}</h3>
                     </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-6">
                    {restKeys.map((key) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate mb-1">{key}</span>
                        <span className={`text-sm ${getCellStyle(key, row[key], false)}`}>{row[key]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-between items-center z-30">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.length} RECORDS</span>
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${status === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-200'}`}></div>
           <span className="text-[9px] font-bold text-slate-400">{status === 'syncing' ? 'UPDATING...' : 'READY'}</span>
        </div>
      </div>
    </div>
  );
};
