
import React, { useState, useEffect, useRef } from 'react';

interface HourlyTableProps {
  data: any[];
  title: string;
  isUpdating?: boolean;
  onExpand?: () => void;
  onRefresh?: () => void;
  status?: 'syncing' | 'success' | 'idle' | 'error';
  lastUpdated?: number | null;
}

const formatValue = (key: string, value: any) => {
  return value;
};

const getCellStyle = (key: string, value: any, isFirstColumn: boolean) => {
  const lowerKey = key.toLowerCase();
  
  if (isFirstColumn) {
    return 'font-bold text-blue-900 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-left';
  }
  
  let baseStyle = 'text-center ';
  
  if ((lowerKey.includes('lợi nhuận') || lowerKey.includes('%') || lowerKey.includes('roi') || lowerKey.includes('chi phí') || lowerKey.includes('doanh thu')) && typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]+/g,""));
    if (!isNaN(num)) {
      if (num < 0) return baseStyle + 'text-rose-600 font-bold tabular-nums';
      if (lowerKey.includes('lợi nhuận') && num > 0) return baseStyle + 'text-emerald-600 font-bold tabular-nums';
    }
    return baseStyle + 'text-slate-700 font-semibold tabular-nums';
  }
  
  return baseStyle + 'text-slate-600';
};

export const HourlyTable: React.FC<HourlyTableProps> = ({ 
  data, 
  title, 
  isUpdating, 
  onExpand,
  onRefresh, 
  status = 'idle',
  lastUpdated
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table'); 
  const [isOpen, setIsOpen] = useState(true); 
  
  // Real-time ticker state
  const [currentTime, setCurrentTime] = useState(new Date());

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Auto-switch to cards on tablet/mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setViewMode('cards');
    }
  }, []);

  // Timer Effect: Ticks every second to simulate "Live" connection
  useEffect(() => {
    const timer = setInterval(() => {
      // Only update time if NOT in error state
      if (status !== 'error') {
        setCurrentTime(new Date());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Drag logic
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
         <h3 className="text-sm font-semibold text-slate-900">Đang tải Báo cáo giờ...</h3>
      </div>
    );
  }

  const keys = Object.keys(data[0]);
  const updatedKey = keys.find(k => k.toLowerCase().includes('updated') || k.toLowerCase().includes('cập nhật')) || '';
  const tableKeys = keys.filter(k => k !== updatedKey);

  // LED Status Logic: Green unless Error
  let ledClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"; // Always Green
  if (status === 'error') {
      ledClass = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"; // Red only on Error
  }

  // Time Display Logic
  const displayTime = status === 'error' && lastUpdated
      ? new Date(lastUpdated).toLocaleTimeString() // Freeze time on error
      : currentTime.toLocaleTimeString(); // Ticking time otherwise

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${isOpen ? 'h-full flex-1' : 'h-auto'}`}>
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-40 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${ledClass}`}></div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                {title}
                {!isOpen && (
                   <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                )}
            </h2>
            <div className="flex items-center gap-2">
                 <span className={`text-[10px] font-semibold tracking-tight ${status === 'error' ? 'text-rose-500' : 'text-slate-400'}`}>
                    Update: {displayTime}
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                    {data.length} MỐC
                </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
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
            <button onClick={onRefresh} className="p-2 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl border border-slate-100 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isOpen && (
      <>
        <div 
            ref={tableContainerRef}
            className={`flex-1 overflow-auto custom-scrollbar ${viewMode === 'table' ? 'bg-slate-50/50 cursor-grab active:cursor-grabbing' : 'bg-slate-50/50'}`}
            onMouseDown={viewMode === 'table' ? onMouseDown : undefined}
            onMouseLeave={viewMode === 'table' ? onMouseLeave : undefined}
            onMouseUp={viewMode === 'table' ? onMouseUp : undefined}
            onMouseMove={viewMode === 'table' ? onMouseMove : undefined}
        >
            {viewMode === 'table' ? (
            <table className="w-full text-left border-collapse select-none md:select-auto">
                <thead className="bg-slate-50 sticky top-0 z-30">
                <tr>
                    {tableKeys.map((key, idx) => (
                    <th key={key} className={`px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap ${idx === 0 ? 'sticky left-0 z-40 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] pl-6 text-left' : 'text-center'}`}>
                        {key}
                    </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                {data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
                    {tableKeys.map((key, colIdx) => (
                        <td key={key} className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(key, row[key], colIdx === 0)} ${colIdx === 0 ? 'pl-6' : ''}`}>
                            {formatValue(key, row[key])}
                        </td>
                    ))}
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            /* Card View for Hourly */
            <div className="p-3 md:p-4 space-y-4">
                {data.map((row, idx) => (
                    <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4">
                    <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                        <h3 className="text-base font-bold text-blue-900">{row[tableKeys[0]]}</h3>
                        <span className="text-[10px] font-bold text-slate-300">#{idx + 1}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                        {tableKeys.slice(1).map(key => (
                            <div key={key} className="flex flex-col">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 truncate">{key}</span>
                                <span className={`text-sm ${getCellStyle(key, row[key], false)}`}>{row[key]}</span>
                            </div>
                        ))}
                    </div>
                    </div>
                ))}
            </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-between items-center z-30">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.length} RECORDS</span>
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400">REALTIME MODE</span>
            </div>
        </div>
      </>
      )}
    </div>
  );
};
