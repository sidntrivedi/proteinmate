import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { FOOD_DB, MEALS, QUICK_PRESETS } from '../../domain/foods';
import { proteinFor } from '../../domain/nutrition';
import { searchFoods } from '../../domain/search';
import { nextStreak, todayKey } from '../../domain/streaks';
import type { Food, FoodLog, MealName, Serving, StreakState } from '../../domain/types';
import { DEFAULT_STREAK, loadProteinMateState, saveProteinMateState } from '../../storage/proteinMateStorage';

export function useProteinTracker() {
  const [goal, setGoal] = useState(120);
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [meal, setMeal] = useState<MealName>('Breakfast');
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customServing, setCustomServing] = useState('');
  const [streak, setStreak] = useState<StreakState>(DEFAULT_STREAK);
  const [hasLoaded, setHasLoaded] = useState(false);

  const date = todayKey();
  const allFoods = useMemo(() => [...customFoods, ...FOOD_DB], [customFoods]);
  const todayLogs = logs.filter((log) => log.createdAt.slice(0, 10) === date);
  const consumed = todayLogs.reduce((sum, log) => sum + log.protein, 0);
  const remaining = Math.max(goal - consumed, 0);
  const percent = Math.min(consumed / goal, 1);
  const topFood = todayLogs.slice().sort((a, b) => b.protein - a.protein)[0];

  const results = useMemo(() => searchFoods(allFoods, query), [allFoods, query]);
  const suggestedFoods = useMemo(() => FOOD_DB.filter((item) => QUICK_PRESETS.includes(item.id)), []);
  const visibleResults = results.length > 0 ? results : query.trim() ? suggestedFoods : results;

  useEffect(() => {
    loadProteinMateState()
      .then((stored) => {
        setGoal(stored.goal);
        setLogs(stored.logs);
        setCustomFoods(stored.customFoods);
        setStreak(stored.streak);
      })
      .catch(() => undefined)
      .finally(() => setHasLoaded(true));
  }, []);

  useEffect(() => {
    const goalHitToday = consumed >= goal;
    const loggedToday = todayLogs.length > 0;
    setStreak((current) => nextStreak(current, goalHitToday, loggedToday, date));
  }, [consumed, date, goal, todayLogs.length]);

  useEffect(() => {
    if (!hasLoaded) {
      return;
    }

    saveProteinMateState({ goal, logs, customFoods, streak }).catch(() => undefined);
  }, [customFoods, goal, hasLoaded, logs, streak]);

  const buildEntry = (foodItem: Food, serving: Serving, index = 0): FoodLog => ({
    id: `${Date.now()}-${index}-${foodItem.id}`,
    foodId: foodItem.id,
    foodName: foodItem.name,
    quantityGrams: serving.grams,
    servingLabel: serving.label,
    protein: proteinFor(foodItem, serving.grams),
    meal,
    createdAt: new Date().toISOString()
  });

  const addLog = (foodItem: Food, serving: Serving = foodItem.defaultServing) => {
    const entry = buildEntry(foodItem, serving);
    setLogs((current) => [entry, ...current]);
    setSelectedFood(null);
    setQuery('');
  };

  const addLogs = (items: { food: Food; serving: Serving }[]) => {
    if (items.length === 0) {
      return;
    }

    const entries = items.map((item, index) => buildEntry(item.food, item.serving, index));
    setLogs((current) => [...entries, ...current]);
    setSelectedFood(null);
    setQuery('');
  };

  const repeatYesterday = () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const yesterdayLogs = logs.filter((log) => log.createdAt.slice(0, 10) === yesterday);
    if (yesterdayLogs.length === 0) {
      Alert.alert('No yesterday logs', 'Add a few meals today and this shortcut becomes magic tomorrow.');
      return;
    }

    const copied = yesterdayLogs.map((log) => ({
      ...log,
      id: `${Date.now()}-${log.id}`,
      createdAt: new Date().toISOString()
    }));
    setLogs((current) => [...copied, ...current]);
  };

  const saveCustomFood = () => {
    const proteinValue = Number(customProtein);
    const servingValue = Number(customServing || '100');
    if (!customName.trim() || !proteinValue || !servingValue) {
      Alert.alert('Complete the label', 'Add product name, protein per 100 g, and serving size.');
      return;
    }

    const created: Food = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      aliases: [],
      category: 'Packaged',
      proteinPer100g: proteinValue,
      defaultServing: { label: `${servingValue} g serving`, grams: servingValue },
      servings: [
        { label: `${servingValue} g serving`, grams: servingValue },
        { label: '100 g', grams: 100 }
      ],
      vegType: 'veg',
      source: 'user',
      confidence: 'high'
    };
    setCustomFoods((current) => [created, ...current]);
    setCustomOpen(false);
    setCustomName('');
    setCustomProtein('');
    setCustomServing('');
    addLog(created);
  };

  const removeLog = (id: string) => setLogs((current) => current.filter((log) => log.id !== id));

  return {
    addLog,
    addLogs,
    allFoods,
    consumed,
    customName,
    customOpen,
    customProtein,
    customServing,
    goal,
    meal,
    meals: MEALS,
    percent,
    query,
    remaining,
    removeLog,
    repeatYesterday,
    results,
    saveCustomFood,
    selectedFood,
    setCustomName,
    setCustomOpen,
    setCustomProtein,
    setCustomServing,
    setGoal,
    setMeal,
    setQuery,
    setSelectedFood,
    streak,
    todayLogs,
    topFood,
    visibleResults
  };
}
