export type AnalysisMode =
  | 'all'
  | 'poison'
  | 'ingredients'
  | 'nutrition'
  | 'health'
  | 'spoilage'
  | 'water'
  | 'blockchain';

export interface PoisonDetails {
  detected: boolean;
  poisonName: string;
  chemicalFormula: string;
  estimatedConcentrationPpm: number;
  estimatedTimeAdded: string;
  detectionConfidence: number;
  severityLevel: string;
  healthRisks: string[];
  symptoms: string[];
  immediateEmergencyMeasures: string[];
  antidoteOrTreatment: string;
  emergencyHotlineAdvice: string;
}

export interface IngredientItem {
  name: string;
  weightGrams: number;
  percentage: number;
  qualityScore: number;
  isOrganic?: boolean;
  isAllergen: boolean;
  allergenGroup?: string;
  isAdditive?: boolean;
  additiveCode?: string;
  purpose?: string;
}

export interface IngredientAnalysis {
  ingredients: IngredientItem[];
  freshnessScore: number;
  artificialAdditivesCount: number;
  detectedAllergens: string[];
  preservativesPresent: string[];
}

export interface NutritionalAnalysis {
  servingSizeGrams: number;
  calories: number;
  proteinGrams: number;
  totalFatGrams: number;
  saturatedFatGrams: number;
  transFatGrams: number;
  oilPercentage: number;
  carbsGrams: number;
  dietaryFiberGrams: number;
  totalSugarsGrams: number;
  sodiumMilligrams: number;
  cholesterolMilligrams: number;
  potassiumMilligrams: number;
  calciumMilligrams: number;
  ironMilligrams: number;
  unhealthyFlags: string[];
  macroRatio?: {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
}

export interface SpoilageAndExpiry {
  freshnessState: string;
  daysUntilExpiry: number;
  visualSpoilageIndicators: string[];
  bacterialOrMoldRisk: string;
  recommendedStorage: string;
}

export interface PersonalizedHealthAdvice {
  fitForUserGoal: boolean;
  goalAlignmentScore: number;
  personalizedInsight: string;
  portionAdvice: string;
  diabeticFriendly: boolean;
  heartHealthy: boolean;
  healthierAlternatives: string[];
}

export interface WaterOrLiquidQuality {
  applicable: boolean;
  phLevel: number;
  tdsPpm: number;
  chlorineRisk: string;
  heavyMetalsStatus: string;
  bacterialColiformStatus: string;
  drinkabilityStatus: string;
}

export interface BlockchainTraceability {
  batchId: string;
  originFarm: string;
  harvestDate: string;
  inspectionCertificateId: string;
  immutableLedgerHash: string;
  certifications: string[];
  tamperEvidentStatus: string;
}

export interface FoodAnalysisResult {
  id?: string;
  scannedAt?: string;
  imageThumbnail?: string;
  foodName: string;
  category: string;
  isSafe: boolean;
  safetyScore: number;
  riskLevel: 'safe' | 'low' | 'moderate' | 'high' | 'critical';
  poisonAnalysis: PoisonDetails;
  ingredientAnalysis: IngredientAnalysis;
  nutritionalAnalysis: NutritionalAnalysis;
  spoilageAndExpiry: SpoilageAndExpiry;
  personalizedHealthAdvice: PersonalizedHealthAdvice;
  waterOrLiquidQuality?: WaterOrLiquidQuality;
  blockchainTraceability?: BlockchainTraceability;
}

export interface UserHealthProfile {
  name: string;
  age: number;
  weightKg: number;
  heightCm: number;
  gender: 'female' | 'male' | 'other';
  dietaryPreference: 'omnivore' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'low_fodmap' | 'halal' | 'kosher';
  healthGoal: 'general_wellness' | 'weight_loss' | 'muscle_gain' | 'heart_health' | 'diabetic_management' | 'renal_health';
  allergies: string[];
  dailyCalorieTarget: number;
  dailySodiumMaxMg: number;
}

export interface GlobalAlert {
  id: string;
  agency: string;
  title: string;
  hazard: string;
  affectedRegions: string;
  dateIssued: string;
  actionRequired: string;
  riskLevel: string;
}

export interface CommunityReport {
  id: string;
  foodItem: string;
  location: string;
  contaminantType: string;
  reportedAt: string;
  verified: boolean;
  notes: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
