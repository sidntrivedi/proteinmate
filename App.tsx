import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import {
  Award,
  Camera,
  Check,
  Flame,
  Plus,
  Repeat2,
  Search,
  Send,
  Sparkles,
  Target,
  Utensils,
  X
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

type VegType = 'veg' | 'non-veg' | 'vegan';

type Serving = {
  label: string;
  grams: number;
};

type Food = {
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

type FoodLog = {
  id: string;
  foodId: string;
  foodName: string;
  quantityGrams: number;
  servingLabel: string;
  protein: number;
  meal: string;
  createdAt: string;
};

type StreakState = {
  goalStreak: number;
  loggingStreak: number;
  freezesAvailable: number;
  lastGoalHitDate: string | null;
  lastLoggingDate: string | null;
};

const STORAGE_KEY = 'proteinmate:v1';
const todayKey = () => new Date().toISOString().slice(0, 10);

const FOOD_DB: Food[] = [
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

const QUICK_PRESETS = ['whey', 'egg', 'paneer', 'chicken-breast', 'soy-chunks', 'dal'];
const MEALS = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
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

function proteinFor(foodItem: Food, grams: number) {
  return Math.round((foodItem.proteinPer100g * grams) / 100);
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchTerms(value: string) {
  const baseTerms = normalizeSearchText(value).split(' ').filter(Boolean);
  const expanded = baseTerms.flatMap((term) => [term, ...(SEARCH_SYNONYMS[term] ?? [])]);
  return Array.from(new Set(expanded));
}

function searchableFoodText(item: Food) {
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

function dayDiff(a: string, b: string) {
  const first = new Date(`${a}T00:00:00`).getTime();
  const second = new Date(`${b}T00:00:00`).getTime();
  return Math.round((second - first) / 86400000);
}

function nextStreak(state: StreakState, goalHitToday: boolean, loggedToday: boolean, date: string): StreakState {
  const last = state.lastGoalHitDate;
  const lastLogging = state.lastLoggingDate;
  if (!goalHitToday && (!loggedToday || lastLogging === date)) {
    return state;
  }

  let goalStreak = state.goalStreak;
  let freezesAvailable = state.freezesAvailable;
  if (goalHitToday && last !== date) {
    const gap = last ? dayDiff(last, date) : 0;
    if (gap === 1 || !last) {
      goalStreak += 1;
    } else if (gap === 2 && freezesAvailable > 0) {
      freezesAvailable -= 1;
      goalStreak += 1;
    } else {
      goalStreak = 1;
    }
    if (goalStreak > 0 && goalStreak % 7 === 0) {
      freezesAvailable += 1;
    }
  }

  let loggingStreak = state.loggingStreak;
  if (loggedToday && lastLogging !== date) {
    const gap = lastLogging ? dayDiff(lastLogging, date) : 0;
    loggingStreak = gap === 1 || !lastLogging ? loggingStreak + 1 : 1;
  }

  return {
    goalStreak,
    loggingStreak,
    freezesAvailable,
    lastGoalHitDate: goalHitToday ? date : state.lastGoalHitDate,
    lastLoggingDate: loggedToday ? date : state.lastLoggingDate
  };
}

export default function App() {
  const [goal, setGoal] = useState(120);
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [customFoods, setCustomFoods] = useState<Food[]>([]);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [meal, setMeal] = useState('Breakfast');
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customServing, setCustomServing] = useState('');
  const [streak, setStreak] = useState<StreakState>({
    goalStreak: 0,
    loggingStreak: 0,
    freezesAvailable: 0,
    lastGoalHitDate: null,
    lastLoggingDate: null
  });
  const shareRef = useRef<View>(null);

  const date = todayKey();
  const allFoods = useMemo(() => [...customFoods, ...FOOD_DB], [customFoods]);
  const todayLogs = logs.filter((log) => log.createdAt.slice(0, 10) === date);
  const consumed = todayLogs.reduce((sum, log) => sum + log.protein, 0);
  const remaining = Math.max(goal - consumed, 0);
  const percent = Math.min(consumed / goal, 1);
  const topFood = todayLogs.slice().sort((a, b) => b.protein - a.protein)[0];

  const results = useMemo(() => {
    const terms = searchTerms(query);
    const ranked = allFoods
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
  }, [allFoods, query]);

  const suggestedFoods = useMemo(() => {
    return FOOD_DB.filter((item) => QUICK_PRESETS.includes(item.id));
  }, []);

  const visibleResults = results.length > 0 ? results : query.trim() ? suggestedFoods : results;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const stored = JSON.parse(raw) as {
          goal?: number;
          logs?: FoodLog[];
          customFoods?: Food[];
          streak?: StreakState;
        };
        setGoal(stored.goal ?? 120);
        setLogs(stored.logs ?? []);
        setCustomFoods(stored.customFoods ?? []);
        if (stored.streak) {
          setStreak({
            goalStreak: stored.streak.goalStreak ?? 0,
            loggingStreak: stored.streak.loggingStreak ?? 0,
            freezesAvailable: stored.streak.freezesAvailable ?? 0,
            lastGoalHitDate: stored.streak.lastGoalHitDate ?? null,
            lastLoggingDate: stored.streak.lastLoggingDate ?? null
          });
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const goalHitToday = consumed >= goal;
    const loggedToday = todayLogs.length > 0;
    setStreak((current) => nextStreak(current, goalHitToday, loggedToday, date));
  }, [consumed, date, goal, todayLogs.length]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ goal, logs, customFoods, streak })).catch(() => undefined);
  }, [goal, logs, customFoods, streak]);

  const addLog = (foodItem: Food, serving = foodItem.defaultServing) => {
    const entry: FoodLog = {
      id: `${Date.now()}-${foodItem.id}`,
      foodId: foodItem.id,
      foodName: foodItem.name,
      quantityGrams: serving.grams,
      servingLabel: serving.label,
      protein: proteinFor(foodItem, serving.grams),
      meal,
      createdAt: new Date().toISOString()
    };
    setLogs((current) => [entry, ...current]);
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

  const shareProgress = async () => {
    const message = `ProteinMate check-in: ${consumed}/${goal} g protein today (${Math.round(percent * 100)}%). Goal streak: ${streak.goalStreak} days.`;
    try {
      if (shareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareRef, {
          format: 'png',
          quality: 0.95
        });
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Share your ProteinMate card',
          mimeType: 'image/png'
        });
        return;
      }
      await Share.share({ message });
    } catch {
      await Share.share({ message });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.kicker}>ProteinMate</Text>
              <Text style={styles.title}>Hit today before dinner negotiates.</Text>
            </View>
            <Pressable style={styles.iconButton} onPress={() => setCustomOpen(true)}>
              <Camera size={22} color="#16302b" />
            </Pressable>
          </View>

          <LinearGradient colors={['#fff6df', '#e7f4e3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Today</Text>
                <Text style={styles.heroValue}>
                  {consumed}
                  <Text style={styles.heroUnit}> / {goal}g</Text>
                </Text>
              </View>
              <View style={styles.streakPill}>
                <Flame size={18} color="#bf3c18" />
                <Text style={styles.streakText}>{streak.goalStreak} day streak</Text>
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(percent * 100, 4)}%` }]} />
            </View>
            <View style={styles.heroStats}>
              <View>
                <Text style={styles.statNumber}>{remaining}g</Text>
                <Text style={styles.statLabel}>left</Text>
              </View>
              <View>
                <Text style={styles.statNumber}>{Math.round(percent * 100)}%</Text>
                <Text style={styles.statLabel}>complete</Text>
              </View>
              <View>
                <Text style={styles.statNumber}>{streak.freezesAvailable}</Text>
                <Text style={styles.statLabel}>freezes</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.actionRow}>
            <Pressable style={styles.primaryAction} onPress={repeatYesterday}>
              <Repeat2 size={18} color="#fff" />
              <Text style={styles.primaryActionText}>Same as yesterday</Text>
            </Pressable>
            <Pressable style={styles.secondaryAction} onPress={shareProgress}>
              <Send size={18} color="#16302b" />
              <Text style={styles.secondaryActionText}>Share</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Fast add</Text>
              <View style={styles.sourceBadge}>
                <Sparkles size={14} color="#836116" />
                <Text style={styles.sourceText}>Indian foods</Text>
              </View>
            </View>
            <View style={styles.searchBox}>
              <Search size={19} color="#61746b" />
              <TextInput
                placeholder="Search paneer, chana, whey, dal..."
                placeholderTextColor="#7f9087"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                returnKeyType="search"
                style={styles.searchInput}
              />
              {query.trim() ? (
                <Pressable onPress={() => setQuery('')} style={styles.clearSearchButton}>
                  <X size={15} color="#61746b" />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.mealTabs}>
              {MEALS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setMeal(item)}
                  style={[styles.mealTab, meal === item && styles.mealTabActive]}
                >
                  <Text style={[styles.mealTabText, meal === item && styles.mealTabTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.foodList}>
              {results.length === 0 && query.trim() ? (
                <View style={styles.searchEmpty}>
                  <Search size={20} color="#61746b" />
                  <View style={styles.searchEmptyCopy}>
                    <Text style={styles.searchEmptyTitle}>No exact match yet</Text>
                    <Text style={styles.searchEmptyText}>Try a staple below or add it as a packaged food.</Text>
                  </View>
                </View>
              ) : null}
              {visibleResults.map((item) => (
                <Pressable key={item.id} style={styles.foodRow} onPress={() => setSelectedFood(item)}>
                  <View style={styles.foodIcon}>
                    <Utensils size={18} color="#16302b" />
                  </View>
                  <View style={styles.foodMeta}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodDetail}>
                      {proteinFor(item, item.defaultServing.grams)}g protein • {item.defaultServing.label}
                    </Text>
                  </View>
                  <Plus size={20} color="#0d5f4b" />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's log</Text>
            {todayLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Target size={28} color="#61746b" />
                <Text style={styles.emptyTitle}>No protein logged yet</Text>
                <Text style={styles.emptyText}>Start with the thing you already ate. Accuracy beats memory.</Text>
              </View>
            ) : (
              todayLogs.map((log) => (
                <View key={log.id} style={styles.logRow}>
                  <View>
                    <Text style={styles.logName}>{log.foodName}</Text>
                    <Text style={styles.logDetail}>
                      {log.meal} • {log.servingLabel}
                    </Text>
                  </View>
                  <View style={styles.logRight}>
                    <Text style={styles.logProtein}>{log.protein}g</Text>
                    <Pressable onPress={() => removeLog(log.id)} style={styles.deleteButton}>
                      <X size={15} color="#7a3b30" />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>

          <ViewShot ref={shareRef} options={{ format: 'png', quality: 0.95 }}>
            <LinearGradient colors={['#162d28', '#23483d', '#e7b449']} style={styles.shareCard}>
              <View style={styles.shareTop}>
                <Text style={styles.shareBrand}>ProteinMate</Text>
                <View style={styles.shareBadge}>
                  <Award size={15} color="#19322c" />
                  <Text style={styles.shareBadgeText}>{streak.goalStreak} streak</Text>
                </View>
              </View>
              <Text style={styles.shareBig}>{consumed}g</Text>
              <Text style={styles.shareSub}>protein today • {Math.round(percent * 100)}% of goal</Text>
              <View style={styles.shareDivider} />
              <Text style={styles.shareFood}>
                {topFood ? `Top hit: ${topFood.foodName} +${topFood.protein}g` : 'First log loading...'}
              </Text>
              <Text style={styles.shareFooter}>Built for Indian plates, coach check-ins, and no-excuse days.</Text>
            </LinearGradient>
          </ViewShot>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={!!selectedFood} animationType="slide" transparent onRequestClose={() => setSelectedFood(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            {selectedFood ? (
              <>
                <Text style={styles.sheetTitle}>{selectedFood.name}</Text>
                <Text style={styles.sheetSubtitle}>
                  Choose serving for {meal.toLowerCase()} • {selectedFood.proteinPer100g}g protein/100g
                </Text>
                {selectedFood.servings.map((serving) => (
                  <Pressable key={serving.label} style={styles.servingRow} onPress={() => addLog(selectedFood, serving)}>
                    <View>
                      <Text style={styles.servingLabel}>{serving.label}</Text>
                      <Text style={styles.servingDetail}>{serving.grams}g quantity</Text>
                    </View>
                    <Text style={styles.servingProtein}>{proteinFor(selectedFood, serving.grams)}g</Text>
                  </Pressable>
                ))}
                <Pressable style={styles.cancelButton} onPress={() => setSelectedFood(null)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={customOpen} animationType="slide" transparent onRequestClose={() => setCustomOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add packaged food</Text>
            <Text style={styles.sheetSubtitle}>Use the nutrition label now. OCR and barcode can plug into this later.</Text>
            <TextInput
              value={customName}
              onChangeText={setCustomName}
              placeholder="Brand + product name"
              placeholderTextColor="#7f9087"
              style={styles.input}
            />
            <TextInput
              value={customProtein}
              onChangeText={setCustomProtein}
              placeholder="Protein per 100 g"
              placeholderTextColor="#7f9087"
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              value={customServing}
              onChangeText={setCustomServing}
              placeholder="Serving size in grams"
              placeholderTextColor="#7f9087"
              keyboardType="numeric"
              style={styles.input}
            />
            <Pressable style={styles.saveButton} onPress={saveCustomFood}>
              <Check size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Save and log</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={() => setCustomOpen(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  safe: {
    flex: 1,
    backgroundColor: '#f7f3ea'
  },
  page: {
    padding: 18,
    paddingBottom: 40,
    gap: 18
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  kicker: {
    color: '#5d6f66',
    fontSize: 14,
    fontWeight: '700'
  },
  title: {
    color: '#142b27',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 32,
    maxWidth: 290
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e2d8c3',
    borderRadius: 18,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46
  },
  hero: {
    borderRadius: 30,
    padding: 22
  },
  heroTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  heroLabel: {
    color: '#536a61',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  heroValue: {
    color: '#142b27',
    fontSize: 54,
    fontWeight: '900',
    lineHeight: 62
  },
  heroUnit: {
    color: '#536a61',
    fontSize: 23,
    fontWeight: '800'
  },
  streakPill: {
    alignItems: 'center',
    backgroundColor: '#fff7e6',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  streakText: {
    color: '#7a331f',
    fontSize: 13,
    fontWeight: '800'
  },
  progressTrack: {
    backgroundColor: 'rgba(20,43,39,0.14)',
    borderRadius: 99,
    height: 15,
    marginTop: 18,
    overflow: 'hidden'
  },
  progressFill: {
    backgroundColor: '#0d5f4b',
    borderRadius: 99,
    height: '100%'
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18
  },
  statNumber: {
    color: '#142b27',
    fontSize: 22,
    fontWeight: '900'
  },
  statLabel: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12
  },
  primaryAction: {
    alignItems: 'center',
    backgroundColor: '#16302b',
    borderRadius: 20,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 15
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900'
  },
  secondaryAction: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#ded4c1',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  secondaryActionText: {
    color: '#16302b',
    fontSize: 14,
    fontWeight: '900'
  },
  section: {
    gap: 12
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  sectionTitle: {
    color: '#142b27',
    fontSize: 20,
    fontWeight: '900'
  },
  sourceBadge: {
    alignItems: 'center',
    backgroundColor: '#fff2c4',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  sourceText: {
    color: '#6a4d0e',
    fontSize: 12,
    fontWeight: '800'
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#ded4c1',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14
  },
  searchInput: {
    color: '#142b27',
    flex: 1,
    fontSize: 16,
    minHeight: 50
  },
  clearSearchButton: {
    alignItems: 'center',
    backgroundColor: '#eee5d6',
    borderRadius: 99,
    height: 28,
    justifyContent: 'center',
    width: 28
  },
  mealTabs: {
    flexDirection: 'row',
    gap: 8
  },
  mealTab: {
    alignItems: 'center',
    backgroundColor: '#ede5d7',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 10
  },
  mealTabActive: {
    backgroundColor: '#16302b'
  },
  mealTabText: {
    color: '#536a61',
    fontSize: 12,
    fontWeight: '900'
  },
  mealTabTextActive: {
    color: '#fff'
  },
  foodList: {
    gap: 9
  },
  searchEmpty: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12
  },
  searchEmptyCopy: {
    flex: 1
  },
  searchEmptyTitle: {
    color: '#142b27',
    fontSize: 15,
    fontWeight: '900'
  },
  searchEmptyText: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  foodRow: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12
  },
  foodIcon: {
    alignItems: 'center',
    backgroundColor: '#e7f4e3',
    borderRadius: 16,
    height: 42,
    justifyContent: 'center',
    width: 42
  },
  foodMeta: {
    flex: 1
  },
  foodName: {
    color: '#142b27',
    fontSize: 16,
    fontWeight: '900'
  },
  foodDetail: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 22,
    borderWidth: 1,
    padding: 22
  },
  emptyTitle: {
    color: '#142b27',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 10
  },
  emptyText: {
    color: '#61746b',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center'
  },
  logRow: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 13
  },
  logName: {
    color: '#142b27',
    fontSize: 15,
    fontWeight: '900'
  },
  logDetail: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  logRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  logProtein: {
    color: '#0d5f4b',
    fontSize: 18,
    fontWeight: '900'
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: '#f8ded7',
    borderRadius: 99,
    height: 28,
    justifyContent: 'center',
    width: 28
  },
  shareCard: {
    aspectRatio: 9 / 16,
    borderRadius: 30,
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: 24
  },
  shareTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  shareBrand: {
    color: '#fff6df',
    fontSize: 19,
    fontWeight: '900'
  },
  shareBadge: {
    alignItems: 'center',
    backgroundColor: '#fff6df',
    borderRadius: 99,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  shareBadgeText: {
    color: '#19322c',
    fontSize: 12,
    fontWeight: '900'
  },
  shareBig: {
    color: '#fff6df',
    fontSize: 86,
    fontWeight: '900',
    lineHeight: 94
  },
  shareSub: {
    color: '#ffdf86',
    fontSize: 19,
    fontWeight: '900'
  },
  shareDivider: {
    backgroundColor: 'rgba(255,246,223,0.4)',
    height: 1
  },
  shareFood: {
    color: '#fff6df',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 31
  },
  shareFooter: {
    color: 'rgba(255,246,223,0.82)',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21
  },
  modalBackdrop: {
    backgroundColor: 'rgba(12,24,22,0.42)',
    flex: 1,
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: '#f7f3ea',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 34
  },
  sheetHandle: {
    alignSelf: 'center',
    backgroundColor: '#c9beaa',
    borderRadius: 99,
    height: 5,
    marginBottom: 16,
    width: 44
  },
  sheetTitle: {
    color: '#142b27',
    fontSize: 25,
    fontWeight: '900'
  },
  sheetSubtitle: {
    color: '#61746b',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 4
  },
  servingRow: {
    alignItems: 'center',
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 14
  },
  servingLabel: {
    color: '#142b27',
    fontSize: 16,
    fontWeight: '900'
  },
  servingDetail: {
    color: '#61746b',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  servingProtein: {
    color: '#0d5f4b',
    fontSize: 20,
    fontWeight: '900'
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 12,
    padding: 13
  },
  cancelButtonText: {
    color: '#61746b',
    fontSize: 15,
    fontWeight: '900'
  },
  input: {
    backgroundColor: '#fffaf0',
    borderColor: '#e4dac8',
    borderRadius: 16,
    borderWidth: 1,
    color: '#142b27',
    fontSize: 16,
    marginTop: 12,
    minHeight: 52,
    paddingHorizontal: 14
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#16302b',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 14,
    padding: 15
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900'
  }
});
