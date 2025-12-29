
import React from 'react';

interface HourlyTableViewProps {
  data: any[];
  keys: string[];
  sortConfig: { key: string; direction: 'asc' | 'desc' | null };
  onSort: (key: string) => void;
  getCellStyle: (key: string, value: any, isFirstColumn: boolean) => string;
}

export const HourlyTableView: React.FC<HourlyTableViewProps> = ({
  data, keys, sortConfig, onSort, getCellStyle
}) => {
  return (
    <table className="w-full text-left border-collapse select-none">
      <thead className="bg-slate-50 sticky top-0 z-30">
        <tr>
          {keys.map((key, idx) => (
            <th key={key} onClick={() => onSort(key)} className={`px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap cursor-pointer hover:bg-slate-100 transition-colors group ${idx === 0 ? 'sticky left-0 z-40 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] pl-6 text-left' : 'text-center'}`}>
              <div className={`flex items-center gap-1.5 ${idx === 0 ? 'justify-start' : 'justify-center'}`}>
                {key}
                <span className={`transition-opacity ${sortConfig.key === key ? 'opacity-100 text-blue-500' : 'opacity-0 group-hover:opacity-40'}`}>
                  {sortConfig.key === key && sortConfig.direction === 'desc' ? '↓' : '↑'}
                </span>
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {data.map((row, idx) => (
          <tr key={idx} className="hover:bg-blue-50/40 transition-colors">
            {keys.map((key, colIdx) => (
              <td key={key} className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(key, row[key], colIdx === 0)} ${colIdx === 0 ? 'pl-6' : ''}`}>
                {row[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
