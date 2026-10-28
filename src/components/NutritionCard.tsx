import React from 'react';
import { PieChart, Flame, Droplet, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { NutritionalAnalysis, UserHealthProfile } from '../types/food';

interface NutritionCardProps {
  nutrition: NutritionalAnalysis;
  userProfile?: UserHealthProfile;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ nutrition, userProfile }) => {
  const {
    servingSizeGrams,
    calories,
    proteinGrams,
    totalFatGrams,
    saturatedFatGrams,
    transFatGrams,
    oilPercentage,
    carbsGrams,
    dietaryFiberGrams,
    totalSugarsGrams,
    sodiumMilligrams,
    cholesterolMilligrams,
    potassiumMilligrams,
    calciumMilligrams,
    ironMilligrams,
    unhealthyFlags,
    macroRatio,
  } = nutrition;

  // Compute daily intake percentages
  const targetCalories = userProfile?.dailyCalorieTarget || 2000;
  const maxSodium = userProfile?.dailySodiumMaxMg || 2300;
  const calPercent = Math.min(100, Math.round((calories / targetCalories) * 100));
  const sodiumPercent = Math.min(100, Math.round((sodiumMilligrams / maxSodium) * 100));

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Nutritional Analysis</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Serving Size: <span className="text-slate-200 font-semibold">{servingSizeGrams}g</span>
            </p>
          </div>
        </div>

        {/* Calories Highlight */}
        <div className="text-right shrink-0">
          <div className="flex items-center justify-end gap-1 text-2xl font-black text-amber-400 tabular-nums">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>{calories}</span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
            Kcal ({calPercent}% of daily)
          </p>
        </div>
      </div>

      {/* Unhealthy Flags Alert */}
      {unhealthyFlags && unhealthyFlags.length > 0 && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200">
            <span className="font-semibold text-rose-300">Nutritional Risk Warning: </span>
            {unhealthyFlags.join(' · ')}
          </div>
        </div>
      )}

      {/* Macronutrient Visual Rings / Bars */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {/* Protein */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
            Protein
          </span>
          <p className="text-lg font-black text-slate-100 tabular-nums mt-1">
            {proteinGrams}g
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (proteinGrams / 50) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            {macroRatio?.proteinPct || Math.round((proteinGrams * 400) / (calories || 1))}% cal
          </span>
        </div>

        {/* Carbs */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Carbohydrates
          </span>
          <p className="text-lg font-black text-slate-100 tabular-nums mt-1">
            {carbsGrams}g
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (carbsGrams / 120) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Fiber: {dietaryFiberGrams}g
          </span>
        </div>

        {/* Total Fat & Oil */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Total Fat
          </span>
          <p className="text-lg font-black text-slate-100 tabular-nums mt-1">
            {totalFatGrams}g
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalFatGrams / 60) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Oil: {oilPercentage}%
          </span>
        </div>
      </div>

      {/* Detailed Nutrient Breakdown Grid */}
      <div className="rounded-2xl bg-slate-950/50 border border-slate-800/80 p-3.5 space-y-2.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Micronutrients & Lipid Profile
        </span>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-850 pb-1">
            <span className="text-slate-400">Saturated Fat</span>
            <span className="font-mono text-slate-200 tabular-nums">{saturatedFatGrams}g</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-850 pb-1">
            <span className="text-slate-400">Trans Fat</span>
            <span className={`font-mono tabular-nums ${transFatGrams > 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}`}>
              {transFatGrams}g
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-850 pb-1">
            <span className="text-slate-400">Sodium</span>
            <span className={`font-mono tabular-nums ${sodiumMilligrams > 800 ? 'text-amber-400 font-bold' : 'text-slate-200'}`}>
              {sodiumMilligrams}mg <span className="text-[10px] text-slate-500">({sodiumPercent}%)</span>
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-850 pb-1">
            <span className="text-slate-400">Cholesterol</span>
            <span className="font-mono text-slate-200 tabular-nums">{cholesterolMilligrams}mg</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-850 pb-1">
            <span className="text-slate-400">Sugars (Natural/Added)</span>
            <span className="font-mono text-slate-200 tabular-nums">{totalSugarsGrams}g</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-850 pb-1">
            <span className="text-slate-400">Potassium</span>
            <span className="font-mono text-slate-200 tabular-nums">{potassiumMilligrams}mg</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Calcium</span>
            <span className="font-mono text-slate-200 tabular-nums">{calciumMilligrams}mg</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Iron</span>
            <span className="font-mono text-slate-200 tabular-nums">{ironMilligrams}mg</span>
          </div>
        </div>
      </div>
    </div>
  );
};
