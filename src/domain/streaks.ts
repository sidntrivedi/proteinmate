import type { StreakState } from './types';

export const todayKey = () => new Date().toISOString().slice(0, 10);

export function dayDiff(a: string, b: string) {
  const first = new Date(`${a}T00:00:00`).getTime();
  const second = new Date(`${b}T00:00:00`).getTime();
  return Math.round((second - first) / 86400000);
}

export function nextStreak(state: StreakState, goalHitToday: boolean, loggedToday: boolean, date: string): StreakState {
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
