import React, { useState } from 'react';
import { User, X, Check, Save, ShieldCheck } from 'lucide-react';
import { UserHealthProfile } from '../types/food';
import { saveStoredUserProfile } from '../services/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserHealthProfile;
  onProfileUpdated: (updated: UserHealthProfile) => void;
}

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Gluten/Wheat',
  'Shellfish',
  'Fish',
  'Soy',
  'Eggs',
  'Sesame',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [formData, setFormData] = useState<UserHealthProfile>({ ...profile });
  const [savedBadge, setSavedBadge] = useState(false);

  if (!isOpen) return null;

  const toggleAllergy = (allergy: string) => {
    const current = formData.allergies || [];
    if (current.includes(allergy)) {
      setFormData({ ...formData, allergies: current.filter((a) => a !== allergy) });
    } else {
      setFormData({ ...formData, allergies: [...current, allergy] });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredUserProfile(formData);
    onProfileUpdated(formData);
    setSavedBadge(true);
    setTimeout(() => {
      setSavedBadge(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">User Health Profile</h3>
              <p className="text-xs text-slate-400">
                Personalizes AI poison alerts, allergen warnings, and macro calculations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Biometrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Height (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* Goal & Diet */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Health Goal</label>
              <select
                value={formData.healthGoal}
                onChange={(e: any) => setFormData({ ...formData, healthGoal: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              >
                <option value="general_wellness">General Wellness & Vitality</option>
                <option value="weight_loss">Caloric Deficit / Fat Loss</option>
                <option value="muscle_gain">Hypertrophy / High Protein</option>
                <option value="diabetic_management">Diabetic Glycemic Control</option>
                <option value="heart_health">Cardiovascular & Low Sodium</option>
                <option value="renal_health">Renal Friendly / Controlled Potassium</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Dietary Restriction</label>
              <select
                value={formData.dietaryPreference}
                onChange={(e: any) => setFormData({ ...formData, dietaryPreference: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              >
                <option value="omnivore">Standard Omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan / Plant-Based</option>
                <option value="keto">Ketogenic (Strict Low Carb)</option>
                <option value="halal">Halal Certified</option>
                <option value="kosher">Kosher</option>
              </select>
            </div>
          </div>

          {/* Daily Calorie & Sodium Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Daily Calorie Target (kcal)</label>
              <input
                type="number"
                value={formData.dailyCalorieTarget}
                onChange={(e) => setFormData({ ...formData, dailyCalorieTarget: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Daily Sodium Cap (mg)</label>
              <input
                type="number"
                value={formData.dailySodiumMaxMg}
                onChange={(e) => setFormData({ ...formData, dailySodiumMaxMg: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-cyan-500 outline-none"
              />
            </div>
          </div>

          {/* Allergies Checklist */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-2 font-semibold">
              Personal Allergies (Flags Immediate Warnings)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_ALLERGENS.map((allergy) => {
                const isSelected = formData.allergies?.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`p-2 rounded-xl border text-center transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {allergy}
                  </button>
                );
              })}
            </div>
          </div>

          {savedBadge && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Health profile updated and encrypted locally.</span>
            </div>
          )}

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Health Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
