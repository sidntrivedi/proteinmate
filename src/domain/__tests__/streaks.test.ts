import { describe, expect, it } from 'vitest';

import { dayDiff, nextStreak } from '../streaks';
import type { StreakState } from '../types';

const emptyStreak: StreakState = {
  goalStreak: 0,
  loggingStreak: 0,
  freezesAvailable: 0,
  lastGoalHitDate: null,
  lastLoggingDate: null
};

describe('streaks', () => {
  it('calculates day differences from date keys', () => {
    expect(dayDiff('2026-06-18', '2026-06-19')).toBe(1);
  });

  it('does not change when there is no goal hit and no new log', () => {
    expect(nextStreak(emptyStreak, false, false, '2026-06-19')).toBe(emptyStreak);
  });

  it('starts goal and logging streaks on the first successful day', () => {
    expect(nextStreak(emptyStreak, true, true, '2026-06-19')).toEqual({
      goalStreak: 1,
      loggingStreak: 1,
      freezesAvailable: 0,
      lastGoalHitDate: '2026-06-19',
      lastLoggingDate: '2026-06-19'
    });
  });

  it('increments consecutive goal and logging streaks', () => {
    const current: StreakState = {
      goalStreak: 2,
      loggingStreak: 3,
      freezesAvailable: 0,
      lastGoalHitDate: '2026-06-18',
      lastLoggingDate: '2026-06-18'
    };

    expect(nextStreak(current, true, true, '2026-06-19')).toMatchObject({
      goalStreak: 3,
      loggingStreak: 4,
      lastGoalHitDate: '2026-06-19',
      lastLoggingDate: '2026-06-19'
    });
  });

  it('spends one freeze to preserve a goal streak across a one-day gap', () => {
    const current: StreakState = {
      goalStreak: 5,
      loggingStreak: 1,
      freezesAvailable: 1,
      lastGoalHitDate: '2026-06-17',
      lastLoggingDate: '2026-06-18'
    };

    expect(nextStreak(current, true, true, '2026-06-19')).toMatchObject({
      goalStreak: 6,
      freezesAvailable: 0,
      lastGoalHitDate: '2026-06-19'
    });
  });

  it('resets the goal streak when the gap cannot be frozen', () => {
    const current: StreakState = {
      goalStreak: 5,
      loggingStreak: 1,
      freezesAvailable: 0,
      lastGoalHitDate: '2026-06-17',
      lastLoggingDate: '2026-06-18'
    };

    expect(nextStreak(current, true, true, '2026-06-19')).toMatchObject({
      goalStreak: 1,
      freezesAvailable: 0,
      lastGoalHitDate: '2026-06-19'
    });
  });

  it('awards a freeze every seven goal-streak days', () => {
    const current: StreakState = {
      goalStreak: 6,
      loggingStreak: 6,
      freezesAvailable: 0,
      lastGoalHitDate: '2026-06-18',
      lastLoggingDate: '2026-06-18'
    };

    expect(nextStreak(current, true, true, '2026-06-19')).toMatchObject({
      goalStreak: 7,
      freezesAvailable: 1
    });
  });

  it('increments logging streak without changing goal streak when the goal is missed', () => {
    const current: StreakState = {
      goalStreak: 2,
      loggingStreak: 2,
      freezesAvailable: 0,
      lastGoalHitDate: '2026-06-18',
      lastLoggingDate: '2026-06-18'
    };

    expect(nextStreak(current, false, true, '2026-06-19')).toEqual({
      goalStreak: 2,
      loggingStreak: 3,
      freezesAvailable: 0,
      lastGoalHitDate: '2026-06-18',
      lastLoggingDate: '2026-06-19'
    });
  });
});
