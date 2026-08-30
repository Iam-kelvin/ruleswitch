import { JOURNEY_LEVEL_COUNT } from './config';
import type { SessionSummary } from './types';
import type { ProgressData } from '@/state/schema';

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: (data: ProgressData) => number;
  unlocked: (data: ProgressData, session: SessionSummary) => boolean;
}

const accuracy = (attempts: number, correct: number) => (attempts > 0 ? correct / attempts : 0);

export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-switch',
    title: 'First Switch',
    description: 'Successfully finish a run with a rule change.',
    icon: '↔',
    target: 1,
    progress: (data) => (data.totals.sessions > 0 ? 1 : 0),
    unlocked: (_data, session) => session.ruleSwitches > 0 && session.correctActions > 0
  },
  {
    id: 'correct-50',
    title: '50 Correct',
    description: 'Make 50 correct actions across all modes.',
    icon: '50',
    target: 50,
    progress: (data) => data.totals.correctActions,
    unlocked: (data) => data.totals.correctActions >= 50
  },
  {
    id: 'correct-500',
    title: '500 Correct',
    description: 'Make 500 correct actions across all modes.',
    icon: '500',
    target: 500,
    progress: (data) => data.totals.correctActions,
    unlocked: (data) => data.totals.correctActions >= 500
  },
  {
    id: 'perfect-round',
    title: 'Perfect Round',
    description: 'Complete a fixed-length round with no mistakes.',
    icon: '◎',
    target: 1,
    progress: (data) => (data.achievements['perfect-round'] ? 1 : 0),
    unlocked: (_data, session) => session.mode !== 'endless' && session.attempts >= 10 && session.mistakes === 0
  },
  {
    id: 'no-mistakes-25',
    title: 'No Mistakes 25',
    description: 'Reach a streak of 25 in No Mistakes.',
    icon: '◇',
    target: 25,
    progress: (data) => data.totals.bestNoMistakesRun,
    unlocked: (data) => data.totals.bestNoMistakesRun >= 25
  },
  {
    id: 'speed-switch',
    title: 'Speed Switch',
    description: 'React in under 650 ms during a run with a switch.',
    icon: '⚡',
    target: 1,
    progress: (data) => (data.achievements['speed-switch'] ? 1 : 0),
    unlocked: (_data, session) => session.ruleSwitches > 0 && (session.bestResponseTimeMs ?? Infinity) < 650
  },
  {
    id: 'seven-day-streak',
    title: 'Seven-Day Streak',
    description: 'Complete the official Daily Switch seven days in a row.',
    icon: '7',
    target: 7,
    progress: (data) => data.daily.longestStreak,
    unlocked: (data) => data.daily.longestStreak >= 7
  },
  {
    id: 'thirty-day-streak',
    title: 'Thirty-Day Streak',
    description: 'Complete the official Daily Switch thirty days in a row.',
    icon: '30',
    target: 30,
    progress: (data) => data.daily.longestStreak,
    unlocked: (data) => data.daily.longestStreak >= 30
  },
  {
    id: 'number-master',
    title: 'Number Master',
    description: 'Reach 100 correct number-focused actions at 85% accuracy.',
    icon: '#',
    target: 100,
    progress: (data) => data.focusStats.number.correct,
    unlocked: (data) =>
      data.focusStats.number.correct >= 100 && accuracy(data.focusStats.number.attempts, data.focusStats.number.correct) >= 0.85
  },
  {
    id: 'shape-master',
    title: 'Shape Master',
    description: 'Reach 100 correct shape-focused actions at 85% accuracy.',
    icon: '△',
    target: 100,
    progress: (data) => data.focusStats.shape.correct,
    unlocked: (data) =>
      data.focusStats.shape.correct >= 100 && accuracy(data.focusStats.shape.attempts, data.focusStats.shape.correct) >= 0.85
  },
  {
    id: 'conditional-master',
    title: 'Conditional Master',
    description: 'Reach 100 correct conditional actions at 85% accuracy.',
    icon: '&',
    target: 100,
    progress: (data) => data.ruleStats.conditional.correct,
    unlocked: (data) =>
      data.ruleStats.conditional.correct >= 100 &&
      accuracy(data.ruleStats.conditional.attempts, data.ruleStats.conditional.correct) >= 0.85
  },
  {
    id: 'master-cleared',
    title: 'Master Difficulty Cleared',
    description: 'Complete the final Journey level.',
    icon: 'M',
    target: JOURNEY_LEVEL_COUNT,
    progress: (data) => Object.keys(data.journey.levels).length,
    unlocked: (data) => Boolean(data.journey.levels[String(JOURNEY_LEVEL_COUNT)])
  }
];

export function findNewAchievements(data: ProgressData, session: SessionSummary): string[] {
  return ACHIEVEMENTS.filter((achievement) => !data.achievements[achievement.id] && achievement.unlocked(data, session)).map(
    (achievement) => achievement.id
  );
}
