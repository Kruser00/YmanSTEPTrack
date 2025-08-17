
export interface NutrientGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string; // e.g., "1 کفگیر", "100 گرم"
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type Meal = FoodItem[];

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
}

export interface AnalyzedRecipe {
    foodName: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
}

export interface WeeklyProgress {
    day: string;
    calories: number;
}
