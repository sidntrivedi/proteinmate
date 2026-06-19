import type { Food } from './types';

export function proteinFor(foodItem: Food, grams: number) {
  return Math.round((foodItem.proteinPer100g * grams) / 100);
}
