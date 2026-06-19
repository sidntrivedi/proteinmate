import * as Sharing from 'expo-sharing';
import { useRef } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Share, StatusBar } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { AppHeader } from './components/AppHeader';
import { CustomFoodModal } from './components/CustomFoodModal';
import { FoodSearchSection } from './components/FoodSearchSection';
import { ProgressHero } from './components/ProgressHero';
import { ServingModal } from './components/ServingModal';
import { ShareCard } from './components/ShareCard';
import { TodayLogSection } from './components/TodayLogSection';
import { TrackerActions } from './components/TrackerActions';
import { styles } from './styles';
import { useProteinTracker } from './useProteinTracker';

export function ProteinTrackerScreen() {
  const tracker = useProteinTracker();
  const shareRef = useRef<ViewShot>(null);

  const shareProgress = async () => {
    const message = `ProteinMate check-in: ${tracker.consumed}/${tracker.goal} g protein today (${Math.round(
      tracker.percent * 100
    )}%). Goal streak: ${tracker.streak.goalStreak} days.`;
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
          <AppHeader onAddFoodPress={() => tracker.setCustomOpen(true)} />
          <ProgressHero
            consumed={tracker.consumed}
            goal={tracker.goal}
            percent={tracker.percent}
            remaining={tracker.remaining}
            streak={tracker.streak}
          />
          <TrackerActions onRepeatYesterday={tracker.repeatYesterday} onShareProgress={shareProgress} />
          <FoodSearchSection
            meal={tracker.meal}
            meals={tracker.meals}
            query={tracker.query}
            results={tracker.results}
            visibleResults={tracker.visibleResults}
            onChangeMeal={tracker.setMeal}
            onChangeQuery={tracker.setQuery}
            onSelectFood={tracker.setSelectedFood}
          />
          <TodayLogSection logs={tracker.todayLogs} onRemoveLog={tracker.removeLog} />
          <ShareCard
            consumed={tracker.consumed}
            percent={tracker.percent}
            shareRef={shareRef}
            streak={tracker.streak}
            topFood={tracker.topFood}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <ServingModal
        meal={tracker.meal}
        selectedFood={tracker.selectedFood}
        onAddLog={tracker.addLog}
        onClose={() => tracker.setSelectedFood(null)}
      />
      <CustomFoodModal
        customName={tracker.customName}
        customProtein={tracker.customProtein}
        customServing={tracker.customServing}
        isOpen={tracker.customOpen}
        onChangeName={tracker.setCustomName}
        onChangeProtein={tracker.setCustomProtein}
        onChangeServing={tracker.setCustomServing}
        onClose={() => tracker.setCustomOpen(false)}
        onSave={tracker.saveCustomFood}
      />
    </SafeAreaView>
  );
}
