import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ProteinMateState, StreakState } from '../domain/types';

const STORAGE_KEY = 'proteinmate:v1';

export const DEFAULT_STREAK: StreakState = {
  goalStreak: 0,
  loggingStreak: 0,
  freezesAvailable: 0,
  lastGoalHitDate: null,
  lastLoggingDate: null
};

export const DEFAULT_PROTEIN_MATE_STATE: ProteinMateState = {
  goal: 120,
  logs: [],
  customFoods: [],
  streak: DEFAULT_STREAK
};

type StoredProteinMateState = Partial<ProteinMateState>;

function normalizeStreak(streak?: Partial<StreakState>): StreakState {
  return {
    goalStreak: streak?.goalStreak ?? DEFAULT_STREAK.goalStreak,
    loggingStreak: streak?.loggingStreak ?? DEFAULT_STREAK.loggingStreak,
    freezesAvailable: streak?.freezesAvailable ?? DEFAULT_STREAK.freezesAvailable,
    lastGoalHitDate: streak?.lastGoalHitDate ?? DEFAULT_STREAK.lastGoalHitDate,
    lastLoggingDate: streak?.lastLoggingDate ?? DEFAULT_STREAK.lastLoggingDate
  };
}

export async function loadProteinMateState(): Promise<ProteinMateState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PROTEIN_MATE_STATE;
  }

  const stored = JSON.parse(raw) as StoredProteinMateState;
  return {
    goal: stored.goal ?? DEFAULT_PROTEIN_MATE_STATE.goal,
    logs: stored.logs ?? DEFAULT_PROTEIN_MATE_STATE.logs,
    customFoods: stored.customFoods ?? DEFAULT_PROTEIN_MATE_STATE.customFoods,
    streak: normalizeStreak(stored.streak)
  };
}

export function saveProteinMateState(state: ProteinMateState) {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
