
import React, { useMemo, useEffect, useState, useRef } from 'react';
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

type SortConfig = {
  key: keyof ProductData;
  direction: 'asc' | 'desc' | null;
};

export const ProductKnowledge: React.FC<ProductKnowledgeProps> = ({ data, onRefresh, lastUpdated }) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: null });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.innerWidth < 1024) setViewMode('cards');
  }, []);

  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const rawProducts = useMemo(() => {
    if (!data || data.length < 5) return [];
    const memory = getMemory();
    let locations = memory.productBlockLocations;
    const getCell = (r: number, c: number) => (data[r] && data[r][c]) || null;
    const processSheetValueX1000 = (val: string | undefined): string => {
        if (!val) return '-';
        const num = parseFloat(val.toString().trim().replace(/,/g, '.'));
        return !isNaN(num) ? (num * 1000).toLocaleString('vi-VN') : val;
    };
    const findName = (r: number, c: number) => {
        const ignored = ['danh mục', 'giá bán', 'giá nhập', 'chi phí ads', 'tỷ lệ hoàn', 'lợi nhuận', 'sản phẩm'];
        const patterns = [{r: -2, c: 0}, {r: -2, c: -1}, {r: -3, c: 0}, {r: -4, c: 0}, {r: -1, c: 0}];
        for (const p of patterns) {
            const val = getCell(r + p.r, c + p.c);
            if (val) {
                const s = val.toString().trim();
                if (s.length > 0 && !ignored.includes(s.toLowerCase()) && !s.includes('%')) return s.replace(/danh mục/gi, "").trim();
            }
        }
        return "Unknown Product";
    };
    const extractAt = (r: number, c: number): ProductData | null => {
        if (getCell(r, c)?.toString().trim().toLowerCase() !== 'giá bán') return null;
        return {
            name: findName(r, c),
            avgOrderValue: getCell(r, c + 2)?.toString() || '-',
            importPrice: processSheetValueX1000(getCell(r + 1, c + 1)?.toString()),
            avgQuantity: getCell(r + 1, c + 2)?.toString() || '-',
            breakEven: getCell(r + 2, c + 1)?.toString() || '-',
            adsCost: processSheetValueX1000(getCell(r + 2, c + 2)?.toString()),
            returnRate: getCell(r + 3, c + 1)?.toString() || '-',
        };
    };

    let locationsToUse = locations || [];
    if (!locationsToUse.length) {
        for (let r = 0; r < data.length; r++) {
            for (let c = 0; c < (data[r]?.length || 0); c++) {
                if (data[r][c]?.toString().trim().toLowerCase() === 'giá bán') locationsToUse.push({ r, c });
            }
        }
    }
    const result = locationsToUse.map(l => extractAt(l.r, l.c)).filter((p): p is ProductData => p !== null);
    if (!locations && result.length > 0) saveMemory({...memory, productBlockLocations: locationsToUse});
    return result;
  }, [data]);

  const processedProducts = useMemo(() => {
    let filtered = [...rawProducts];
    if (searchQuery) {
      filtered = filtered.filter(p => Object.values(p).some(v => String(v).toLowerCase().includes(searchQuery.toLowerCase())));
    }
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        const numA = parseFloat(String(valA).replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(String(valB).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(numA) && !isNaN(numB)) return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        valA = String(valA).toLowerCase(); valB = String(valB).toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [rawProducts, searchQuery, sortConfig]);

  const handleSort = (key: keyof ProductData) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (key: keyof ProductData) => (
      <span className={`transition-opacity ${sortConfig.key === key ? 'opacity-100 text-emerald-500' : 'opacity-0 group-hover:opacity-40'}`}>
        {sortConfig.key === key && sortConfig.direction === 'desc' ? '↓' : '↑'}
      </span>
  );

  if (!data) return <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center h-full flex items-center justify-center shadow-sm">Đang tải Kho Sản Phẩm...</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border-2 border-emerald-400 shadow-sm overflow-hidden">
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${lastUpdated ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight">Kho Kiến Thức Sản Phẩm</h2>
            <div className="flex items-center gap-2">
                 <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">Update: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}</span>
                 <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{processedProducts.length} SP</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {/* Animated Search Bar for Products */}
            <div className={`flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-40 md:w-64 bg-emerald-50 ring-1 ring-emerald-200' : 'w-10'} rounded-xl overflow-hidden`}>
                <button 
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className={`p-2 transition-colors ${isSearchExpanded ? 'text-emerald-600' : 'text-slate-500 hover:bg-slate-50'} rounded-xl`}
                title="Tìm sản phẩm"
                >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                </button>
                <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Tìm sản phẩm..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)}
                onBlur={() => { if (!searchQuery) setIsSearchExpanded(false); }}
                className={`bg-transparent border-none outline-none text-xs w-full py-2 pr-3 transition-opacity duration-300 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />
            </div>

            <button onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} className="hidden md:flex p-2 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">{viewMode === 'table' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-16zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-16z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}</button>
            <button onClick={onRefresh} className="p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl border border-slate-100 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar bg-white">
        {viewMode === 'table' ? (
        <table className="w-full text-left border-collapse">
          <thead className="bg-white sticky top-0 z-30 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.05)]">
            <tr>
              <th onClick={() => handleSort('name')} className="px-4 py-4 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap sticky left-0 z-40 bg-white pl-6 text-left cursor-pointer group hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-1.5">SẢN PHẨM {renderSortIcon('name')}</div>
              </th>
              <th onClick={() => handleSort('importPrice')} className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-center cursor-pointer group hover:bg-emerald-50 transition-colors">
                <div className="flex items-center justify-center gap-1.5">GIÁ NHẬP {renderSortIcon('importPrice')}</div>
              </th>
              <th onClick={() => handleSort('avgOrderValue')} className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-center cursor-pointer group hover:bg-emerald-50 transition-colors">
                <div className="flex items-center justify-center gap-1.5">GT ĐƠN TB {renderSortIcon('avgOrderValue')}</div>
              </th>
              <th onClick={() => handleSort('avgQuantity')} className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-center cursor-pointer group hover:bg-emerald-50 transition-colors">
                <div className="flex items-center justify-center gap-1.5">SL ĐƠN TB {renderSortIcon('avgQuantity')}</div>
              </th>
              <th onClick={() => handleSort('adsCost')} className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-center cursor-pointer group hover:bg-emerald-50 transition-colors">
                <div className="flex items-center justify-center gap-1.5">CP LƯỢT MUA {renderSortIcon('adsCost')}</div>
              </th>
              <th onClick={() => handleSort('returnRate')} className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-center cursor-pointer group hover:bg-emerald-50 transition-colors">
                <div className="flex items-center justify-center gap-1.5">% HOÀN {renderSortIcon('returnRate')}</div>
              </th>
              <th onClick={() => handleSort('breakEven')} className="px-4 py-4 text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wider border-b border-emerald-100 whitespace-nowrap text-center pr-6 cursor-pointer group hover:bg-emerald-50 transition-colors">
                <div className="flex items-center justify-center gap-1.5">HÒA THỰC TẾ {renderSortIcon('breakEven')}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {processedProducts.map((p, idx) => (
              <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                <td className="px-4 py-4 text-xs md:text-sm font-bold text-slate-800 border-b border-slate-50 whitespace-nowrap sticky left-0 z-20 bg-white group-hover:bg-emerald-50/30 pl-6 text-left">{p.name}</td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-center tabular-nums">{p.importPrice}</td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-center tabular-nums">{p.avgOrderValue}</td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-center tabular-nums">{p.avgQuantity}</td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-center tabular-nums bg-yellow-50/30">{p.adsCost}</td>
                <td className="px-4 py-4 text-xs md:text-sm font-medium text-slate-600 border-b border-slate-50 text-center tabular-nums">{p.returnRate}</td>
                <td className="px-4 py-4 text-xs md:text-sm font-bold text-emerald-600 border-b border-slate-50 text-center tabular-nums pr-6">{p.breakEven}</td>
              </tr>
            ))}
          </tbody>
        </table>
        ) : (
          <div className="p-3 md:p-4 space-y-4 bg-slate-50/50 min-h-full">
             {processedProducts.map((p, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">{p.name}</h3>
                        <span className="text-[10px] font-bold text-slate-300">#{idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Giá nhập</span><span className="text-xs font-semibold text-slate-600">{p.importPrice}</span></div>
                        <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">CP Lượt mua</span><span className="text-xs font-semibold text-slate-800">{p.adsCost}</span></div>
                        <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">% Hoàn</span><span className="text-xs font-semibold text-slate-600">{p.returnRate}</span></div>
                        <div className="flex flex-col"><span className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Hòa TT</span><span className="text-xs font-bold text-emerald-600">{p.breakEven}</span></div>
                    </div>
                </div>
             ))}
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t border-emerald-100 bg-white flex justify-between items-center z-30">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{processedProducts.length} PRODUCTS</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">CACHED MODE</span>
      </div>
    </div>
  );
};
