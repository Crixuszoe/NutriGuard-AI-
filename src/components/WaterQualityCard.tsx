import React from 'react';
import { Droplets, ShieldCheck, AlertCircle, Gauge, Activity } from 'lucide-react';
import { WaterOrLiquidQuality } from '../types/food';

interface WaterQualityCardProps {
  waterData?: WaterOrLiquidQuality;
}

export const WaterQualityCard: React.FC<WaterQualityCardProps> = ({ waterData }) => {
  if (!waterData) return null;

  const {
    phLevel,
    tdsPpm,
    chlorineRisk,
    heavyMetalsStatus,
    bacterialColiformStatus,
    drinkabilityStatus,
  } = waterData;

  const isPhOptimal = phLevel >= 6.5 && phLevel <= 8.5;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Water & Liquid Purity Testing</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hydration Spectrometry & Dissolved Contaminant Analysis
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Certified Pure
          </span>
        </div>
      </div>

      {/* Main Meters Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* pH Level */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>pH Balance</span>
            <span className={isPhOptimal ? 'text-emerald-400' : 'text-amber-400'}>
              {isPhOptimal ? 'Optimal Neutral' : 'Imbalanced'}
            </span>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tabular-nums">
            {phLevel} <span className="text-xs text-slate-500 font-normal">pH</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (phLevel / 14) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">WHO Target: 6.5 - 8.5</span>
        </div>

        {/* Total Dissolved Solids (TDS) */}
        <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>TDS Concentration</span>
            <span className="text-emerald-400 font-mono">Clean Spring</span>
          </div>
          <div className="text-2xl font-black text-slate-100 font-mono tabular-nums">
            {tdsPpm} <span className="text-xs text-slate-500 font-normal">PPM</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (tdsPpm / 500) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Ideal Mineral Range: 50-300 PPM</span>
        </div>
      </div>

      {/* Heavy Metals & Microbiology Checks */}
      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
        <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
          <span className="text-slate-400">Heavy Metals (Lead, Arsenic, Cadmium)</span>
          <span className="text-emerald-400 font-semibold">{heavyMetalsStatus}</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
          <span className="text-slate-400">Coliform Bacteria / E. coli</span>
          <span className="text-emerald-400 font-semibold">{bacterialColiformStatus}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Residual Free Chlorine</span>
          <span className="text-slate-300 font-semibold">{chlorineRisk}</span>
        </div>
      </div>

      {/* Drinkability Verdict */}
      <div className="mt-3.5 p-3 rounded-2xl bg-blue-950/40 border border-blue-800/40 flex items-center gap-2.5 text-xs text-blue-200">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="font-medium">{drinkabilityStatus}</span>
      </div>
    </div>
  );
};
