import { beforeEach, describe, expect, it, vi } from 'vitest';

const asyncStorage = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn()
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: asyncStorage
}));

import { DEFAULT_PROTEIN_MATE_STATE, loadProteinMateState, saveProteinMateState } from '../proteinMateStorage';

describe('proteinMateStorage', () => {
  beforeEach(() => {
    asyncStorage.getItem.mockReset();
    asyncStorage.setItem.mockReset();
  });

  it('returns defaults when nothing has been stored', async () => {
    asyncStorage.getItem.mockResolvedValue(null);

    await expect(loadProteinMateState()).resolves.toEqual(DEFAULT_PROTEIN_MATE_STATE);
  });

  it('normalizes missing fields from older stored state', async () => {
    asyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        goal: 140,
        streak: {
          goalStreak: 3
        }
      })
    );

    await expect(loadProteinMateState()).resolves.toEqual({
      goal: 140,
      logs: [],
      customFoods: [],
      streak: {
        goalStreak: 3,
        loggingStreak: 0,
        freezesAvailable: 0,
        lastGoalHitDate: null,
        lastLoggingDate: null
      }
    });
  });

  it('saves the complete state payload under the app storage key', async () => {
    asyncStorage.setItem.mockResolvedValue(undefined);

    await saveProteinMateState(DEFAULT_PROTEIN_MATE_STATE);

    expect(asyncStorage.setItem).toHaveBeenCalledWith('proteinmate:v1', JSON.stringify(DEFAULT_PROTEIN_MATE_STATE));
  });
});
