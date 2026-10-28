import React from 'react';
import { ScanLine, BellRing, History, User, PhoneCall } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'scan' | 'radar' | 'history' | 'profile';
  onSelectTab: (tab: 'scan' | 'radar' | 'history' | 'profile') => void;
  onOpenEmergency: () => void;
  unreadAlertsCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenEmergency,
  unreadAlertsCount = 3,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 max-w-lg mx-auto sm:rounded-t-3xl shadow-2xl">
      <div className="grid grid-cols-5 items-center h-16 px-2">
        {/* Tab 1: Scan */}
        <button
          onClick={() => onSelectTab('scan')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'scan' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ScanLine className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">Scan</span>
        </button>

        {/* Tab 2: Radar */}
        <button
          onClick={() => onSelectTab('radar')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors relative ${
            activeTab === 'radar' ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BellRing className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">Radar</span>
          {unreadAlertsCount > 0 && (
            <span className="absolute top-2 right-4 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
          )}
        </button>

        {/* Center: Emergency SOS Hotline Quick Dial */}
        <button
          onClick={onOpenEmergency}
          title="Emergency Poison Control"
          className="flex flex-col items-center justify-center -mt-5 min-h-[44px]"
        >
          <div className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/60 ring-4 ring-slate-950 transition transform active:scale-90">
            <PhoneCall className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-bold text-rose-400 tracking-tight mt-0.5">SOS 911</span>
        </button>

        {/* Tab 3: Records */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'history' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">Vault</span>
        </button>

        {/* Tab 4: Profile */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'profile' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-tight mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};
