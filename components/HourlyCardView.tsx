
import React from 'react';

interface HourlyCardViewProps {
  data: any[];
  keys: string[];
  getCellStyle: (key: string, value: any, isFirstColumn: boolean) => string;
}

export const HourlyCardView: React.FC<HourlyCardViewProps> = ({
  data, keys, getCellStyle
}) => {
  return (
    <div className="p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((row, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="px-4 py-3 border-b border-slate-50 bg-blue-50/30 flex justify-between items-center">
            <h3 className="text-sm font-bold text-blue-900 truncate">{row[keys[0]]}</h3>
            <span className="text-[10px] font-bold text-slate-300">#{idx + 1}</span>
          </div>
          <div className="p-4 flex-1">
            <div className="bg-slate-50/80 rounded-xl p-3 grid grid-cols-2 gap-x-4 gap-y-3 border border-slate-100">
              {keys.slice(1).map((k, kIdx) => (
                <div key={k} className={`flex flex-col min-w-0 ${kIdx % 2 !== 0 ? 'text-right' : ''}`}>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5 truncate">{k}</span>
                  <span className={`text-[11px] font-semibold truncate ${getCellStyle(k, row[k], false)}`}>
                    {row[k]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
