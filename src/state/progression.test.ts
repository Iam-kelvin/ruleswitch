import { describe, expect, it } from 'vitest';
import { applySession } from './progression';
import { createDefaultProgress } from './schema';
import type { SessionSummary } from '@/engine/types';

function summary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: 'session',
    mode: 'endless',
    difficulty: 'normal',
    seed: 'seed',
    startedAt: '2026-08-29T10:00:00.000Z',
    completedAt: '2026-08-29T10:01:00.000Z',
    score: 2000,
    attempts: 10,
    correctActions: 9,
    mistakes: 1,
    accuracy: 0.9,
    averageResponseTimeMs: 900,
    bestResponseTimeMs: 500,
    bestStreak: 7,
    ruleSwitches: 2,
    xpEarned: 220,
    categoryResults: { tap: { attempts: 10, correct: 9, totalResponseTimeMs: 9000, bestResponseTimeMs: 500 } },
    focusResults: { color: { attempts: 10, correct: 9, totalResponseTimeMs: 9000, bestResponseTimeMs: 500 } },
    newAchievementIds: [],
    officialDaily: false,
    ...overrides
  };
}

describe('saved progression', () => {
  it('aggregates totals, XP, streaks, and rule stats', () => {
    const result = applySession(createDefaultProgress(), summary());
    expect(result.progress.xp).toBe(220);
    expect(result.progress.totals.correctActions).toBe(9);
    expect(result.progress.totals.longestActionStreak).toBe(7);
    expect(result.progress.ruleStats.tap.correct).toBe(9);
    expect(result.summary.newAchievementIds).toContain('first-switch');
  });

  it('unlocks the next Journey level and preserves a better prior score', () => {
    const first = applySession(createDefaultProgress(), summary({ mode: 'journey', journeyLevel: 1, score: 500 })).progress;
    expect(first.journey.unlockedLevel).toBe(2);
    const replay = applySession(first, summary({ mode: 'journey', journeyLevel: 1, score: 300 })).progress;
    expect(replay.journey.levels['1']?.score).toBe(500);
  });

  it('does not allow a forged Journey result to skip locked levels', () => {
    const result = applySession(
      createDefaultProgress(),
      summary({ mode: 'journey', journeyLevel: 35, difficulty: 'master', score: 50_000 })
    );
    expect(result.progress.journey.unlockedLevel).toBe(1);
    expect(result.progress.journey.levels['35']).toBeUndefined();
    expect(result.summary.newAchievementIds).not.toContain('master-cleared');
  });

  it('stores only the first official Daily result', () => {
    const first = applySession(createDefaultProgress(), summary({ mode: 'daily', seed: 'daily:2026-08-29', score: 1000 }));
    expect(first.summary.officialDaily).toBe(true);
    const replay = applySession(first.progress, summary({ mode: 'daily', seed: 'daily:2026-08-29', score: 9000 }));
    expect(replay.summary.officialDaily).toBe(false);
    expect(replay.progress.daily.results['2026-08-29']?.score).toBe(1000);
  });

  it('tracks consecutive local Daily dates and does not extend on replays', () => {
    const dayOne = applySession(createDefaultProgress(), summary({ mode: 'daily', seed: 'daily:2026-08-28' })).progress;
    const dayTwo = applySession(dayOne, summary({ mode: 'daily', seed: 'daily:2026-08-29' })).progress;
    expect(dayTwo.daily.currentStreak).toBe(2);
    const replay = applySession(dayTwo, summary({ mode: 'daily', seed: 'daily:2026-08-29' })).progress;
    expect(replay.daily.currentStreak).toBe(2);
  });

  it('unlocks cumulative achievements at their exact threshold', () => {
    const progress = createDefaultProgress();
    progress.totals.correctActions = 49;
    const result = applySession(progress, summary({ correctActions: 1, attempts: 1, mistakes: 0, accuracy: 1 }));
    expect(result.summary.newAchievementIds).toContain('correct-50');
  });

  it('tracks a rule category as mastered at 50 correct and 85% accuracy', () => {
    const progress = createDefaultProgress();
    progress.ruleStats.tap = { sessions: 4, attempts: 49, correct: 49, totalResponseTimeMs: 40_000, bestResponseTimeMs: 450 };
    const result = applySession(progress, summary({
      attempts: 1,
      correctActions: 1,
      mistakes: 0,
      categoryResults: { tap: { attempts: 1, correct: 1, totalResponseTimeMs: 500, bestResponseTimeMs: 500 } }
    }));
    expect(result.progress.masteredRuleCategories).toContain('tap');
  });
});
