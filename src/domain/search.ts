import { QUICK_PRESETS } from './foods';
import type { Food } from './types';

const SEARCH_SYNONYMS: Record<string, string[]> = {
  anda: ['egg'],
  chole: ['chana', 'chickpeas'],
  curd: ['dahi', 'yogurt'],
  dahi: ['curd', 'yogurt'],
  doodh: ['milk'],
  fish: ['machli'],
  machli: ['fish'],
  nutrela: ['soya', 'soy'],
  panir: ['paneer'],
  soya: ['soy', 'soybean'],
  tofu: ['bean curd']
};

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function searchTerms(value: string) {
  const baseTerms = normalizeSearchText(value).split(' ').filter(Boolean);
  const expanded = baseTerms.flatMap((term) => [term, ...(SEARCH_SYNONYMS[term] ?? [])]);
  return Array.from(new Set(expanded));
}

export function searchableFoodText(item: Food) {
  return normalizeSearchText(
    [
      item.name,
      item.category,
      item.vegType,
      item.defaultServing.label,
      String(item.proteinPer100g),
      ...item.aliases
    ].join(' ')
  );
}

export function searchFoods(foods: Food[], query: string) {
  const terms = searchTerms(query);
  const ranked = foods
    .map((item) => {
      if (terms.length === 0) {
        return {
          item,
          score: QUICK_PRESETS.includes(item.id) ? 2 : item.source === 'user' ? 3 : 0
        };
      }

      const haystack = searchableFoodText(item);
      const score = terms.reduce((sum, term) => {
        if (normalizeSearchText(item.name).startsWith(term)) return sum + 5;
        if (haystack.split(' ').some((word) => word.startsWith(term))) return sum + 3;
        if (haystack.includes(term)) return sum + 1;
        return sum;
      }, 0);

      return { item, score };
    })
    .filter(({ item, score }) => {
      if (terms.length === 0) {
        return score > 0 || QUICK_PRESETS.includes(item.id) || item.source === 'user';
      }

      return score > 0;
    })
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);

  return ranked.slice(0, 10);
}
