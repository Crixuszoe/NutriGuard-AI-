import React from 'react';
import { ShieldCheck, Sparkles, Clock, Coins, ArrowRight, Lock, LayoutDashboard } from 'lucide-react';
import { TrialStatusResponse } from '../services/api';

interface TrialBannerProps {
  trialStatus: TrialStatusResponse | null;
  onOpenStellarPaywall: () => void;
  onOpenAdmin?: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({
  trialStatus,
  onOpenStellarPaywall,
  onOpenAdmin,
}) => {
  if (!trialStatus) return null;

  const isPaid = trialStatus.isPaid;
  const isExpired = trialStatus.isExpired;
  const daysLeft = trialStatus.daysRemaining ?? 14;

  if (isPaid) {
    return (
      <div className="w-full mb-3 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between gap-2.5 text-xs shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="font-bold text-slate-100 truncate">{trialStatus.plan}</span>
            <span className="text-slate-500 hidden sm:inline">·</span>
            <span className="text-[11px] text-emerald-400/90 font-mono hidden sm:inline">
              Stellar Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenStellarPaywall}
            className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
          >
            <Coins className="w-3 h-3 text-amber-400" />
            <span className="text-[11px]">Stellar Sub</span>
          </button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="w-full mb-3 p-3 rounded-2xl bg-rose-950/70 border border-rose-500/40 flex items-center justify-between gap-2.5 text-xs shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-xs truncate">14-Day Free Trial Expired</p>
            <p className="text-[11px] text-rose-300/80 truncate">Unlock AI scanning with Stellar (XLM)</p>
          </div>
        </div>
        <button
          onClick={onOpenStellarPaywall}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:brightness-110 text-slate-950 font-bold text-xs shrink-0 flex items-center gap-1.5 shadow"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Unlock (25 XLM)</span>
        </button>
      </div>
    );
  }

  // Active 14-Day Free Trial (Ultra-clean, compact, thumb-friendly)
  return (
    <div className="w-full mb-3 px-3.5 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-bold text-slate-200 text-xs">14-Day Free Trial</span>
            <span className="text-slate-500 hidden sm:inline">·</span>
            <span className="text-[11px] text-cyan-400 font-mono">
              {daysLeft} days left
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden sm:block">
            Full forensic toxicology & nutrition features unlocked
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            title="Open Admin Command"
            className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-400 text-[11px] font-semibold border border-slate-700 hidden sm:flex items-center gap-1"
          >
            <LayoutDashboard className="w-3 h-3" />
            <span>Admin</span>
          </button>
        )}
        <button
          onClick={onOpenStellarPaywall}
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
        >
          <Coins className="w-3 h-3 text-amber-400" />
          <span>Pay Stellar</span>
        </button>
      </div>
    </div>
  );
};
