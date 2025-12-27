
import React, { ReactNode, useState } from 'react';
import { TabView, SheetConfig } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  onOpenSettings: () => void;
  configs: { [key: string]: SheetConfig };
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onOpenSettings, configs }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const baseMenuItems = [
    { 
      id: TabView.HOURLY, 
      configKey: 'BC_GIỜ',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ), 
      label: 'Giờ' 
    },
    { 
      id: TabView.ADS, 
      configKey: 'Việt_Ads',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      ), 
      label: 'Ads' 
    },
    { 
      id: TabView.KNOWLEDGE, 
      configKey: '%Hòa_TT',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      ), 
      label: 'Kho' 
    },
  ];

  const menuItems = baseMenuItems.filter(item => {
    const config = configs[item.configKey];
    return config && config.isVisible !== false;
  });

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
      <aside 
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 z-50 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className={`h-16 flex items-center border-b border-slate-100 ${isSidebarOpen ? 'px-6 justify-between' : 'justify-center'}`}>
          {isSidebarOpen && (
            <div className="flex items-center gap-2.5 animate-fade-in">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-base font-bold text-slate-800 tracking-tight whitespace-nowrap">AdsTracker</h1>
            </div>
          )}
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
          >
            {isSidebarOpen ? (
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            ) : (
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            )}
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={!isSidebarOpen ? item.label : ''}
              >
                <span className={`transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                {isSidebarOpen && <span className="whitespace-nowrap animate-fade-in">{item.label}</span>}
                
                {!isSidebarOpen && isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 rounded-r-full"></div>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button 
            onClick={onOpenSettings} 
            className={`flex items-center ${isSidebarOpen ? 'justify-start gap-3 px-4' : 'justify-center'} py-3 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all`}
            title="Cấu hình"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
            {isSidebarOpen && <span className="animate-fade-in ml-3">Settings</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="md:hidden bg-white border-b border-slate-200 px-4 h-14 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">A</div>
             <span className="font-black text-slate-800 text-sm tracking-tight uppercase">AdsTracker</span>
          </div>
          <button onClick={onOpenSettings} className="p-2 text-slate-400 bg-slate-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </header>

        <main className="flex-1 overflow-hidden p-2 md:p-4 lg:p-5">
          <div className="w-full h-full flex flex-col">
             {children}
          </div>
        </main>

        <nav className="md:hidden bg-white border-t border-slate-100 flex justify-around p-2 pb-safe shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.03)] z-40">
           {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-1 px-5 rounded-2xl transition-all ${
                activeTab === item.id ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400'
              }`}
            >
              <span className="w-6 h-6 mb-0.5">{item.icon}</span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
