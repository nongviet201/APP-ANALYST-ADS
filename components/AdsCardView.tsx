
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

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
  };

  return (
    <div className="p-3 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-20 select-none">
      {data.map((row, rowIdx) => {
        const isActive = row[statusKey]?.toString().toLowerCase() === 'active';
        const campaignName = campaignNameKey ? row[campaignNameKey] : '';
        const accountName = row[accountKey];
        
        const errorText = row[errorKey];
        const hasError = errorText && errorText.toString().trim().length > 0;

        // Tìm key chứa ID Campaign
        const idCampaignKey = restKeys.find(k => {
            const lower = k.toLowerCase();
            return (lower.includes('id') && lower.includes('campaign')) || lower.includes('chiến dịch id');
        });
        const idCampaignValue = idCampaignKey ? row[idCampaignKey] : '';

        // Lọc key hiển thị grid
        const displayKeys = restKeys.filter(k => k !== idCampaignKey);

        // Màu sắc Tên tài khoản theo trạng thái
        let accountColorClass = 'text-slate-700'; 
        if (hasError) accountColorClass = 'text-rose-600';
        else if (isActive) accountColorClass = 'text-emerald-600';

        return (
          <div key={rowIdx} className={`bg-white rounded-2xl border ${hasError ? 'border-rose-200 ring-1 ring-rose-50' : 'border-slate-100'} shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col h-full relative`}>
            
            {/* Absolute Rank Badge - Tiết kiệm diện tích header */}
            <div className="absolute top-2 right-2 z-10 opacity-60">
                 <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    #{rowIdx + 1}
                 </span>
            </div>
            
            {/* Header Compact: Account - Campaign Status (Căn trái) */}
            <div className="px-4 pt-4 pb-2 flex flex-col items-start text-left w-full">
                {/* Dòng 1: Tên TK | Tên CD | Dot (Horizontal & Single Line) */}
                <div className="flex items-center justify-start gap-2 w-full pr-8">
                    {/* Account Name */}
                    <span className={`text-[13px] font-black uppercase whitespace-nowrap flex-shrink-0 ${accountColorClass}`}>
                        {accountName}
                    </span>
                    
                    {/* Separator */}
                    <span className="text-slate-300 text-[10px] flex-shrink-0">|</span>
                    
                    {/* Campaign Name - Truncate to keep single line */}
                    <span className="text-[13px] font-bold text-slate-800 truncate flex-1 min-w-0" title={campaignName}>
                        {campaignName || '-'}
                    </span>

                    {/* Status Dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_1px_rgba(52,211,153,0.8)]' : (hasError ? 'bg-rose-500' : 'bg-slate-300')}`}></div>
                </div>

                {/* Dòng 2: ID hoặc Lỗi (Text Only) */}
                <div className="mt-0.5 min-h-[14px] w-full">
                    {hasError ? (
                        <span className="text-[10px] text-rose-500 font-medium italic block truncate">
                            {errorText}
                        </span>
                    ) : (
                        idCampaignValue && (
                            <div 
                                onClick={(e) => handleCopyId(e, idCampaignValue)}
                                className="group/id flex items-center gap-1.5 w-fit cursor-copy hover:bg-slate-50 rounded px-1 -ml-1 py-0.5 transition-all active:scale-95 active:bg-indigo-50"
                                title="Click để sao chép ID"
                            >
                                <span className="text-[10px] text-slate-400 font-mono tracking-tight group-hover/id:text-indigo-600 group-hover/id:font-bold transition-colors truncate">
                                    {idCampaignValue}
                                </span>
                                <svg className="w-2.5 h-2.5 text-indigo-400 opacity-0 group-hover/id:opacity-100 transition-opacity flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Divider mờ */}
            <div className="mx-8 border-t border-slate-50 mb-2"></div>
            
            {/* Metrics Grid */}
            <div className="px-3 pb-3 flex-1 flex flex-col justify-end">
              <div className="grid grid-cols-2 gap-2">
                {displayKeys.map((k, idx) => {
                  const value = row[k];
                  const isKeyMetric = k.toLowerCase().includes('tin nhắn') || k.toLowerCase().includes('chi phí') || k.toLowerCase().includes('doanh thu');
                  // Highlight nhẹ cho chỉ số quan trọng
                  const isHighlight = isKeyMetric;
                  
                  return (
                    <div key={k} className={`flex flex-col items-center justify-center text-center px-1 py-2 rounded-lg border ${isHighlight ? 'bg-indigo-50/30 border-indigo-100/50' : 'bg-slate-50/30 border-slate-100/50'}`}>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate w-full">
                        {k}
                      </span>
                      <span className={`text-[13px] font-bold truncate w-full ${getCellStyle(k, value, false)}`}>
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
