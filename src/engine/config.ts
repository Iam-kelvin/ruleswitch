import type { Difficulty, GameMode, RuleCategory } from './types';

export const GAME_VERSION = '1.0.0';

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string;
    objectCount: number;
    promptTimeMs: number;
    switchEvery: number;
    scoreMultiplier: number;
  }
> = {
  beginner: { label: 'Beginner', objectCount: 3, promptTimeMs: 8000, switchEvery: 5, scoreMultiplier: 1 },
  easy: { label: 'Easy', objectCount: 3, promptTimeMs: 7000, switchEvery: 4, scoreMultiplier: 1.15 },
  normal: { label: 'Normal', objectCount: 4, promptTimeMs: 6000, switchEvery: 4, scoreMultiplier: 1.35 },
  hard: { label: 'Hard', objectCount: 4, promptTimeMs: 5000, switchEvery: 3, scoreMultiplier: 1.6 },
  expert: { label: 'Expert', objectCount: 5, promptTimeMs: 4200, switchEvery: 3, scoreMultiplier: 1.9 },
  master: { label: 'Master', objectCount: 5, promptTimeMs: 3600, switchEvery: 2, scoreMultiplier: 2.25 }
};

export const MODE_CONFIG: Record<
  GameMode,
  { label: string; description: string; sessionLength: number; timeLimitMs: number | null }
> = {
  journey: {
    label: 'Journey',
    description: 'Learn every rule family across 35 handcrafted-seeded levels.',
    sessionLength: 12,
    timeLimitMs: null
  },
  daily: {
    label: 'Daily Switch',
    description: 'The same deterministic challenge for everyone, every day.',
    sessionLength: 24,
    timeLimitMs: null
  },
  endless: {
    label: 'Endless',
    description: 'Keep adapting for as long as you like.',
    sessionLength: 500,
    timeLimitMs: null
  },
  timeAttack: {
    label: 'Time Attack',
    description: 'Score as much as possible in 60 seconds.',
    sessionLength: 500,
    timeLimitMs: 60_000
  },
  noMistakes: {
    label: 'No Mistakes',
    description: 'One wrong move ends the run. How long can you hold on?',
    sessionLength: 500,
    timeLimitMs: null
  }
};

export interface JourneyChapter {
  id: number;
  title: string;
  subtitle: string;
  category: RuleCategory;
  difficulty: Difficulty;
  accent: string;
}

export const JOURNEY_CHAPTERS: JourneyChapter[] = [
  { id: 1, title: 'Signal', subtitle: 'Tap the right target', category: 'tap', difficulty: 'beginner', accent: '#41E3B5' },
  { id: 2, title: 'Resist', subtitle: 'Ignore the distractor', category: 'ignore', difficulty: 'easy', accent: '#58B9FF' },
  { id: 3, title: 'Count', subtitle: 'Read numbers fast', category: 'number', difficulty: 'normal', accent: '#FFC15C' },
  { id: 4, title: 'Momentum', subtitle: 'Add directional swipes', category: 'swipe', difficulty: 'hard', accent: '#FF7897' },
  { id: 5, title: 'Compare', subtitle: 'Judge the whole board', category: 'comparison', difficulty: 'hard', accent: '#B59CFF' },
  { id: 6, title: 'Crosswire', subtitle: 'Combine two conditions', category: 'conditional', difficulty: 'expert', accent: '#FF9F5A' },
  { id: 7, title: 'Invert', subtitle: 'Break the old reflex', category: 'reversal', difficulty: 'master', accent: '#F1F66C' }
];

export const JOURNEY_LEVEL_COUNT = JOURNEY_CHAPTERS.length * 5;

export function getJourneyChapter(level: number): JourneyChapter {
  const index = Math.min(JOURNEY_CHAPTERS.length - 1, Math.max(0, Math.floor((level - 1) / 5)));
  return JOURNEY_CHAPTERS[index]!;
}

export function getJourneySessionLength(level: number): number {
  return 10 + ((Math.max(1, level) - 1) % 5);
}
