import { findNewAchievements } from '@/engine/achievements';
import { JOURNEY_LEVEL_COUNT } from '@/engine/config';
import { localDateKey } from '@/engine/sequence';
import type { CategorySessionResult, RuleCategory, RuleFocus, SessionSummary } from '@/engine/types';
import type { ProgressData, RuleStats } from './schema';

function earlierDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year!, month! - 1, day!);
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

function mergeStat(current: RuleStats, addition: CategorySessionResult): RuleStats {
  const best = addition.bestResponseTimeMs;
  return {
    sessions: current.sessions + 1,
    attempts: current.attempts + addition.attempts,
    correct: current.correct + addition.correct,
    totalResponseTimeMs: current.totalResponseTimeMs + addition.totalResponseTimeMs,
    bestResponseTimeMs:
      best === null ? current.bestResponseTimeMs : current.bestResponseTimeMs === null ? best : Math.min(current.bestResponseTimeMs, best)
  };
}

export interface ApplySessionResult {
  progress: ProgressData;
  summary: SessionSummary;
}

export function applySession(data: ProgressData, incoming: SessionSummary): ApplySessionResult {
  const progress = JSON.parse(JSON.stringify(data)) as ProgressData;
  const dailyDate = incoming.seed.startsWith('daily:') ? incoming.seed.replace('daily:', '') : localDateKey(new Date(incoming.completedAt));
  const officialDaily = incoming.mode === 'daily' && !progress.daily.results[dailyDate];

  const summary: SessionSummary = { ...incoming, officialDaily, newAchievementIds: [] };
  progress.xp += summary.xpEarned;
  progress.totals.sessions += 1;
  progress.totals.totalActions += summary.attempts;
  progress.totals.correctActions += summary.correctActions;
  progress.totals.totalResponseTimeMs += summary.averageResponseTimeMs * summary.attempts;
  progress.totals.longestActionStreak = Math.max(progress.totals.longestActionStreak, summary.bestStreak);
  if (summary.bestResponseTimeMs !== null) {
    progress.totals.bestResponseTimeMs =
      progress.totals.bestResponseTimeMs === null
        ? summary.bestResponseTimeMs
        : Math.min(progress.totals.bestResponseTimeMs, summary.bestResponseTimeMs);
  }

  if (summary.mode === 'timeAttack') {
    progress.totals.bestTimeAttackScore = Math.max(progress.totals.bestTimeAttackScore, summary.score);
  }
  if (summary.mode === 'noMistakes') {
    progress.totals.bestNoMistakesRun = Math.max(progress.totals.bestNoMistakesRun, summary.bestStreak);
  }

  for (const [category, result] of Object.entries(summary.categoryResults)) {
    if (result) progress.ruleStats[category as RuleCategory] = mergeStat(progress.ruleStats[category as RuleCategory], result);
  }
  for (const [focus, result] of Object.entries(summary.focusResults)) {
    if (result) progress.focusStats[focus as RuleFocus] = mergeStat(progress.focusStats[focus as RuleFocus], result);
  }
  progress.masteredRuleCategories = (Object.keys(progress.ruleStats) as RuleCategory[]).filter((category) => {
    const stat = progress.ruleStats[category];
    return stat.correct >= 50 && stat.attempts > 0 && stat.correct / stat.attempts >= 0.85;
  });

  if (summary.mode === 'journey' && summary.journeyLevel !== undefined) {
    const key = String(summary.journeyLevel);
    const previous = progress.journey.levels[key];
    if (!previous || summary.score > previous.score) {
      progress.journey.levels[key] = {
        score: summary.score,
        accuracy: summary.accuracy,
        bestStreak: summary.bestStreak,
        completedAt: summary.completedAt
      };
    }
    progress.journey.unlockedLevel = Math.min(JOURNEY_LEVEL_COUNT, Math.max(progress.journey.unlockedLevel, summary.journeyLevel + 1));
  }

  if (officialDaily) {
    progress.daily.results[dailyDate] = {
      score: summary.score,
      accuracy: summary.accuracy,
      averageResponseTimeMs: summary.averageResponseTimeMs,
      bestStreak: summary.bestStreak,
      mistakes: summary.mistakes,
      completedAt: summary.completedAt
    };
    progress.daily.currentStreak =
      progress.daily.lastCompletedDate === earlierDateKey(dailyDate)
        ? progress.daily.currentStreak + 1
        : progress.daily.lastCompletedDate === dailyDate
          ? progress.daily.currentStreak
          : 1;
    progress.daily.longestStreak = Math.max(progress.daily.longestStreak, progress.daily.currentStreak);
    progress.daily.lastCompletedDate = dailyDate;
  }

  const newAchievementIds = findNewAchievements(progress, summary);
  for (const id of newAchievementIds) progress.achievements[id] = summary.completedAt;
  summary.newAchievementIds = newAchievementIds;
  progress.lastResult = summary;
  return { progress, summary };
}
