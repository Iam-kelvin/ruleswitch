import { DIFFICULTY_CONFIG } from './config';
import type { Difficulty } from './types';

export interface ScoreActionInput {
  correct: boolean;
  responseTimeMs: number;
  promptTimeMs: number;
  streakBeforeAction: number;
  difficulty: Difficulty;
  firstAfterSwitch: boolean;
}

export function scoreAction(input: ScoreActionInput): number {
  if (!input.correct) return -Math.round(55 * DIFFICULTY_CONFIG[input.difficulty].scoreMultiplier);
  const speedRatio = Math.max(0, Math.min(1, 1 - input.responseTimeMs / input.promptTimeMs));
  const speedBonus = Math.round(100 * speedRatio);
  const streakMultiplier = 1 + Math.min(1.5, Math.floor(input.streakBeforeAction / 5) * 0.15);
  const switchBonus = input.firstAfterSwitch ? 75 : 0;
  return Math.round((100 + speedBonus + switchBonus) * streakMultiplier * DIFFICULTY_CONFIG[input.difficulty].scoreMultiplier);
}

export function applyScore(currentScore: number, delta: number): number {
  return Math.max(0, currentScore + delta);
}

export function calculateXp(score: number, correctActions: number, difficulty: Difficulty): number {
  const multiplier = DIFFICULTY_CONFIG[difficulty].scoreMultiplier;
  return Math.max(0, Math.round(score / 12 + correctActions * 4 * multiplier));
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 300)) + 1;
}

export function xpForLevel(level: number): number {
  return Math.max(0, (level - 1) ** 2 * 300);
}

export function xpForNextLevel(level: number): number {
  return level ** 2 * 300;
}
