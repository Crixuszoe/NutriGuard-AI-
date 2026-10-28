export interface PresetFoodItem {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  badgeType: 'hazard' | 'safe' | 'caution' | 'water';
  svgIcon: string;
  queryHint: string;
}

export const SAMPLE_PRESETS: PresetFoodItem[] = [
  {
    id: 'poisonous_fungi',
    name: 'Wild Woodland Mushrooms',
    category: 'Suspected Contaminant',
    description: 'Foraged forest mushrooms with pale greenish gills resembling death cap (Amanita phalloides).',
    badge: 'Toxic Risk Test',
    badgeType: 'hazard',
    svgIcon: '🍄',
    queryHint: 'Wild foraged cap mushrooms with suspected amatoxin peptide contamination and pale green gill structure',
  },
  {
    id: 'fresh_salmon_bowl',
    name: 'Salmon & Quinoa Bowl',
    category: 'Clean Whole Food',
    description: 'Grilled wild-caught salmon, organic tricolor quinoa, avocado, arugula, and cold-pressed olive oil.',
    badge: 'Pure & Certified',
    badgeType: 'safe',
    svgIcon: '🥗',
    queryHint: 'Fresh grilled Atlantic salmon with organic quinoa, Hass avocado slices, baby arugula and extra virgin olive oil',
  },
  {
    id: 'street_food_skewer',
    name: 'Street BBQ Chicken Skewer',
    category: 'Processed / Cooked',
    description: 'Charred spiced chicken skewer with chili glaze, cilantro, and dipping oil from outdoor night market.',
    badge: 'Oil & Spoilage Check',
    badgeType: 'caution',
    svgIcon: '🍢',
    queryHint: 'Street food spiced chicken skewer with sweet chili glaze, high sodium marinade, and sesame garnish',
  },
  {
    id: 'pure_mineral_water',
    name: 'Natural Artesian Spring Water',
    category: 'Beverage / Hydration',
    description: 'Glass of natural artesian mountain water tested for pH balance, dissolved solids, and heavy metals.',
    badge: 'Purity & Heavy Metals',
    badgeType: 'water',
    svgIcon: '💧',
    queryHint: 'Natural mountain spring water in clean glass for pH balance, microplastics, and dissolved heavy metals analysis',
  },
];
