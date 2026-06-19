import { Plus, Search, Sparkles, Utensils, X } from 'lucide-react-native';
import { Pressable, Text, TextInput, View } from 'react-native';

import { proteinFor } from '../../../domain/nutrition';
import type { Food, MealName } from '../../../domain/types';
import { styles } from '../styles';

type FoodSearchSectionProps = {
  meal: MealName;
  meals: MealName[];
  query: string;
  results: Food[];
  visibleResults: Food[];
  onChangeMeal: (meal: MealName) => void;
  onChangeQuery: (query: string) => void;
  onSelectFood: (food: Food) => void;
};

export function FoodSearchSection({
  meal,
  meals,
  query,
  results,
  visibleResults,
  onChangeMeal,
  onChangeQuery,
  onSelectFood
}: FoodSearchSectionProps) {
  return (
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
          onChangeText={onChangeQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          returnKeyType="search"
          style={styles.searchInput}
        />
        {query.trim() ? (
          <Pressable onPress={() => onChangeQuery('')} style={styles.clearSearchButton}>
            <X size={15} color="#61746b" />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.mealTabs}>
        {meals.map((item) => (
          <Pressable key={item} onPress={() => onChangeMeal(item)} style={[styles.mealTab, meal === item && styles.mealTabActive]}>
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
          <Pressable key={item.id} style={styles.foodRow} onPress={() => onSelectFood(item)}>
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
  );
}
