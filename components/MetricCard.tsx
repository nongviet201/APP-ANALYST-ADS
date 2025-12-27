import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: string; 
  status?: 'good' | 'bad' | 'neutral';
  icon?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, status = 'neutral', icon }) => {
  // Styles for the icon bubble
  let iconBg = "bg-slate-100 text-slate-500";
  if (status === 'good') iconBg = "bg-emerald-100 text-emerald-600";
  if (status === 'bad') iconBg = "bg-rose-100 text-rose-600";

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 flex items-start justify-between group">
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</h3>
        <div className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
          {value}
        </div>
      </div>
      
      {icon && (
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${iconBg} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      )}
    </div>
  );
};