import { describe, expect, it } from 'vitest';
import { applyScore, calculateXp, levelFromXp, scoreAction, xpForLevel, xpForNextLevel } from './scoring';

describe('scoring and progression math', () => {
  it('rewards speed, streaks, difficulty, and successful switch opportunities', () => {
    const base = scoreAction({ correct: true, responseTimeMs: 3000, promptTimeMs: 6000, streakBeforeAction: 0, difficulty: 'normal', firstAfterSwitch: false });
    const fast = scoreAction({ correct: true, responseTimeMs: 500, promptTimeMs: 6000, streakBeforeAction: 0, difficulty: 'normal', firstAfterSwitch: false });
    const streak = scoreAction({ correct: true, responseTimeMs: 500, promptTimeMs: 6000, streakBeforeAction: 10, difficulty: 'normal', firstAfterSwitch: false });
    const switched = scoreAction({ correct: true, responseTimeMs: 500, promptTimeMs: 6000, streakBeforeAction: 10, difficulty: 'master', firstAfterSwitch: true });
    expect(fast).toBeGreaterThan(base);
    expect(streak).toBeGreaterThan(fast);
    expect(switched).toBeGreaterThan(streak);
  });

  it('penalizes mistakes without allowing a negative total', () => {
    const penalty = scoreAction({ correct: false, responseTimeMs: 1000, promptTimeMs: 6000, streakBeforeAction: 12, difficulty: 'master', firstAfterSwitch: false });
    expect(penalty).toBeLessThan(0);
    expect(applyScore(20, penalty)).toBe(0);
  });

  it('keeps XP and level thresholds monotonic', () => {
    expect(calculateXp(0, 0, 'beginner')).toBe(0);
    expect(calculateXp(1000, 10, 'hard')).toBeGreaterThan(0);
    for (let level = 1; level < 20; level += 1) {
      expect(xpForNextLevel(level)).toBeGreaterThan(xpForLevel(level));
      expect(levelFromXp(xpForLevel(level))).toBe(level);
    }
  });
});
