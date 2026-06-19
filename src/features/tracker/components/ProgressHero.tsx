import { LinearGradient } from 'expo-linear-gradient';
import { Flame } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type { StreakState } from '../../../domain/types';
import { styles } from '../styles';

type ProgressHeroProps = {
  consumed: number;
  goal: number;
  percent: number;
  remaining: number;
  streak: StreakState;
};

export function ProgressHero({ consumed, goal, percent, remaining, streak }: ProgressHeroProps) {
  return (
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
  );
}
