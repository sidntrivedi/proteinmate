import { LinearGradient } from 'expo-linear-gradient';
import { Award } from 'lucide-react-native';
import { type RefObject } from 'react';
import { Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

import type { FoodLog, StreakState } from '../../../domain/types';
import { styles } from '../styles';

type ShareCardProps = {
  consumed: number;
  percent: number;
  shareRef: RefObject<ViewShot | null>;
  streak: StreakState;
  topFood?: FoodLog;
};

export function ShareCard({ consumed, percent, shareRef, streak, topFood }: ShareCardProps) {
  return (
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
        <Text style={styles.shareFood}>{topFood ? `Top hit: ${topFood.foodName} +${topFood.protein}g` : 'First log loading...'}</Text>
        <Text style={styles.shareFooter}>Built for Indian plates, coach check-ins, and no-excuse days.</Text>
      </LinearGradient>
    </ViewShot>
  );
}
