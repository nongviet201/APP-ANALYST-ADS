
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

  // Logic tìm cột ID để hiển thị dưới tên chiến dịch (giống CardView) và ẩn khỏi các cột chỉ số
  const idCampaignKey = restKeys.find(k => {
      const lower = k.toLowerCase();
      return (lower.includes('id') && lower.includes('campaign')) || lower.includes('chiến dịch id');
  });

  // Các cột chỉ số còn lại (loại bỏ ID vì đã gộp vào cột đầu)
  const metricKeys = restKeys.filter(k => k !== idCampaignKey);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
  };

  return (
    <table className="w-full text-left border-collapse select-none">
      <thead className="bg-slate-50 sticky top-0 z-30 shadow-sm">
        <tr>
          {/* CỘT GỘP: INFO (Tài khoản + Chiến dịch + Trạng thái) */}
          <th onClick={() => onSort(accountKey)} className="px-4 py-3 md:px-6 text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap sticky left-0 z-40 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] pl-5 text-left cursor-pointer hover:bg-slate-100 transition-colors group w-[350px] md:w-[450px]">
            <div className="flex items-center gap-1.5">
              THÔNG TIN CHIẾN DỊCH
              <span className={`transition-opacity ${sortConfig.key === accountKey ? 'opacity-100 text-indigo-500' : 'opacity-0 group-hover:opacity-40'}`}>
                {sortConfig.key === accountKey && sortConfig.direction === 'desc' ? '↓' : '↑'}
              </span>
            </div>
          </th>

          {/* Các cột chỉ số (Metrics) */}
          {metricKeys.map(key => (
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
          const campaignName = campaignNameKey ? row[campaignNameKey] : '';
          const idValue = idCampaignKey ? row[idCampaignKey] : '';

          // Màu sắc Tên tài khoản
          let accountColorClass = 'text-slate-700'; 
          if (hasError) accountColorClass = 'text-rose-600';
          else if (isActive) accountColorClass = 'text-emerald-600';

          return (
            <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
              {/* CỘT GỘP: Hiển thị Horizontal (Nằm ngang) */}
              <td className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap sticky left-0 z-20 bg-white group-hover:bg-indigo-50/40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] align-middle ${getCellStyle(accountKey, row[accountKey], true)}`}>
                 <div className="flex flex-col items-start gap-1 w-full max-w-[320px] md:max-w-[420px]">
                    {/* Dòng 1: Tài khoản | Chiến dịch | Dot (Nằm ngang, không wrap) */}
                    <div className="flex items-center w-full gap-2">
                        {/* 1. Account Name */}
                        <span className={`font-black uppercase text-[11px] md:text-[12px] whitespace-nowrap flex-shrink-0 ${accountColorClass}`}>
                            {row[accountKey]}
                        </span>
                        
                        {/* Separator */}
                        <span className="text-slate-300 text-[10px] flex-shrink-0">|</span>
                        
                        {/* 2. Campaign Name (Truncated) */}
                        <span className="font-bold text-slate-800 text-[11px] md:text-[13px] truncate flex-1 min-w-0" title={campaignName}>
                            {campaignName || '-'}
                        </span>

                        {/* 3. Status Dot */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : (hasError ? 'bg-rose-500' : 'bg-slate-300')}`}></div>
                    </div>

                    {/* Dòng 2: ID hoặc Lỗi */}
                    <div className="w-full">
                        {hasError ? (
                            <span className="text-[10px] text-rose-500 font-medium italic block w-full truncate">
                                {errorText}
                            </span>
                        ) : (
                            idValue && (
                                <div 
                                    onClick={(e) => handleCopyId(e, idValue)}
                                    className="group/id flex items-center gap-1.5 w-fit cursor-copy hover:bg-slate-100 rounded px-1 -ml-1 py-0.5 transition-all active:scale-95 active:bg-indigo-50"
                                    title="Click để sao chép ID"
                                >
                                    <span className="text-[10px] text-slate-400 font-mono tracking-tight group-hover/id:text-indigo-600 group-hover/id:font-bold transition-colors">
                                        {idValue}
                                    </span>
                                    <svg className="w-2.5 h-2.5 text-indigo-400 opacity-0 group-hover/id:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )
                        )}
                    </div>
                 </div>
              </td>

              {/* Các cột chỉ số */}
              {metricKeys.map(k => (
                <td key={k} className={`px-4 py-3 md:px-6 text-xs md:text-sm whitespace-nowrap ${getCellStyle(k, row[k], false)}`}>
                    {row[k]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
