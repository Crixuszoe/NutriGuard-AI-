import React from 'react';
import {
  ShieldCheck,
  Smartphone,
  Maximize2,
  User,
  Zap,
  BellRing,
  History,
  MessageSquare,
  Coins,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';

interface HeaderProps {
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfile: () => void;
  onOpenSubscription: () => void;
  onOpenAlerts: () => void;
  onOpenHistory: () => void;
  onOpenChat: () => void;
  onOpenStellarPaywall?: () => void;
  onOpenAdmin?: () => void;
  currentPlan: string;
  trialDaysRemaining?: number;
  isTrialExpired?: boolean;
  isPaidLicense?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileFrame,
  onToggleMobileFrame,
  onOpenProfile,
  onOpenSubscription,
  onOpenAlerts,
  onOpenHistory,
  onOpenChat,
  onOpenStellarPaywall,
  onOpenAdmin,
  currentPlan,
  trialDaysRemaining = 14,
  isTrialExpired = false,
  isPaidLicense = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
              NutriGuard<span className="text-emerald-400">.ai</span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single-line unboxed) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={onOpenChat}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap flex items-center gap-1.5 text-emerald-400 font-bold"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Google Chat</span>
          </button>
          <button
            onClick={onOpenAlerts}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <BellRing className="w-3.5 h-3.5 text-rose-400" />
            <span>Safety Radar</span>
          </button>
          <button
            onClick={onOpenHistory}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Encrypted Records</span>
          </button>
          <button
            onClick={onOpenProfile}
            className="hover:text-emerald-400 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5" />
            <span>Health Profile</span>
          </button>
          <button
            onClick={onOpenAdmin}
            className="hover:text-cyan-300 text-cyan-400 font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Command</span>
          </button>
        </nav>

        {/* Zone 3: Actions & Frame Mode Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Admin Icon Button on Mobile */}
          <button
            onClick={onOpenAdmin}
            title="Open Admin Command Dashboard"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30 transition md:hidden"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>

          {/* Google Chat Icon Button on Mobile */}
          <button
            onClick={onOpenChat}
            title="Open Google Chat"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition md:hidden"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          {/* Frame Toggle */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? 'Expand to Desktop View' : 'Simulate Mobile Device Frame'}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition"
          >
            {isMobileFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Full View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mobile Frame</span>
              </>
            )}
          </button>

          {/* Stellar Paywall & Trial Badge Button */}
          {isPaidLicense ? (
            <button
              onClick={onOpenStellarPaywall || onOpenSubscription}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 text-xs font-bold shadow-sm transition active:scale-95"
            >
              <Coins className="w-3.5 h-3.5 text-slate-950" />
              <span>Stellar Pro</span>
            </button>
          ) : isTrialExpired ? (
            <button
              onClick={onOpenStellarPaywall || onOpenSubscription}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-sm animate-pulse transition active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Trial Expired • Unlock</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenStellarPaywall || onOpenSubscription}
                title="14-Day Free Trial Active. Click to view Stellar Blockchain options."
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition"
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{trialDaysRemaining}d Trial</span>
              </button>

              <button
                onClick={onOpenStellarPaywall || onOpenSubscription}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Coins className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pay Stellar</span>
              </button>
            </div>
          )}

          {/* Profile Trigger */}
          <button
            onClick={onOpenProfile}
            title="User Profile"
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 flex items-center justify-center border border-slate-700 transition sm:flex hidden"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
