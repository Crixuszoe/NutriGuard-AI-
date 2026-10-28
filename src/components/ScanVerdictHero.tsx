import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  Lock,
  Flame,
  Clock,
  Sparkles,
  Salad,
  PieChart,
  HeartPulse,
  Link2,
} from 'lucide-react';
import { FoodAnalysisResult, AnalysisMode } from '../types/food';

export type ResultCategoryTab = 'safety' | 'ingredients' | 'nutrition' | 'health' | 'traceability';

interface ScanVerdictHeroProps {
  analysis: FoodAnalysisResult;
  activeTab: ResultCategoryTab;
  onSelectTab: (tab: ResultCategoryTab) => void;
  onOpenEmergency: () => void;
  onOpenChat: () => void;
}

export const ScanVerdictHero: React.FC<ScanVerdictHeroProps> = ({
  analysis,
  activeTab,
  onSelectTab,
  onOpenEmergency,
  onOpenChat,
}) => {
  const isHazard = !analysis.isSafe || analysis.poisonAnalysis.detected;
  const score = analysis.safetyScore ?? (isHazard ? 24 : 92);

  const TABS: { id: ResultCategoryTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'safety', label: 'Safety & Toxins', icon: ShieldCheck },
    { id: 'ingredients', label: 'Ingredients', icon: Salad },
    { id: 'nutrition', label: 'Nutrition', icon: PieChart },
    { id: 'health', label: 'Health Advice', icon: HeartPulse },
    { id: 'traceability', label: 'Traceability', icon: Link2 },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Primary Verdict Hero Card */}
      <div
        className={`w-full rounded-2xl sm:rounded-3xl p-4 sm:p-5 border transition-all shadow-lg ${
          isHazard
            ? 'bg-rose-950/40 border-rose-500/40 text-rose-100 ring-1 ring-rose-500/30'
            : 'bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/20 border-slate-800 text-slate-100'
        }`}
      >
        {/* Top Meta: Food Name & Encryption badge */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Analysis Verdict
            </span>
            <span className="text-slate-600">·</span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate">
              {analysis.foodName}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400/90">
              AES-256 Vault
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Core Status & Score Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
                isHazard
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {isHazard ? (
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs sm:text-sm font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isHazard
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 ring-1 ring-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  }`}
                >
                  {isHazard ? 'Hazard Detected' : 'Safe to Consume'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {analysis.category || 'General Food'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-snug">
                {isHazard
                  ? analysis.poisonAnalysis.poisonName
                    ? `Warning: Contains ${analysis.poisonAnalysis.poisonName}. Do not consume.`
                    : 'Dangerous chemical or contamination identified. Seek emergency guidance.'
                  : 'Zero hazardous toxins identified. Pure bio-composition verified.'}
              </p>
            </div>
          </div>

          {/* Safety Score Dial */}
          <div className="flex items-center sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80 shrink-0">
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-black tabular-nums tracking-tight">
                <span
                  className={
                    score >= 75
                      ? 'text-emerald-400'
                      : score >= 45
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }
                >
                  {score}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/100</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                Safety Index
              </span>
            </div>

            {/* Quick action buttons right in the verdict card */}
            <div className="flex items-center gap-2 sm:mt-2">
              {isHazard ? (
                <button
                  onClick={onOpenEmergency}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-950/50 transition transform active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 911</span>
                </button>
              ) : null}
              <button
                onClick={onOpenChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs border border-slate-700 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Google Chat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Highlights Strip: Calories, Shelf life, Allergens */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Energy</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 tabular-nums">
              {analysis.nutritionalAnalysis?.calories || 0} kcal
            </span>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Shelf Life</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-400 tabular-nums">
              {analysis.spoilageAndExpiry?.daysUntilExpiry ?? 3} Days
            </span>
          </div>

          <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Ingredients</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 tabular-nums">
              {analysis.ingredientAnalysis?.ingredients?.length || 0} Listed
            </span>
          </div>
        </div>
      </div>

      {/* Touch-Friendly Segmented View Tabs */}
      <div className="w-full">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex-1 shrink-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
