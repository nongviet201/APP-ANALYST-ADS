
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AdsTableView } from './AdsTableView';
import { AdsCardView } from './AdsCardView';

interface AdsTableProps {
  data: any[];
  title: string;
  isUpdating?: boolean;
  onExpand?: () => void;
  onRefresh?: () => void;
  status?: 'syncing' | 'success' | 'idle' | 'error';
  lastUpdated?: number | null;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

const getCellStyle = (key: string, value: any, isFirstColumn: boolean) => {
  const lowerKey = key.toLowerCase();
  if (isFirstColumn) return 'font-bold text-slate-900 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-left';
  let baseStyle = 'text-center ';
  if ((lowerKey.includes('lợi nhuận') || lowerKey.includes('%') || lowerKey.includes('roi') || lowerKey.includes('chi phí') || lowerKey.includes('thành tiền')) && typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]+/g,""));
    if (!isNaN(num)) {
      if (num < 0) return baseStyle + 'text-rose-600 font-bold tabular-nums';
      if (lowerKey.includes('lợi nhuận') && num > 0) return baseStyle + 'text-emerald-600 font-bold tabular-nums';
    }
    return baseStyle + 'text-slate-700 font-semibold tabular-nums';
  }
  return baseStyle + 'text-slate-600';
};

export const AdsTable: React.FC<AdsTableProps> = ({ 
  data, title, status = 'idle', lastUpdated, onRefresh 
}) => {
  // Fix layout shift: Khởi tạo giá trị ngay lập tức thay vì đợi useEffect
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      return 'cards';
    }
    return 'table';
  });

  const [isOpen, setIsOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showMetadata, setShowMetadata] = useState(true); 
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Vẫn giữ lắng nghe resize để chuyển đổi nếu người dùng xoay màn hình hoặc resize trình duyệt
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && viewMode === 'table') setViewMode('cards');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (status !== 'error') setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Logic delay hiển thị metadata khi đóng search
  useEffect(() => {
    if (isSearchExpanded) {
      setShowMetadata(false); // Ẩn ngay khi mở search
      if (searchInputRef.current) searchInputRef.current.focus();
    } else {
      // Chờ animation kính lúp (300ms) kết thúc rồi mới hiện lại badge
      const timer = setTimeout(() => {
        setShowMetadata(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isSearchExpanded]);

  const keys = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const accountKey = keys[0];
  const campaignNameKey = keys.find(k => k.toLowerCase().includes('tên chiến dịch')) || keys.find(k => k.toLowerCase().includes('name')) || '';
  const statusKey = keys.find(k => k.toLowerCase().includes('trạng thái') || k.toLowerCase().includes('status')) || '';
  const updatedKey = keys.find(k => k.toLowerCase().includes('updated') || k.toLowerCase().includes('cập nhật')) || '';
  const errorKey = keys.find(k => {
    const lower = k.toLowerCase();
    return lower.includes('lỗi') || lower.includes('error') || lower.includes('ghi chú') || lower.includes('cảnh báo');
  }) || keys[keys.length - 1]; 

  const restKeys = keys.filter(k => k !== accountKey && k !== campaignNameKey && k !== statusKey && k !== updatedKey && k !== errorKey);

  const processedData = useMemo(() => {
    let filtered = [...data];
    if (searchQuery) {
      filtered = filtered.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    if (sortConfig.key && sortConfig.direction) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        const numA = parseFloat(String(valA).replace(/[^0-9.-]+/g, ""));
        const numB = parseFloat(String(valB).replace(/[^0-9.-]+/g, ""));
        if (!isNaN(numA) && !isNaN(numB)) return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchQuery, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    else if (sortConfig.key === key && sortConfig.direction === 'desc') direction = null;
    setSortConfig({ key, direction });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!tableContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tableContainerRef.current.offsetLeft);
    setScrollLeft(tableContainerRef.current.scrollLeft);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - tableContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    tableContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const displayTime = status === 'error' && lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : currentTime.toLocaleTimeString();

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 min-h-0 ${isOpen ? 'flex-1' : 'h-auto'}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-40 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors select-none flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${status === 'error' ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">{title}</h2>
            
            {/* Metadata section updated: Update time always visible, Badge hidden on search */}
            <div className="flex items-center gap-2">
                 <span className={`text-[10px] font-semibold tracking-tight ${status === 'error' ? 'text-rose-500' : 'text-slate-400'}`}>
                    Update: {displayTime}
                 </span>
                 <span className={`text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold transition-opacity duration-300 ${showMetadata ? 'opacity-100' : 'opacity-0 hidden'}`}>
                    {processedData.length} CAMPS
                 </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <div className={`flex items-center transition-all duration-300 ${isSearchExpanded ? 'w-40 md:w-64 bg-slate-50 ring-1 ring-slate-200' : 'w-10'} rounded-xl overflow-hidden`}>
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className={`p-2 transition-colors ${isSearchExpanded ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-50'} rounded-xl`}
              title="Tìm kiếm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Tìm chiến dịch..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)}
              onBlur={() => { if (!searchQuery) setIsSearchExpanded(false); }}
              className={`bg-transparent border-none outline-none text-xs w-full py-2 pr-3 transition-opacity duration-300 ${isSearchExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            />
          </div>

          <button onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} className="hidden md:flex p-2 text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
            {viewMode === 'table' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-16zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-16z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
          </button>
          {onRefresh && <button onClick={onRefresh} className="p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-xl border border-slate-100 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>}
        </div>
      </div>

      {isOpen && (
      <>
        <div ref={tableContainerRef} className={`flex-1 overflow-auto custom-scrollbar bg-slate-50/50 ${viewMode === 'table' ? 'cursor-grab active:cursor-grabbing' : ''}`} onMouseDown={viewMode === 'table' ? onMouseDown : undefined} onMouseLeave={() => setIsDragging(false)} onMouseUp={() => setIsDragging(false)} onMouseMove={viewMode === 'table' ? onMouseMove : undefined}>
            {viewMode === 'table' ? (
              <AdsTableView 
                data={processedData}
                keys={keys}
                accountKey={accountKey}
                campaignNameKey={campaignNameKey}
                statusKey={statusKey}
                errorKey={errorKey}
                restKeys={restKeys}
                sortConfig={sortConfig}
                onSort={handleSort}
                getCellStyle={getCellStyle}
              />
            ) : (
              <AdsCardView 
                data={processedData}
                accountKey={accountKey}
                campaignNameKey={campaignNameKey}
                statusKey={statusKey}
                errorKey={errorKey}
                restKeys={restKeys}
                getCellStyle={getCellStyle}
              />
            )}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-between items-center z-30 flex-shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{processedData.length} RECORDS</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REALTIME MODE</span>
        </div>
      </>
      )}
    </div>
  );
};
