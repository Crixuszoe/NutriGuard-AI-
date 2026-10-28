import React from 'react';
import { PhoneCall, X, AlertTriangle, ShieldAlert, HeartPulse, CheckCircle2 } from 'lucide-react';

interface EmergencyHotlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  poisonName?: string;
  chemicalFormula?: string;
}

export const EmergencyHotlineModal: React.FC<EmergencyHotlineModalProps> = ({
  isOpen,
  onClose,
  poisonName,
  chemicalFormula,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-rose-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-rose-950/70 border-b border-rose-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 animate-pulse">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Emergency Poison & Toxicity Hotline</h3>
              <p className="text-xs text-rose-300">
                24/7 Clinical Toxicology & First-Responder Direct Connect
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {poisonName && (
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-800/60">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                Flagged Toxic Agent
              </span>
              <p className="text-sm font-bold text-rose-400 mt-0.5">{poisonName}</p>
              {chemicalFormula && (
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  Formula: {chemicalFormula}
                </p>
              )}
            </div>
          )}

          {/* Quick Dial Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:18002221222"
              className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-3 shadow-lg shadow-rose-950/40 transition active:scale-95"
            >
              <PhoneCall className="w-6 h-6 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-200 block">
                  US National Poison Help
                </span>
                <span className="text-base font-black tracking-wide">1-800-222-1222</span>
              </div>
            </a>

            <a
              href="tel:911"
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white flex items-center gap-3 border border-slate-700 transition active:scale-95"
            >
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Emergency Medical Services
                </span>
                <span className="text-base font-black tracking-wide">Dial 911 / 112</span>
              </div>
            </a>
          </div>

          {/* Critical Triage Instructions */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              <span>Critical First-Responder Protocol</span>
            </h4>

            <ol className="space-y-2 text-slate-300 pl-4 list-decimal leading-relaxed">
              <li>
                <strong className="text-white">DO NOT INDUCE VOMITING: </strong> Unless explicitly
                instructed by toxicologist personnel, vomiting can cause esophageal rupture or
                chemical aspiration into lungs.
              </li>
              <li>
                <strong className="text-white">PRESERVE THE FOOD SAMPLE: </strong> Place the uneaten
                portion and packaging in a sealed ziplock container for hospital laboratory gas
                chromatography.
              </li>
              <li>
                <strong className="text-white">RECORD INGESTION TIMESTAMP: </strong> Inform
                physicians of the exact minute symptoms appeared (immediate onset vs delayed 6h
                hepatic toxicity).
              </li>
              <li>
                <strong className="text-white">MONITOR BREATHING & CONSCIOUSNESS: </strong> Position
                patient in left recovery position if drowsy or vomiting occurs.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
