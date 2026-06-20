import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Share, StatusBar } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import { AppHeader } from './components/AppHeader';
import { CustomFoodModal } from './components/CustomFoodModal';
import { FoodSearchSection } from './components/FoodSearchSection';
import { PhotoLogModal } from './components/PhotoLogModal';
import { ProgressHero } from './components/ProgressHero';
import { ServingModal } from './components/ServingModal';
import { ShareCard } from './components/ShareCard';
import { TodayLogSection } from './components/TodayLogSection';
import { TrackerActions } from './components/TrackerActions';
import { VoiceLogModal } from './components/VoiceLogModal';
import { styles } from './styles';
import { usePhotoLogging } from './usePhotoLogging';
import { useProteinTracker } from './useProteinTracker';
import { useVoiceLogging } from './useVoiceLogging';

export function ProteinTrackerScreen() {
  const tracker = useProteinTracker();
  const voice = useVoiceLogging(tracker.allFoods);
  const photo = usePhotoLogging();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const shareRef = useRef<ViewShot>(null);

  const openVoiceLog = () => {
    voice.reset();
    setVoiceOpen(true);
  };

  const closeVoiceLog = () => {
    setVoiceOpen(false);
    voice.reset();
  };

  const confirmVoiceLog = () => {
    tracker.addLogs(voice.items.map((item) => ({ food: item.food, serving: item.serving })));
    closeVoiceLog();
  };

  const openPhotoLog = () => {
    photo.reset();
    setPhotoOpen(true);
  };

  const closePhotoLog = () => {
    setPhotoOpen(false);
    photo.reset();
  };

  const confirmPhotoLog = () => {
    tracker.addPhotoLogs(photo.items);
    closePhotoLog();
  };

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
          <TrackerActions
            onRepeatYesterday={tracker.repeatYesterday}
            onShareProgress={shareProgress}
            onVoiceLog={openVoiceLog}
            onPhotoLog={openPhotoLog}
          />
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
      <VoiceLogModal
        isOpen={voiceOpen}
        status={voice.status}
        transcript={voice.transcript}
        items={voice.items}
        error={voice.error}
        onStart={voice.startRecording}
        onStop={voice.stopAndTranscribe}
        onRemoveItem={voice.removeItem}
        onConfirm={confirmVoiceLog}
        onClose={closeVoiceLog}
      />
      <PhotoLogModal
        isOpen={photoOpen}
        status={photo.status}
        items={photo.items}
        error={photo.error}
        onCapture={photo.capture}
        onSetGrams={photo.setGrams}
        onRemoveItem={photo.removeItem}
        onConfirm={confirmPhotoLog}
        onClose={closePhotoLog}
      />
    </SafeAreaView>
  );
}
