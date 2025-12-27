
import React from 'react';

interface AdsCardViewProps {
  data: any[];
  accountKey: string;
  campaignNameKey: string;
  statusKey: string;
  errorKey: string;
  restKeys: string[];
  getCellStyle: (key: string, value: any, isFirstColumn: boolean) => string;
}

export const AdsCardView: React.FC<AdsCardViewProps> = ({
  data, accountKey, campaignNameKey, statusKey, errorKey, restKeys, getCellStyle
}) => {
  return (
    <div className="p-3 md:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((row, rowIdx) => {
        const isActive = row[statusKey]?.toString().toLowerCase() === 'active';
        const displayName = campaignNameKey ? row[campaignNameKey] : row[accountKey];
        const displayId = row[accountKey];
        const errorText = row[errorKey];
        const hasError = errorText && errorText.toString().trim().length > 0;

        return (
          <div key={rowIdx} className={`bg-white rounded-2xl border ${hasError ? 'border-rose-100' : 'border-slate-100'} shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow`}>
            <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div className="flex flex-col min-w-0">
                <span className={`text-[11px] font-black uppercase tracking-widest truncate ${hasError ? 'text-rose-500' : 'text-emerald-500'}`}>{displayId}</span>
                {hasError && <span className="text-[9px] text-rose-500 font-medium italic truncate">{errorText}</span>}
              </div>
              <span className="text-[10px] font-bold text-slate-300 flex-shrink-0">#{rowIdx + 1}</span>
            </div>
            
            <div className="p-4 flex-1">
              <div className="flex items-start gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${isActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div>
                <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">{displayName}</h3>
              </div>
              
              <div className="bg-slate-50/80 rounded-xl p-3 grid grid-cols-2 gap-x-4 gap-y-3 border border-slate-100">
                {restKeys.map((k, idx) => {
                  const value = row[k];
                  const isKeyMetric = k.toLowerCase().includes('tin nhắn') || k.toLowerCase().includes('chi phí');
                  return (
                    <div key={k} className={`flex flex-col min-w-0 ${idx % 2 !== 0 ? 'text-right' : ''}`}>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5 truncate">{k}</span>
                      <span className={`text-[11px] font-semibold truncate ${getCellStyle(k, value, false)} ${isKeyMetric ? 'text-indigo-600' : ''}`}>
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
