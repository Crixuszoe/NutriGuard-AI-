import React from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Clock, Coins, ArrowRight, Lock, LayoutDashboard } from 'lucide-react';
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
  const hoursLeft = trialStatus.hoursRemaining ?? 336;

  // Percentage of 14-day trial consumed (0% to 100%)
  const percentageLeft = Math.max(0, Math.min(100, Math.round((daysLeft / 14) * 100)));

  if (isPaid) {
    return (
      <div className="w-full mb-4 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-100">
              <span>{trialStatus.plan}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px]">
                Stellar On-Chain Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Unlimited toxicology scans, clinical chemical spectrometry, and real-time safety radar active.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-emerald-400 bg-slate-950/60 px-2 py-1 rounded-lg border border-emerald-500/20">
            {daysLeft > 365 ? 'Lifetime Access' : `${daysLeft} days remaining`}
          </span>
          <button
            onClick={onOpenStellarPaywall}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Stellar Sub</span>
          </button>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-rose-950/90 border border-rose-500/40 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <span>14-Day Free Trial Expired</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px]">
                AI Scanning Locked
              </span>
            </div>
            <p className="text-slate-300 text-xs mt-0.5">
              Your 14-day trial period has ended. Activate via Stellar (XLM / USDC) to restore unlimited forensic protection.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenStellarPaywall}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition active:scale-95"
        >
          <Coins className="w-4 h-4" />
          <span>Unlock with Stellar (25 XLM)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Active 14-Day Free Trial
  return (
    <div className="w-full mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
          <Sparkles className="w-4 h-4 text-cyan-300" />
        </div>
        <div>
          <div className="flex items-center gap-2 font-bold text-slate-100">
            <span>14-Day Free Trial Active</span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
              Full Forensic Access
            </span>
            <span className="hidden md:inline-flex px-1.5 py-0.5 rounded bg-slate-800 font-mono text-[9px] text-slate-400">
              Anti-Bypass HMAC-256
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>
              {daysLeft > 1 ? `${daysLeft} days remaining` : `${hoursLeft} hours remaining in your 2-week trial`}
            </span>
            <span>•</span>
            <span>All AI Toxicology & Spectrometry Features Unlocked</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Progress Bar */}
        <div className="hidden lg:flex flex-col items-end gap-1 w-32">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentageLeft}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{daysLeft}/14 Days Left</span>
        </div>

        {onOpenAdmin && (
          <button
            onClick={onOpenAdmin}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-cyan-400 hover:text-white border border-cyan-500/20 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
            title="Open Admin Operations & Telemetry Command"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        <button
          onClick={onOpenStellarPaywall}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white border border-cyan-500/30 font-semibold text-xs flex items-center gap-1.5 transition active:scale-95"
        >
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>Pay with Stellar</span>
        </button>
      </div>
    </div>
  );
};
