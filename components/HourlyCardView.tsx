
import React from 'react';

interface HourlyCardViewProps {
  data: any[];
  keys: string[];
  getCellStyle: (key: string, value: any, isFirstColumn: boolean) => string;
}

export const HourlyCardView: React.FC<HourlyCardViewProps> = ({
  data, keys, getCellStyle
}) => {

  // Helper function: Logic màu nền
  const getBlockStyle = (key: string, value: any) => {
    const lowerKey = key.toLowerCase();
    const strVal = String(value);
    const num = parseFloat(strVal.replace(/[^0-9.-]+/g, ""));
    const isNum = !isNaN(num);

    // 1. Lợi nhuận (Profit) - Xanh/Đỏ
    if (lowerKey.includes('lợi nhuận') || lowerKey.includes('profit')) {
        if (isNum && num < 0) return 'bg-rose-100 border-rose-200'; 
        if (isNum && num > 0) return 'bg-emerald-100 border-emerald-200';
    }

    // 2. Doanh thu / Đơn hàng - Xanh dương (Giữ nguyên theo yêu cầu)
    if (lowerKey.includes('doanh thu') || lowerKey.includes('doanh số') || lowerKey.includes('đơn')) {
         return 'bg-blue-50 border-blue-100'; 
    }

    // 3. Các chỉ số còn lại (Giá Mess, CP/DS...) - Trả về bình thường (Xám nhạt)
    return 'bg-slate-50/60 border-slate-100';
  };

  // Helper function: Màu chữ tiêu đề
  const getLabelColor = (key: string) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('lợi nhuận')) return 'text-slate-600';
      if (lowerKey.includes('doanh thu') || lowerKey.includes('đơn')) return 'text-blue-800/60';
      return 'text-slate-400';
  };

  return (
    <div className="p-3 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-20 select-none">
      {data.map((row, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full active:scale-[0.99] transition-transform duration-200">
          
          {/* Header: Time Frame */}
          <div className="px-4 py-3 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-sm font-black text-blue-900 truncate tracking-tight">{row[keys[0]]}</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">#{idx + 1}</span>
          </div>

          {/* Body: Metrics */}
          <div className="p-4 flex-1">
            <div className="grid grid-cols-2 gap-2.5">
              {keys.slice(1).map((k, kIdx) => {
                 const value = row[k];
                 const bgClass = getBlockStyle(k, value);
                 const labelColor = getLabelColor(k);

                 return (
                    <div key={k} className={`flex flex-col items-center justify-center text-center px-1 py-2.5 rounded-xl border ${bgClass}`}>
                      <span className={`text-[9px] font-bold uppercase tracking-widest mb-1 truncate w-full ${labelColor}`}>{k}</span>
                      <span className={`text-[13px] font-bold truncate w-full ${getCellStyle(k, row[k], false)}`}>
                        {row[k]}
                      </span>
                    </div>
                 );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
