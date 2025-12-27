
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
    <div className="p-3 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-20">
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
            <div className="px-4 pt-4 pb-2 flex flex-col items-start text-left">
                {/* Dòng 1: Tên TK - Tên CD - Dot (Inline layout) */}
                <div className="flex flex-wrap items-center justify-start gap-1.5 leading-tight w-full pr-8">
                    {/* Account Name */}
                    <span className={`text-[13px] font-black uppercase whitespace-nowrap ${accountColorClass}`}>
                        {accountName}
                    </span>
                    
                    {/* Separator */}
                    {campaignName && <span className="text-slate-300 text-[10px]">•</span>}
                    
                    {/* Campaign Name */}
                    {campaignName && (
                        <span className="text-[13px] font-bold text-slate-800 break-words">
                            {campaignName}
                        </span>
                    )}

                    {/* Status Dot (Sau cùng) - Neon Effect & Bigger 
                        Update: Removed mt-0.5 for vertical centering, added ml-1.5 for spacing 
                    */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-1.5 ${isActive ? 'bg-emerald-400 shadow-[0_0_8px_1px_rgba(52,211,153,0.8)]' : (hasError ? 'bg-rose-500' : 'bg-slate-300')}`}></div>
                </div>

                {/* Dòng 2: ID hoặc Lỗi (Text Only - No Background) */}
                <div className="mt-0.5 min-h-[14px]">
                    {hasError ? (
                        <span className="text-[10px] text-rose-500 font-medium italic">
                            {errorText}
                        </span>
                    ) : (
                        idCampaignValue && (
                            <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                                {idCampaignValue}
                            </span>
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
