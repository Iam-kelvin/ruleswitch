import { RULE_CATEGORIES, type CategorySessionResult, type Difficulty, type RuleCategory, type RuleFocus, type SessionSummary } from '@/engine/types';

export const STORAGE_VERSION = 1;

export type ThemePreference = 'midnight' | 'daylight' | 'highContrast';

export interface Settings {
  sound: boolean;
  music: boolean;
  haptics: boolean;
  theme: ThemePreference;
  reducedMotion: boolean;
  preferredDifficulty: Difficulty;
}

export interface LifetimeStats {
  sessions: number;
  totalActions: number;
  correctActions: number;
  totalResponseTimeMs: number;
  bestResponseTimeMs: number | null;
  longestActionStreak: number;
  bestTimeAttackScore: number;
  bestNoMistakesRun: number;
}

export interface RuleStats extends CategorySessionResult {
  sessions: number;
}

export interface JourneyLevelResult {
  score: number;
  accuracy: number;
  bestStreak: number;
  completedAt: string;
}

export interface StoredDailyResult {
  score: number;
  accuracy: number;
  averageResponseTimeMs: number;
  bestStreak: number;
  mistakes: number;
  completedAt: string;
}

export interface ProgressData {
  storageVersion: number;
  hasCompletedTutorial: boolean;
  xp: number;
  settings: Settings;
  totals: LifetimeStats;
  ruleStats: Record<RuleCategory, RuleStats>;
  focusStats: Record<RuleFocus, RuleStats>;
  masteredRuleCategories: RuleCategory[];
  journey: {
    unlockedLevel: number;
    levels: Record<string, JourneyLevelResult>;
  };
  daily: {
    results: Record<string, StoredDailyResult>;
    currentStreak: number;
    longestStreak: number;
    lastCompletedDate: string | null;
  };
  achievements: Record<string, string>;
  lastResult: SessionSummary | null;
}

const emptyRuleStats = (): RuleStats => ({
  sessions: 0,
  attempts: 0,
  correct: 0,
  totalResponseTimeMs: 0,
  bestResponseTimeMs: null
});

export function createDefaultProgress(): ProgressData {
  const ruleStats = Object.fromEntries(RULE_CATEGORIES.map((category) => [category, emptyRuleStats()])) as Record<
    RuleCategory,
    RuleStats
  >;
  const focusStats = Object.fromEntries(
    (['color', 'shape', 'number', 'position', 'size', 'conditional'] satisfies RuleFocus[]).map((focus) => [focus, emptyRuleStats()])
  ) as Record<RuleFocus, RuleStats>;

  return {
    storageVersion: STORAGE_VERSION,
    hasCompletedTutorial: false,
    xp: 0,
    settings: {
      sound: true,
      music: false,
      haptics: true,
      theme: 'midnight',
      reducedMotion: false,
      preferredDifficulty: 'normal'
    },
    totals: {
      sessions: 0,
      totalActions: 0,
      correctActions: 0,
      totalResponseTimeMs: 0,
      bestResponseTimeMs: null,
      longestActionStreak: 0,
      bestTimeAttackScore: 0,
      bestNoMistakesRun: 0
    },
    ruleStats,
    focusStats,
    masteredRuleCategories: [],
    journey: {
      unlockedLevel: 1,
      levels: {}
    },
    daily: {
      results: {},
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null
    },
    achievements: {},
    lastResult: null
  };
}
