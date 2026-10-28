import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FlaskConical,
  Clock,
  Activity,
  HeartCrack,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import { PoisonDetails } from '../types/food';

interface PoisonAnalysisCardProps {
  poison: PoisonDetails;
  foodName: string;
  safetyScore: number;
  onOpenEmergency: () => void;
  onOpenChat?: () => void;
}

export const PoisonAnalysisCard: React.FC<PoisonAnalysisCardProps> = ({
  poison,
  foodName,
  safetyScore,
  onOpenEmergency,
  onOpenChat,
}) => {
  const isDetected = poison.detected;

  return (
    <div
      className={`w-full rounded-3xl p-5 border shadow-xl backdrop-blur-md transition-all ${
        isDetected
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-100 ring-1 ring-rose-500/20'
          : 'bg-slate-900/90 border-slate-800 text-slate-100'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
              isDetected
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isDetected ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Poison & Chemical Safety Analysis
              </h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isDetected
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isDetected ? 'Contaminant Alert' : 'Bio-Safe Certified'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <span className="text-slate-200 font-medium">{foodName}</span>
            </p>
          </div>
        </div>

        {/* Safety Score Meter */}
        <div className="text-right shrink-0">
          <div className="text-xl font-black tabular-nums tracking-tight">
            <span
              className={
                safetyScore > 75
                  ? 'text-emerald-400'
                  : safetyScore > 40
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }
            >
              {safetyScore}
            </span>
            <span className="text-xs text-slate-500">/100</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Safety Index</p>
        </div>
      </div>

      {/* When Poison / Hazard is Detected */}
      {isDetected ? (
        <div className="space-y-4">
          {/* Critical Banner */}
          <div className="p-3.5 rounded-2xl bg-rose-900/60 border border-rose-700/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-200 leading-relaxed">
              <strong className="font-semibold block text-white mb-0.5">
                HAZARDOUS COMPOUND DETECTED: {poison.poisonName}
              </strong>
              This sample contains active toxicological markers dangerous to human health. Do not
              ingest, lick, or swallow this food item.
            </div>
          </div>

          {/* Forensic Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <FlaskConical className="w-3.5 h-3.5 text-rose-400" />
                <span>Chemical Formula</span>
              </div>
              <p className="font-mono text-xs font-semibold text-rose-300 break-all">
                {poison.chemicalFormula || 'Unknown Compound'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Concentration</span>
              </div>
              <p className="font-mono text-xs font-bold text-slate-100 tabular-nums">
                {poison.estimatedConcentrationPpm} <span className="text-[10px] text-slate-400">PPM</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Estimated Added</span>
              </div>
              <p className="text-xs font-medium text-slate-200 truncate">
                {poison.estimatedTimeAdded || 'Recent incubation'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                <HeartCrack className="w-3.5 h-3.5 text-rose-400" />
                <span>Severity Level</span>
              </div>
              <p className="text-xs font-bold text-rose-400 truncate">
                {poison.severityLevel || 'High Danger'}
              </p>
            </div>
          </div>

          {/* Health Risks & Symptoms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block mb-2">
                Potential Health Risks
              </span>
              <ul className="space-y-1.5">
                {poison.healthRisks?.map((risk, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold shrink-0">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-2">
                Exposure Symptoms
              </span>
              <ul className="space-y-1.5">
                {poison.symptoms?.map((symp, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>{symp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Immediate Emergency Countermeasures */}
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/60">
            <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block mb-2">
              Immediate Safety & Clinical Antidote Protocol
            </span>
            <ul className="space-y-1.5 mb-3">
              {poison.immediateEmergencyMeasures?.map((action, idx) => (
                <li key={idx} className="text-xs text-rose-100 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>

            {poison.antidoteOrTreatment && (
              <div className="mt-2 text-xs text-slate-300 border-t border-rose-800/50 pt-2 font-mono">
                <span className="text-amber-400 font-semibold">Recommended Clinical Antidote: </span>
                {poison.antidoteOrTreatment}
              </div>
            )}

            {/* Emergency Hotline Trigger & Google Chat Alert */}
            <div className="mt-3.5 pt-3 border-t border-rose-800/60 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-rose-300">
                Poison Control Assistance: <span className="font-bold text-white">1-800-222-1222</span>
              </div>
              <div className="flex items-center gap-2">
                {onOpenChat && (
                  <button
                    onClick={onOpenChat}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send to Google Chat</span>
                  </button>
                )}
                <button
                  onClick={onOpenEmergency}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-900/50 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Open Emergency Sheet</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* When Food is Certified Pure & Safe */
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold text-emerald-300">
                ZERO TOXIC CONTAMINANTS DETECTED
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Spectrometric and image-level analysis shows no hazardous biotoxins (amatoxins,
                cyanogenic glycosides), heavy metal salts (lead, mercury, cadmium), synthetic
                pesticides, or volatile food adulterants.
              </p>
            </div>
            {onOpenChat && (
              <button
                onClick={onOpenChat}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Share to Chat</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[10px] text-slate-400">Purity Score</p>
              <p className="font-bold text-emerald-400 text-sm mt-0.5">{safetyScore}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[10px] text-slate-400">Biological Risk</p>
              <p className="font-bold text-emerald-400 text-sm mt-0.5">Negligible</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[10px] text-slate-400">Status</p>
              <p className="font-bold text-emerald-400 text-sm mt-0.5">Approved</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
