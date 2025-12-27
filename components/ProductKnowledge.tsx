
import React, { useMemo, useEffect, useState } from 'react';
import { getMemory, saveMemory } from '../services/storageService';
import { GridCoordinate } from '../types';

interface ProductKnowledgeProps {
  data: any[][] | null;
  onRefresh: () => void;
  lastUpdated: number | null;
}

interface ProductData {
  name: string;
  importPrice: string; 
  avgOrderValue: string; 
  avgQuantity: string; 
  adsCost: string; 
  breakEven: string; 
  returnRate: string; 
}

export const ProductKnowledge: React.FC<ProductKnowledgeProps> = ({ data, onRefresh, lastUpdated }) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setViewMode('cards');
    }
  }, []);

  // --- ALGORITHM: SCAN & CACHE ---
  const products = useMemo(() => {
    if (!data || data.length < 5) return [];

    const memory = getMemory();
    let locations = memory.productBlockLocations;
    let needsRescan = false;

    // Helper to safely get data
    const getCell = (r: number, c: number) => {
      if (r >= 0 && r < data.length && data[r] && c >= 0 && c < data[r].length) {
        return data[r][c];
      }
      return null;
    };

    // Helper to find name intelligently around the expected location
    const findName = (r: number, c: number) => {
        // Define header keywords to ignore
        const ignoredValues = ['danh mục', 'giá bán', 'phần trăm', 'thành tiền', 'giá nhập', 'chi phí ads', 'tỷ lệ hoàn', 'chi phí khác', 'ship', 'lợi nhuận'];
        
        // Scan wider range: 2 to 5 rows above, and 1 column left/right
        // Prioritize: [r-2, c], then neighbors, then [r-3, c], etc.
        const rowOffsets = [-2, -3, -4, -5];
        const colOffsets = [0, -1, 1]; 

        for (const rOff of rowOffsets) {
            for (const cOff of colOffsets) {
                const val = getCell(r + rOff, c + cOff)?.toString().trim();
                
                if (val && val.length > 1) {
                    const lowerVal = val.toLowerCase();
                    // If it's not a header keyword, it's likely the name
                    if (!ignoredValues.includes(lowerVal)) {
                        return val;
                    }
                }
            }
        }

        return "Unknown Product";
    };

    // Helper to extract a single product based on the "Giá bán" anchor coordinates {r, c}
    const extractAt = (r: number, c: number): ProductData | null => {
        try {
            // Anchor verification
            const anchor = getCell(r, c)?.toString().trim().toLowerCase();
            if (anchor !== 'giá bán') return null;

            return {
                name: findName(r, c),
                avgOrderValue: getCell(r, c + 2)?.toString() || '-',
                
                importPrice: getCell(r + 1, c + 1)?.toString() || '-',
                avgQuantity: getCell(r + 1, c + 2)?.toString() || '-',
                
                breakEven: getCell(r + 2, c + 1)?.toString() || '-',
                adsCost: getCell(r + 2, c + 2)?.toString() || '-',
                
                returnRate: getCell(r + 3, c + 1)?.toString() || '-',
            };
        } catch (e) {
            return null;
        }
    };

    // 1. Try to use Cached Locations first
    if (locations && locations.length > 0) {
        let validCache = true;
        const tempProducts: ProductData[] = [];
        
        for (const loc of locations) {
            const p = extractAt(loc.r, loc.c);
            if (p) {
                tempProducts.push(p);
            } else {
                validCache = false;
                break;
            }
        }

        if (validCache && tempProducts.length > 0) {
            console.log("⚡ Used cached product locations.");
            return tempProducts;
        } else {
            console.log("⚠️ Cache invalid or structure changed. Rescanning...");
            needsRescan = true;
        }
    } else {
        needsRescan = true;
    }

    // 2. Full Scan (if needed)
    if (needsRescan) {
        const newLocations: GridCoordinate[] = [];
        const scannedProducts: ProductData[] = [];
        
        for (let r = 0; r < data.length; r++) {
            if (!data[r]) continue;
            for (let c = 0; c < data[r].length; c++) {
                const cellVal = data[r][c]?.toString().trim().toLowerCase();
                
                if (cellVal === 'giá bán') {
                    const p = extractAt(r, c);
                    if (p) {
                        scannedProducts.push(p);
                        newLocations.push({ r, c });
                    }
                }
            }
        }

        if (newLocations.length > 0) {
            const currentMem = getMemory();
            if (JSON.stringify(currentMem.productBlockLocations) !== JSON.stringify(newLocations)) {
                console.log("💾 Updating product location cache:", newLocations.length, "blocks found.");
                saveMemory({
                    ...currentMem,
                    productBlockLocations: newLocations
                });
            }
        }
        
        return scannedProducts;
    }

    return [];
  }, [data]);

  const formatCell = (val: string) => val;

  // --- Styles for Card View Metrics ---
  const renderMetricRow = (label: string, value: string, colorClass: string = 'text-slate-600') => (
      <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">{label}</span>
          <span className={`text-sm font-semibold tabular-nums ${colorClass}`}>{value}</span>
      </div>
  );

  if (!data) {
     return (
       <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center shadow-sm">
         <h3 className="text-sm font-semibold text-slate-900">Đang tải Kho Sản Phẩm...</h3>
       </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border-2 border-emerald-400 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${lastUpdated ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight">Kho Kiến Thức Sản Phẩm</h2>
            <div className="flex items-center gap-2">
                 <span className="text-[10px] text-slate-400 font-semibold tracking-tight">
                    Update: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                    {products.length} SP
                </span>
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
            <button 
              onClick={onRefresh}
              className="p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl border border-slate-100 transition-colors"
              title="Quét lại dữ liệu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-white">
        {viewMode === 'table' ? (
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-30 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)]">
            <tr>
              <th className="px-4 py-4 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap sticky left-0 z-40 bg-white pl-6">
                SẢN PHẨM
              </th>
              <th className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-right">
                GIÁ NHẬP
              </th>
              <th className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-right">
                GT ĐƠN TB
              </th>
              <th className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-right">
                SL ĐƠN TB
              </th>
              <th className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-right">
                CP LƯỢT MUA
              </th>
              <th className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-right">
                % HOÀN
              </th>
              <th className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-right pr-6">
                HÒA THỰC TẾ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map((prod, idx) => (
              <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="px-4 py-4 text-xs md:text-sm font-bold text-slate-800 border-b border-slate-50 whitespace-nowrap sticky left-0 z-20 bg-white group-hover:bg-emerald-50/30 pl-6 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.02)]">
                  {prod.name}
                </td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-right tabular-nums">
                  {formatCell(prod.importPrice)}
                </td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-right tabular-nums">
                  {formatCell(prod.avgOrderValue)}
                </td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-right tabular-nums">
                  {formatCell(prod.avgQuantity)}
                </td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-right tabular-nums bg-yellow-50/50">
                  {formatCell(prod.adsCost)}
                </td>
                 <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-right tabular-nums">
                  {formatCell(prod.returnRate)}
                </td>
                <td className="px-4 py-4 text-xs md:text-sm font-bold text-emerald-600 border-b border-slate-50 text-right tabular-nums pr-6">
                  {formatCell(prod.breakEven)}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                        Không tìm thấy sản phẩm.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
        ) : (
          /* Card View */
          <div className="p-3 md:p-4 space-y-4 bg-slate-50/50 min-h-full">
             {products.map((prod, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden p-4">
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-50">
                        <h3 className="text-base font-bold text-slate-800">{prod.name}</h3>
                        <span className="text-[10px] font-bold text-slate-300">#{idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                        {renderMetricRow('Giá nhập', prod.importPrice)}
                        {renderMetricRow('GT Đơn TB', prod.avgOrderValue)}
                        {renderMetricRow('SL Đơn TB', prod.avgQuantity)}
                        {renderMetricRow('CP Lượt Mua', prod.adsCost, 'text-slate-800')}
                        {renderMetricRow('% Hoàn', prod.returnRate)}
                        {renderMetricRow('Hòa Thực Tế', prod.breakEven, 'text-emerald-600 font-bold')}
                    </div>
                </div>
             ))}
             {products.length === 0 && (
                 <div className="text-center py-10 text-slate-400 text-sm">Chưa có dữ liệu.</div>
             )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-emerald-100 bg-white flex justify-between items-center z-30">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{products.length} PRODUCTS FOUND</span>
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-bold text-slate-400">CACHED MODE</span>
        </div>
      </div>
    </div>
  );
};
