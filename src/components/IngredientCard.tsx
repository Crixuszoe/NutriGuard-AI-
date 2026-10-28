import React from 'react';
import { Salad, AlertCircle, CheckCircle, Sparkles, Scale, ShieldAlert } from 'lucide-react';
import { IngredientAnalysis } from '../types/food';

interface IngredientCardProps {
  ingredientData: IngredientAnalysis;
  foodName: string;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({ ingredientData, foodName }) => {
  const { ingredients, freshnessScore, artificialAdditivesCount, detectedAllergens, preservativesPresent } =
    ingredientData;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Salad className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Ingredient Detection & Quality</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identified <span className="font-semibold text-slate-200">{ingredients?.length || 0}</span> components in {foodName}
            </p>
          </div>
        </div>

        {/* Freshness Gauge */}
        <div className="text-right shrink-0">
          <div className="text-xl font-black tabular-nums text-emerald-400 tracking-tight">
            {freshnessScore}%
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Freshness Score</p>
        </div>
      </div>

      {/* Allergen & Additive Warning Bars */}
      <div className="space-y-2 mb-4">
        {detectedAllergens && detectedAllergens.length > 0 ? (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <span className="font-semibold text-amber-300">Allergens Detected: </span>
              {detectedAllergens.join(', ')}
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero common allergens identified (nut, dairy, gluten, shellfish free)</span>
          </div>
        )}

        {artificialAdditivesCount > 0 && (
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-slate-200">Artificial Additives/Preservatives ({artificialAdditivesCount}): </span>
              {preservativesPresent?.join(', ') || 'Synthetic emulsifiers or synthetic antioxidants identified.'}
            </div>
          </div>
        )}
      </div>

      {/* Ingredient Table */}
      <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/60">
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>Identified Ingredient</span>
          <div className="flex items-center gap-6">
            <span>Weight</span>
            <span>Quality</span>
          </div>
        </div>

        <div className="divide-y divide-slate-850">
          {ingredients?.map((item, idx) => (
            <div
              key={idx}
              className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-900/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  {item.isOrganic && (
                    <span className="text-[10px] text-emerald-400 font-medium">Organic</span>
                  )}
                  {item.isAllergen && (
                    <span className="text-[10px] text-amber-400 font-medium">
                      Allergen: {item.allergenGroup || 'Yes'}
                    </span>
                  )}
                  {item.isAdditive && (
                    <span className="text-[10px] text-rose-400 font-medium font-mono">
                      {item.additiveCode || 'Additive'}
                    </span>
                  )}
                </div>
                {item.purpose && (
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{item.purpose}</p>
                )}
              </div>

              <div className="flex items-center gap-5 shrink-0 text-right">
                <span className="font-mono text-slate-300 tabular-nums">
                  {item.weightGrams}g <span className="text-[10px] text-slate-500">({item.percentage || 0}%)</span>
                </span>

                <div className="w-12 text-right">
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      item.qualityScore >= 85
                        ? 'text-emerald-400'
                        : item.qualityScore >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {item.qualityScore}
                  </span>
                  <span className="text-[10px] text-slate-500">/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
