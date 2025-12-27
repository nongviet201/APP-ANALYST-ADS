
import React from 'react';

interface AdsTableViewProps {
  data: any[];
  keys: string[];
  accountKey: string;
  campaignNameKey: string;
  statusKey: string;
  errorKey: string;
  restKeys: string[];
  sortConfig: { key: string; direction: 'asc' | 'desc' | null };
  onSort: (key: string) => void;
  getCellStyle: (key: string, value: any, isFirstColumn: boolean) => string;
}

export const AdsTableView: React.FC<AdsTableViewProps> = ({
  data, accountKey, campaignNameKey, statusKey, errorKey, restKeys, sortConfig, onSort, getCellStyle
}) => {
  return (
    <table className="w-full text-left border-collapse select-none md:select-auto">
      <thead className="bg-slate-50 sticky top-0 z-30">
        <tr>
          <th onClick={() => onSort(accountKey)} className="px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap sticky left-0 z-40 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] pl-5 text-left cursor-pointer hover:bg-slate-100 transition-colors group">
            <div className="flex items-center gap-1.5">
              {accountKey}
              <span className={`transition-opacity ${sortConfig.key === accountKey ? 'opacity-100 text-indigo-500' : 'opacity-0 group-hover:opacity-40'}`}>
                {sortConfig.key === accountKey && sortConfig.direction === 'desc' ? '↓' : '↑'}
              </span>
            </div>
          </th>
          <th className="px-2 py-3 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 text-center w-10">TT</th>
          {campaignNameKey && (
            <th onClick={() => onSort(campaignNameKey)} className="px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap text-center cursor-pointer hover:bg-slate-100 transition-colors group">
              <div className="flex items-center justify-center gap-1.5">
                {campaignNameKey}
                <span className={`transition-opacity ${sortConfig.key === campaignNameKey ? 'opacity-100 text-indigo-500' : 'opacity-0 group-hover:opacity-40'}`}>
                  {sortConfig.key === campaignNameKey && sortConfig.direction === 'desc' ? '↓' : '↑'}
                </span>
              </div>
            </th>
          )}
          {restKeys.map(key => (
            <th key={key} onClick={() => onSort(key)} className="px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap text-center cursor-pointer hover:bg-slate-100 transition-colors group">
              <div className="flex items-center justify-center gap-1.5">
                {key}
                <span className={`transition-opacity ${sortConfig.key === key ? 'opacity-100 text-indigo-500' : 'opacity-0 group-hover:opacity-40'}`}>
                  {sortConfig.key === key && sortConfig.direction === 'desc' ? '↓' : '↑'}
                </span>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {data.map((row, idx) => {
          const isActive = row[statusKey]?.toString().toLowerCase() === 'active';
          const errorText = row[errorKey];
          const hasError = errorText && errorText.toString().trim().length > 0;
          return (
            <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
              <td className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(accountKey, row[accountKey], true)}`}>
                <div className="flex flex-col">
                  <span className={hasError ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{row[accountKey]}</span>
                  {hasError && <span className="text-[9px] text-rose-500 italic mt-0.5 max-w-[150px] truncate block">{errorText}</span>}
                </div>
              </td>
              <td className="px-2 py-3 border-b border-slate-100 text-center w-10">
                <div className="flex justify-center"><div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></div></div>
              </td>
              {campaignNameKey && (
                <td className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(campaignNameKey, row[campaignNameKey], false)}`}>{row[campaignNameKey]}</td>
              )}
              {restKeys.map(k => (
                <td key={k} className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(k, row[k], false)}`}>{row[k]}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
