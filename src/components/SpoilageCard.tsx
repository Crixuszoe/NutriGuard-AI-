import React from 'react';
import { ClockAlert, ShieldAlert, ThermometerSnowflake, CheckCircle2 } from 'lucide-react';
import { SpoilageAndExpiry } from '../types/food';

interface SpoilageCardProps {
  spoilage: SpoilageAndExpiry;
  foodName: string;
}

export const SpoilageCard: React.FC<SpoilageCardProps> = ({ spoilage, foodName }) => {
  const {
    freshnessState,
    daysUntilExpiry,
    visualSpoilageIndicators,
    bacterialOrMoldRisk,
    recommendedStorage,
  } = spoilage;

  const isExpired = daysUntilExpiry <= 0 || freshnessState === 'hazardous' || freshnessState === 'spoiled';

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <ClockAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Spoilage & Expiry Detection</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="text-slate-200 font-semibold">{foodName}</span>
            </p>
          </div>
        </div>

        {/* Expiry Countdown Tag */}
        <div className="text-right shrink-0">
          <div
            className={`text-xl font-black tabular-nums tracking-tight ${
              isExpired ? 'text-rose-400' : daysUntilExpiry <= 2 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isExpired ? 'EXPIRED' : `${daysUntilExpiry} Days`}
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Estimated Shelf Life</p>
        </div>
      </div>

      {/* Freshness Status Banner */}
      <div
        className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between text-xs ${
          isExpired
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {isExpired ? <ShieldAlert className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span className="font-bold uppercase tracking-wider">
            Condition: {freshnessState}
          </span>
        </div>
        <span className="text-slate-400 font-mono">Microbial Risk: {bacterialOrMoldRisk}</span>
      </div>

      {/* Visual Spoilage Indicators */}
      {visualSpoilageIndicators && visualSpoilageIndicators.length > 0 && (
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Visual Morphological & Texture Indicators
          </span>
          <div className="space-y-1.5">
            {visualSpoilageIndicators.map((ind, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <span>{ind}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Storage */}
      <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
        <ThermometerSnowflake className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-slate-200 block mb-0.5">
            Cold-Chain & Storage Protocol
          </span>
          <p className="text-slate-400 leading-relaxed">{recommendedStorage}</p>
        </div>
      </div>
    </div>
  );
};
