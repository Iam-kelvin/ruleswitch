import { describe, expect, it } from 'vitest';
import { DIFFICULTIES, type Difficulty } from './types';
import { generateSequence, dailySeed, localDateKey } from './sequence';
import { validateChallenge } from './validation';
import { getJourneyChapter } from './config';

describe('seeded procedural generation', () => {
  it('is deterministic for the same seed and game version', () => {
    const options = { seed: 'deterministic-case', difficulty: 'master' as const, mode: 'endless' as const, count: 80 };
    expect(generateSequence(options)).toEqual(generateSequence(options));
  });

  it('changes when the seed changes', () => {
    const base = { difficulty: 'normal' as const, mode: 'endless' as const, count: 20 };
    expect(generateSequence({ ...base, seed: 'a' })).not.toEqual(generateSequence({ ...base, seed: 'b' }));
  });

  it('marks only actual rule changes as switches', () => {
    const sequence = generateSequence({ seed: 'switch-markers', difficulty: 'normal', mode: 'endless', count: 9 });
    expect(sequence[0]?.isRuleSwitch).toBe(false);
    expect(sequence[4]?.isRuleSwitch).toBe(true);
    expect(sequence[4]?.rule.id).not.toBe(sequence[3]?.rule.id);
  });

  it.each(DIFFICULTIES)('generates large valid batches at %s difficulty', (difficulty: Difficulty) => {
    for (let batch = 0; batch < 8; batch += 1) {
      const sequence = generateSequence({ seed: `batch:${difficulty}:${batch}`, difficulty, mode: 'endless', count: 75 });
      expect(sequence).toHaveLength(75);
      for (const challenge of sequence) {
        const result = validateChallenge(challenge);
        expect(result.errors, `${difficulty}/${challenge.id}`).toEqual([]);
        expect(challenge.expectedTargets.length).toBeGreaterThan(0);
        expect(challenge.expectedTargets.length).toBeLessThan(challenge.objects.length);
      }
    }
  });

  it('introduces the intended Journey category in every chapter', () => {
    for (let chapterId = 1; chapterId <= 7; chapterId += 1) {
      const level = (chapterId - 1) * 5 + 1;
      const chapter = getJourneyChapter(level);
      const sequence = generateSequence({ seed: `journey:${level}`, difficulty: chapter.difficulty, mode: 'journey', count: 30, journeyLevel: level });
      expect(new Set(sequence.map((challenge) => challenge.rule.category))).toEqual(new Set([chapter.category]));
    }
  });

  it('derives a stable local daily seed', () => {
    const date = new Date(2026, 7, 29, 23, 55);
    expect(localDateKey(date)).toBe('2026-08-29');
    expect(dailySeed(date)).toBe('daily:2026-08-29');
    expect(generateSequence({ seed: dailySeed(date), difficulty: 'normal', mode: 'daily', count: 24 })).toEqual(
      generateSequence({ seed: dailySeed(new Date(2026, 7, 29, 1, 5)), difficulty: 'normal', mode: 'daily', count: 24 })
    );
  });
});
