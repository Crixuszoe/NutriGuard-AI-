import React, { useRef } from 'react';
import {
  ShieldAlert,
  Salad,
  PieChart,
  HeartPulse,
  ClockAlert,
  Droplets,
  Link2,
  BellRing,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AnalysisMode } from '../types/food';

export type SliderMode = AnalysisMode | 'alerts' | 'chat';

interface FeatureSliderProps {
  activeMode: SliderMode;
  onSelectMode: (mode: SliderMode) => void;
}

interface FeatureItem {
  id: SliderMode;
  title: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  highlightText: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'poison',
    title: 'Poison Detection',
    tagline: 'Toxins & Chemicals',
    icon: ShieldAlert,
    accentColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    highlightText: 'Chemical & Biotoxin Forensic Scan',
  },
  {
    id: 'ingredients',
    title: 'Ingredient Detection',
    tagline: 'Additives & Allergens',
    icon: Salad,
    accentColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    highlightText: 'Weight, Quality & Freshness Breakdown',
  },
  {
    id: 'nutrition',
    title: 'Nutritional Analysis',
    tagline: 'Macros & Calories',
    icon: PieChart,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    highlightText: 'Fat %, Oil Content, Sodium & Micronutrients',
  },
  {
    id: 'health',
    title: 'User Health Advice',
    tagline: 'Personalized AI Diet',
    icon: HeartPulse,
    accentColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    highlightText: 'Goal Alignment & Portion Control Guidance',
  },
  {
    id: 'chat',
    title: 'Community & Chat',
    tagline: 'Safety Rooms & Tips',
    icon: MessageSquare,
    accentColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    highlightText: 'Public & Private Support Rooms',
  },
  {
    id: 'spoilage',
    title: 'Spoilage & Expiry',
    tagline: 'Freshness & Storage',
    icon: ClockAlert,
    accentColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    highlightText: 'Decay Estimation & Cold-Chain Protocol',
  },
  {
    id: 'water',
    title: 'Water & Beverage',
    tagline: 'pH & Heavy Metals',
    icon: Droplets,
    accentColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    highlightText: 'TDS ppm, Lead/Arsenic & Coliform Check',
  },
  {
    id: 'blockchain',
    title: 'Blockchain Audit',
    tagline: 'Farm-to-Plate Trace',
    icon: Link2,
    accentColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    highlightText: 'Cryptographic Ledger & Organic Origin',
  },
  {
    id: 'alerts',
    title: 'Contamination Radar',
    tagline: 'Global Recalls & Reports',
    icon: BellRing,
    accentColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    highlightText: 'Real-time FDA/EFSA/WHO Alerts',
  },
];

export const FeatureSlider: React.FC<FeatureSliderProps> = ({ activeMode, onSelectMode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full">
      {/* Slider Header bar */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Analysis Suite
          </span>
          <span className="text-xs text-slate-500">· Select active scanner mode</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll features left"
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll features right"
            className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x scroll-smooth"
        role="tablist"
        aria-label="Feature Selection Slider"
      >
        {FEATURES.map((feat) => {
          const Icon = feat.icon;
          const isActive = activeMode === feat.id;

          return (
            <button
              key={feat.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectMode(feat.id)}
              className={`shrink-0 snap-start text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer min-w-[170px] max-w-[210px] flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-800/95 border-emerald-500/80 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                  : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isActive ? feat.accentColor : 'bg-slate-800 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isActive && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100 tracking-tight leading-tight whitespace-nowrap truncate">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap truncate">
                  {feat.tagline}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
