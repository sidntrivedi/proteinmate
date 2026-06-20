export type VegType = 'veg' | 'non-veg' | 'vegan';

export type MealName = 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';

export type Serving = {
  label: string;
  grams: number;
};

export type Food = {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  proteinPer100g: number;
  defaultServing: Serving;
  servings: Serving[];
  vegType: VegType;
  source: 'IFCT-inspired seed' | 'user';
  confidence: 'high' | 'medium';
};

export type FoodLog = {
  id: string;
  foodId: string;
  foodName: string;
  quantityGrams: number;
  servingLabel: string;
  protein: number;
  meal: MealName;
  createdAt: string;
};

export type StreakState = {
  goalStreak: number;
  loggingStreak: number;
  freezesAvailable: number;
  lastGoalHitDate: string | null;
  lastLoggingDate: string | null;
};

export type ProteinMateState = {
  goal: number;
  logs: FoodLog[];
  customFoods: Food[];
  streak: StreakState;
};

export type ExtractedItem = {
  name: string;
  quantity?: number;
  unit?: string;
};
