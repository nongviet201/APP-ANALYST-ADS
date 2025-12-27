
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

interface HourlyTableProps {
  data: any[];
  title: string;
  isUpdating?: boolean;
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
  onExpand?: () => void;
  onRefresh?: () => void;
  status?: 'syncing' | 'success' | 'idle';
}

// Logic định dạng số liệu cho Báo Cáo Giờ
const formatValue = (key: string, value: any) => {
  return value;
};

// Logic style cho Báo Cáo Giờ (Có thể chỉnh màu khác với Ads)
const getCellStyle = (key: string, value: any, isFirstColumn: boolean) => {
  const lowerKey = key.toLowerCase();
  
  if (isFirstColumn) {
    // Cột đầu tiên của Giờ thường là Mốc thời gian, để màu xanh dương đậm
    return 'font-bold text-blue-900 bg-white sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]';
  }
  
  // Highlight số liệu tài chính
  if ((lowerKey.includes('lợi nhuận') || lowerKey.includes('%') || lowerKey.includes('roi') || lowerKey.includes('chi phí') || lowerKey.includes('doanh thu')) && typeof value === 'string') {
    const num = parseFloat(value.replace(/[^0-9.-]+/g,""));
    if (!isNaN(num)) {
      if (num < 0) return 'text-rose-600 font-bold tabular-nums';
      if (lowerKey.includes('lợi nhuận') && num > 0) return 'text-emerald-600 font-bold tabular-nums';
    }
    return 'text-slate-700 font-semibold tabular-nums';
  }
  
  return 'text-slate-600';
};

export const HourlyTable: React.FC<HourlyTableProps> = ({ 
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
  // Báo cáo giờ thường ít cột hơn, ưu tiên bảng
  const [viewMode, setViewMode] = useState<'table'>('table'); 
  
  // Drag refs
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    if (status === 'success') {
      setLastSyncTime(new Date().toLocaleTimeString());
    }
  }, [status]);

  // Drag logic (Copy để giữ trải nghiệm mượt mà)
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
  const sheetUpdateTime = updatedKey && data.length > 0 ? data[0][updatedKey] : null;

  let ledClass = "bg-slate-300";
  if (status === 'syncing') ledClass = "bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]"; // Blue LED for Hourly
  if (status === 'success') ledClass = "bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.5)]";

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header Hourly - Màu chủ đạo xanh dương nhẹ khác với Ads */}
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${ledClass}`}></div>
          <div className="flex flex-col">
            <h2 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
                <span className="text-[10px] text-slate-400 font-semibold tracking-tight whitespace-nowrap">App sync: {lastSyncTime}</span>
                {sheetUpdateTime && (
                   <span className="text-[10px] text-blue-500 font-semibold tracking-tight md:border-l md:border-slate-200 md:pl-3 whitespace-nowrap">Sheet: {sheetUpdateTime}</span>
                )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button onClick={onRefresh} disabled={status === 'syncing'} className="p-2 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl border border-slate-100 transition-colors">
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

      {/* Main Content Area - Table Only for Hourly */}
      <div 
        ref={tableContainerRef}
        className="flex-1 overflow-auto custom-scrollbar bg-slate-50/50 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
          <table className="w-full text-left border-collapse select-none md:select-auto">
            <thead className="bg-slate-50 sticky top-0 z-30">
              <tr>
                {tableKeys.map((key, idx) => (
                  <th key={key} className={`px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap ${idx === 0 ? 'sticky left-0 z-40 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] pl-6' : ''}`}>
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
      </div>
      
      {/* Footer Simple */}
      <div className="px-5 py-3 border-t border-slate-100 bg-white flex justify-between items-center z-30">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.length} MỐC THỜI GIAN</span>
        <div className="flex items-center gap-2">
           <div className={`w-1.5 h-1.5 rounded-full ${status === 'syncing' ? 'bg-blue-400 animate-pulse' : 'bg-slate-200'}`}></div>
           <span className="text-[9px] font-bold text-slate-400">{status === 'syncing' ? 'UPDATING...' : 'READY'}</span>
        </div>
      </div>
    </div>
  );
};
