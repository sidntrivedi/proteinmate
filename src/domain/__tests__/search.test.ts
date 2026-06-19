import { describe, expect, it } from 'vitest';

import { FOOD_DB } from '../foods';
import { normalizeSearchText, searchFoods, searchTerms } from '../search';
import type { Food } from '../types';

function customFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 'custom-protein-bar',
    name: 'Protein Bar',
    aliases: ['snack bar'],
    category: 'Packaged',
    proteinPer100g: 30,
    defaultServing: { label: '1 bar', grams: 60 },
    servings: [{ label: '1 bar', grams: 60 }],
    vegType: 'veg',
    source: 'user',
    confidence: 'high',
    ...overrides
  };
}

describe('food search', () => {
  it('normalizes punctuation, casing, and repeated whitespace', () => {
    expect(normalizeSearchText('  Greek-CURD / Yogurt!!  ')).toBe('greek curd yogurt');
  });

  it('expands known Indian food synonyms', () => {
    expect(searchTerms('anda')).toEqual(['anda', 'egg']);
    expect(searchTerms('panir')).toEqual(['panir', 'paneer']);
  });

  it('finds seed foods through aliases and synonyms', () => {
    expect(searchFoods(FOOD_DB, 'anda')[0]?.id).toBe('egg');
    expect(searchFoods(FOOD_DB, 'nutrela')[0]?.id).toBe('soy-chunks');
  });

  it('prioritizes direct name matches over weaker text matches', () => {
    const results = searchFoods(FOOD_DB, 'chicken');

    expect(results[0]?.id).toBe('chicken-breast');
  });

  it('shows custom foods and quick presets when the query is empty', () => {
    const results = searchFoods([customFood(), ...FOOD_DB], '');

    expect(results[0]?.id).toBe('custom-protein-bar');
    expect(results.map((food) => food.id)).toEqual(expect.arrayContaining(['whey', 'egg', 'paneer']));
  });

  it('limits search results to ten items', () => {
    const foods = Array.from({ length: 12 }, (_, index) => customFood({ id: `custom-${index}`, name: `Protein ${index}` }));

    expect(searchFoods(foods, 'protein')).toHaveLength(10);
  });
});
