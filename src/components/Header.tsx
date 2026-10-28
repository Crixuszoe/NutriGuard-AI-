import React, { useState } from 'react';
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
  Menu,
  X,
  ChevronRight,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavAction = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Brand Wordmark */}
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-400">
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

          {/* Action Zone: Clean, un-crammed layout */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Desktop Frame Mode Switcher */}
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

            {/* Trial & Stellar Badge (Responsive) */}
            {isPaidLicense ? (
              <button
                onClick={onOpenStellarPaywall || onOpenSubscription}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Coins className="w-3.5 h-3.5 text-slate-950" />
                <span>Stellar Pro</span>
              </button>
            ) : isTrialExpired ? (
              <button
                onClick={onOpenStellarPaywall || onOpenSubscription}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-sm animate-pulse transition active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Unlock Pro</span>
              </button>
            ) : (
              <button
                onClick={onOpenStellarPaywall || onOpenSubscription}
                title="14-Day Free Trial Active. Tap to view Stellar options."
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{trialDaysRemaining}d Trial</span>
              </button>
            )}

            {/* Desktop Profile Icon */}
            <button
              onClick={onOpenProfile}
              title="User Profile"
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 items-center justify-center border border-slate-700 transition hidden sm:flex"
            >
              <User className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger / Quick Drawer Trigger (lg:hidden) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 flex items-center justify-center border border-slate-700 transition active:scale-95 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Sheet (Only on small screens) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop click to dismiss */}
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />

          {/* Drawer Sheet */}
          <div className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-bold text-white text-sm">Quick Menu & Navigation</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mobile Quick Action Buttons Grid */}
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                onClick={() => handleMobileNavAction(onOpenChat)}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-left hover:border-emerald-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">Google Chat Community</span>
                    <span className="text-[11px] text-slate-400">Support rooms & safety alerts</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleMobileNavAction(onOpenAlerts)}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-left hover:border-rose-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">Safety Radar</span>
                    <span className="text-[11px] text-slate-400">Global contamination bulletins</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleMobileNavAction(onOpenHistory)}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-left hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">Encrypted Records</span>
                    <span className="text-[11px] text-slate-400">Past forensic scan history</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleMobileNavAction(onOpenProfile)}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-left hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-100 block">User Health Profile</span>
                    <span className="text-[11px] text-slate-400">Allergies, goals, dietary restrictions</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleMobileNavAction(onOpenAdmin || (() => {}))}
                className="w-full p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-left hover:bg-cyan-950/60 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-cyan-200 block">Admin Command Dashboard</span>
                    <span className="text-[11px] text-cyan-400/80">Food safety telemetry & anomaly radar</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-400" />
              </button>

              <button
                onClick={() => handleMobileNavAction(onOpenStellarPaywall || onOpenSubscription)}
                className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-left hover:bg-amber-500/20 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-200 block">Stellar Blockchain Subscription</span>
                    <span className="text-[11px] text-amber-400/80">
                      {isPaidLicense ? 'Stellar Verified Active' : `${trialDaysRemaining} days remaining in trial`}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
