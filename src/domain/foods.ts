import type { Food, MealName, VegType } from './types';

export const QUICK_PRESETS = ['whey', 'egg', 'paneer', 'chicken-breast', 'soy-chunks', 'dal'];

export const MEALS: MealName[] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];

function food(
  id: string,
  name: string,
  aliases: string[],
  category: string,
  proteinPer100g: number,
  defaultLabel: string,
  defaultGrams: number,
  vegType: VegType,
  servings: [string, number][]
): Food {
  return {
    id,
    name,
    aliases,
    category,
    proteinPer100g,
    defaultServing: { label: defaultLabel, grams: defaultGrams },
    servings: servings.map(([label, grams]) => ({ label, grams })),
    vegType,
    source: 'IFCT-inspired seed',
    confidence: 'medium'
  };
}

export const FOOD_DB: Food[] = [
  food('paneer', 'Paneer', ['panir', 'cottage cheese'], 'Dairy', 18.3, '100 g', 100, 'veg', [
    ['1 katori', 80],
    ['100 g', 100],
    ['1 cup cubes', 150]
  ]),
  food('soy-chunks', 'Soya chunks', ['soy chunks', 'meal maker', 'nutrela'], 'High protein', 52, '1 katori cooked', 80, 'vegan', [
    ['1 katori cooked', 80],
    ['50 g dry', 50],
    ['100 g dry', 100]
  ]),
  food('egg', 'Egg', ['anda', 'boiled egg'], 'Eggs', 13, '2 eggs', 100, 'non-veg', [
    ['1 egg', 50],
    ['2 eggs', 100],
    ['3 eggs', 150]
  ]),
  food('chicken-breast', 'Chicken breast', ['chicken', 'grilled chicken'], 'Meat', 31, '150 g', 150, 'non-veg', [
    ['100 g', 100],
    ['150 g', 150],
    ['200 g', 200]
  ]),
  food('whey', 'Whey protein', ['protein powder', 'whey scoop'], 'Supplement', 76, '1 scoop', 33, 'veg', [
    ['1 scoop', 33],
    ['1.5 scoops', 50],
    ['2 scoops', 66]
  ]),
  food('greek-curd', 'Hung curd / Greek yogurt', ['greek yogurt', 'hung curd', 'dahi'], 'Dairy', 10, '1 bowl', 150, 'veg', [
    ['1 bowl', 150],
    ['1 cup', 200],
    ['100 g', 100]
  ]),
  food('milk', 'Milk', ['doodh', 'toned milk'], 'Dairy', 3.4, '1 glass', 250, 'veg', [
    ['1 glass', 250],
    ['1 cup', 200],
    ['500 ml', 500]
  ]),
  food('tofu', 'Tofu', ['bean curd'], 'High protein', 15.8, '100 g', 100, 'vegan', [
    ['100 g', 100],
    ['150 g', 150],
    ['1 cup cubes', 180]
  ]),
  food('chana', 'Chana / Chickpeas', ['chole', 'kabuli chana', 'chickpeas'], 'Pulses', 8.9, '1 katori cooked', 150, 'vegan', [
    ['1 katori cooked', 150],
    ['1 cup cooked', 180],
    ['100 g cooked', 100]
  ]),
  food('rajma', 'Rajma', ['kidney beans'], 'Pulses', 8.7, '1 katori cooked', 150, 'vegan', [
    ['1 katori cooked', 150],
    ['1 cup cooked', 180],
    ['100 g cooked', 100]
  ]),
  food('dal', 'Dal', ['lentils', 'moong dal', 'toor dal', 'masoor dal'], 'Pulses', 7.8, '1 katori cooked', 150, 'vegan', [
    ['1 katori cooked', 150],
    ['2 katori cooked', 300],
    ['100 g cooked', 100]
  ]),
  food('sprouts', 'Moong sprouts', ['sprouts', 'ankurit moong'], 'Pulses', 7, '1 bowl', 120, 'vegan', [
    ['1 bowl', 120],
    ['1 cup', 100],
    ['100 g', 100]
  ]),
  food('sattu', 'Sattu drink', ['roasted chana flour', 'sattu sharbat'], 'Traditional', 22, '4 tbsp powder', 40, 'vegan', [
    ['2 tbsp powder', 20],
    ['4 tbsp powder', 40],
    ['100 g powder', 100]
  ]),
  food('fish', 'Fish curry piece', ['machli', 'rohu', 'surmai'], 'Seafood', 22, '1 piece', 100, 'non-veg', [
    ['1 piece', 100],
    ['2 pieces', 180],
    ['150 g', 150]
  ]),
  food('peanuts', 'Peanuts', ['moongfali', 'groundnut'], 'Snack', 26, '1 handful', 30, 'vegan', [
    ['1 handful', 30],
    ['50 g', 50],
    ['100 g', 100]
  ]),
  food('idli', 'Idli', ['idly'], 'Breakfast', 3.5, '2 idli', 100, 'vegan', [
    ['1 idli', 50],
    ['2 idli', 100],
    ['4 idli', 200]
  ]),
  food('dosa', 'Dosa', ['plain dosa'], 'Breakfast', 5, '1 dosa', 100, 'vegan', [
    ['1 dosa', 100],
    ['2 dosa', 200],
    ['100 g', 100]
  ]),
  food('poha', 'Poha', ['kanda poha'], 'Breakfast', 3.3, '1 plate', 180, 'vegan', [
    ['1 plate', 180],
    ['1 bowl', 150],
    ['100 g', 100]
  ]),
  food('roti', 'Roti', ['chapati', 'phulka'], 'Staple', 8.7, '2 roti', 80, 'vegan', [
    ['1 roti', 40],
    ['2 roti', 80],
    ['3 roti', 120]
  ]),
  food('biryani-chicken', 'Chicken biryani', ['biryani'], 'Meal', 9, '1 plate', 350, 'non-veg', [
    ['1 plate', 350],
    ['half plate', 180],
    ['100 g', 100]
  ])
];
