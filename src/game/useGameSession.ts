import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { DIFFICULTY_CONFIG, getJourneySessionLength, MODE_CONFIG } from '@/engine/config';
import { applyScore, calculateXp, scoreAction } from '@/engine/scoring';
import { generateSequence } from '@/engine/sequence';
import type {
  ActionType,
  CategorySessionResult,
  Challenge,
  Difficulty,
  GameMode,
  RuleCategory,
  RuleFocus,
  SessionSummary
} from '@/engine/types';
import { track } from '@/services/analytics';
import { useFeedback } from '@/services/FeedbackProvider';

const EMPTY_RESULT = (): CategorySessionResult => ({ attempts: 0, correct: 0, totalResponseTimeMs: 0, bestResponseTimeMs: null });

interface SessionOptions {
  mode: GameMode;
  difficulty: Difficulty;
  seed: string;
  journeyLevel?: number;
  onComplete(summary: SessionSummary): void;
}

interface InternalState {
  index: number;
  score: number;
  attempts: number;
  correctActions: number;
  mistakes: number;
  currentStreak: number;
  bestStreak: number;
  successfulSwitches: number;
  totalResponseTimeMs: number;
  bestResponseTimeMs: number | null;
  categoryResults: Partial<Record<RuleCategory, CategorySessionResult>>;
  focusResults: Partial<Record<RuleFocus, CategorySessionResult>>;
  paused: boolean;
  inputLocked: boolean;
  promptRemainingMs: number;
  overallRemainingMs: number | null;
  feedback: 'correct' | 'incorrect' | 'switch' | null;
}

const initialState = (promptMs: number, overallMs: number | null): InternalState => ({
  index: 0,
  score: 0,
  attempts: 0,
  correctActions: 0,
  mistakes: 0,
  currentStreak: 0,
  bestStreak: 0,
  successfulSwitches: 0,
  totalResponseTimeMs: 0,
  bestResponseTimeMs: null,
  categoryResults: {},
  focusResults: {},
  paused: false,
  inputLocked: false,
  promptRemainingMs: promptMs,
  overallRemainingMs: overallMs,
  feedback: 'switch'
});

function addResult(
  collection: Partial<Record<string, CategorySessionResult>>,
  key: string,
  correct: boolean,
  responseTimeMs: number
): Partial<Record<string, CategorySessionResult>> {
  const current = collection[key] ?? EMPTY_RESULT();
  return {
    ...collection,
    [key]: {
      attempts: current.attempts + 1,
      correct: current.correct + (correct ? 1 : 0),
      totalResponseTimeMs: current.totalResponseTimeMs + responseTimeMs,
      bestResponseTimeMs: correct
        ? current.bestResponseTimeMs === null
          ? responseTimeMs
          : Math.min(current.bestResponseTimeMs, responseTimeMs)
        : current.bestResponseTimeMs
    }
  };
}

export function useGameSession({ mode, difficulty, seed, journeyLevel, onComplete }: SessionOptions) {
  const feedbackService = useFeedback();
  const config = DIFFICULTY_CONFIG[difficulty];
  const targetCorrect = mode === 'journey' && journeyLevel ? getJourneySessionLength(journeyLevel) : MODE_CONFIG[mode].sessionLength;
  const sequenceRef = useRef<Challenge[]>([]);
  if (sequenceRef.current.length === 0) {
    sequenceRef.current = generateSequence({ seed, difficulty, mode, count: 500, ...(journeyLevel ? { journeyLevel } : {}) });
  }

  const startedAtRef = useRef(new Date());
  const promptStartedRef = useRef(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef(0);
  const timePenaltyRef = useRef(0);
  const completedRef = useRef(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState(() => initialState(config.promptTimeMs, MODE_CONFIG[mode].timeLimitMs));
  const stateRef = useRef(state);

  const update = useCallback((producer: (current: InternalState) => InternalState) => {
    const next = producer(stateRef.current);
    stateRef.current = next;
    setState(next);
    return next;
  }, []);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    const current = stateRef.current;
    const completedAt = new Date();
    const summary: SessionSummary = {
      id: `${seed}:${startedAtRef.current.getTime()}`,
      mode,
      difficulty,
      seed,
      ...(journeyLevel ? { journeyLevel } : {}),
      startedAt: startedAtRef.current.toISOString(),
      completedAt: completedAt.toISOString(),
      score: current.score,
      attempts: current.attempts,
      correctActions: current.correctActions,
      mistakes: current.mistakes,
      accuracy: current.attempts > 0 ? current.correctActions / current.attempts : 0,
      averageResponseTimeMs: current.attempts > 0 ? Math.round(current.totalResponseTimeMs / current.attempts) : 0,
      bestResponseTimeMs: current.bestResponseTimeMs,
      bestStreak: current.bestStreak,
      ruleSwitches: current.successfulSwitches,
      xpEarned: calculateXp(current.score, current.correctActions, difficulty),
      categoryResults: current.categoryResults,
      focusResults: current.focusResults,
      newAchievementIds: [],
      officialDaily: false
    };
    onComplete(summary);
  }, [difficulty, journeyLevel, mode, onComplete, seed]);

  const advance = useCallback(() => {
    if (completedRef.current) return;
    const current = stateRef.current;
    if ((mode === 'journey' || mode === 'daily') && current.correctActions >= targetCorrect) {
      finish();
      return;
    }
    const nextIndex = current.index + 1;
    if (nextIndex >= sequenceRef.current.length) {
      const extension = generateSequence({
        seed: `${seed}:extension:${Math.floor(nextIndex / 500)}`,
        difficulty,
        mode,
        count: 500,
        ...(journeyLevel ? { journeyLevel } : {})
      }).map((challenge, offset) => ({ ...challenge, index: nextIndex + offset }));
      sequenceRef.current.push(...extension);
    }
    const nextChallenge = sequenceRef.current[nextIndex]!;
    promptStartedRef.current = Date.now();
    update((value) => ({
      ...value,
      index: nextIndex,
      inputLocked: false,
      promptRemainingMs: nextChallenge.timeLimitMs,
      feedback: nextChallenge.isRuleSwitch ? 'switch' : null
    }));
    if (nextChallenge.isRuleSwitch) {
      feedbackService.result('rule');
      track('rule_changed', { rule_type: nextChallenge.rule.category, rule_id: nextChallenge.rule.id });
      track('rule_type', { rule_type: nextChallenge.rule.category, rule_id: nextChallenge.rule.id });
      const clearDelay = stateRef.current.paused ? 0 : 700;
      if (clearDelay) setTimeout(() => update((value) => ({ ...value, feedback: null })), clearDelay);
    }
  }, [difficulty, feedbackService, finish, journeyLevel, mode, seed, targetCorrect, update]);

  const resolveAttempt = useCallback(
    (objectId: string | null, action: ActionType | null, timedOut = false) => {
      const before = stateRef.current;
      if (before.inputLocked || before.paused || completedRef.current) return;
      const challenge = sequenceRef.current[before.index]!;
      const correct = !timedOut && challenge.expectedTargets.some((target) => target.objectId === objectId && target.action === action);
      const responseTimeMs = timedOut ? challenge.timeLimitMs : Math.min(challenge.timeLimitMs, Math.max(1, Date.now() - promptStartedRef.current));
      if (action) feedbackService.input(action);
      feedbackService.result(correct ? 'correct' : 'incorrect');
      track(correct ? 'action_correct' : 'action_incorrect', {
        rule_type: challenge.rule.category,
        rule_id: challenge.rule.id,
        response_ms: responseTimeMs,
        timed_out: timedOut
      });

      const delta = scoreAction({
        correct,
        responseTimeMs,
        promptTimeMs: challenge.timeLimitMs,
        streakBeforeAction: before.currentStreak,
        difficulty,
        firstAfterSwitch: challenge.isRuleSwitch
      });
      const nextStreak = correct ? before.currentStreak + 1 : 0;
      const next = update((current) => ({
        ...current,
        score: applyScore(current.score, delta),
        attempts: current.attempts + 1,
        correctActions: current.correctActions + (correct ? 1 : 0),
        mistakes: current.mistakes + (correct ? 0 : 1),
        currentStreak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
        successfulSwitches: current.successfulSwitches + (correct && challenge.isRuleSwitch ? 1 : 0),
        totalResponseTimeMs: current.totalResponseTimeMs + responseTimeMs,
        bestResponseTimeMs: correct
          ? current.bestResponseTimeMs === null
            ? responseTimeMs
            : Math.min(current.bestResponseTimeMs, responseTimeMs)
          : current.bestResponseTimeMs,
        categoryResults: addResult(current.categoryResults, challenge.rule.category, correct, responseTimeMs) as InternalState['categoryResults'],
        focusResults: addResult(current.focusResults, challenge.rule.focus, correct, responseTimeMs) as InternalState['focusResults'],
        inputLocked: true,
        feedback: correct ? 'correct' : 'incorrect'
      }));
      if (!correct && mode === 'timeAttack') timePenaltyRef.current += 2000;
      if (correct && nextStreak > 0 && nextStreak % 5 === 0) feedbackService.result('streak');

      const delay = 340;
      advanceTimerRef.current = setTimeout(() => {
        if (!correct && mode === 'noMistakes') finish();
        else if ((mode === 'journey' || mode === 'daily') && next.correctActions >= targetCorrect) finish();
        else advance();
      }, delay);
    },
    [advance, difficulty, feedbackService, finish, mode, targetCorrect, update]
  );

  const togglePause = useCallback(() => {
    const current = stateRef.current;
    if (current.inputLocked || completedRef.current) return;
    if (current.paused) {
      const now = Date.now();
      const pausedFor = pausedAtRef.current ? now - pausedAtRef.current : 0;
      pausedTotalRef.current += pausedFor;
      promptStartedRef.current += pausedFor;
      pausedAtRef.current = null;
      update((value) => ({ ...value, paused: false }));
    } else {
      pausedAtRef.current = Date.now();
      update((value) => ({ ...value, paused: true }));
    }
  }, [update]);

  useEffect(() => {
    feedbackService.result('rule');
    track('round_started', { mode, difficulty, rule_type: sequenceRef.current[0]!.rule.category });
    track('rule_type', { rule_type: sequenceRef.current[0]!.rule.category, rule_id: sequenceRef.current[0]!.rule.id });
    if (mode === 'daily') track('daily_started', { difficulty });
    if (mode === 'timeAttack') track('time_attack_started', { difficulty });
    if (mode === 'noMistakes') track('no_mistakes_started', { difficulty });
    const clear = setTimeout(() => update((value) => ({ ...value, feedback: null })), 700);
    return () => clearTimeout(clear);
  }, [difficulty, feedbackService, mode, update]);

  useEffect(() => {
    const timer = setInterval(() => {
      const current = stateRef.current;
      if (current.paused || current.inputLocked || completedRef.current) return;
      const now = Date.now();
      const challenge = sequenceRef.current[current.index]!;
      const promptRemainingMs = Math.max(0, challenge.timeLimitMs - (now - promptStartedRef.current));
      const limit = MODE_CONFIG[mode].timeLimitMs;
      const overallRemainingMs = limit === null ? null : Math.max(0, limit - (now - startedAtRef.current.getTime() - pausedTotalRef.current) - timePenaltyRef.current);
      update((value) => ({ ...value, promptRemainingMs, overallRemainingMs }));
      if (overallRemainingMs !== null && overallRemainingMs <= 0) finish();
      else if (promptRemainingMs <= 0) resolveAttempt(null, null, true);
    }, 100);
    return () => clearInterval(timer);
  }, [finish, mode, resolveAttempt, update]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active' && !stateRef.current.paused && !completedRef.current) togglePause();
    });
    return () => subscription.remove();
  }, [togglePause]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    },
    []
  );

  const challenge = sequenceRef.current[state.index]!;
  return useMemo(
    () => ({
      state,
      challenge,
      targetCorrect: mode === 'journey' || mode === 'daily' ? targetCorrect : null,
      promptTimeRatio: state.promptRemainingMs / challenge.timeLimitMs,
      act: (objectId: string, action: ActionType) => resolveAttempt(objectId, action),
      togglePause,
      finish
    }),
    [challenge, finish, mode, resolveAttempt, state, targetCorrect, togglePause]
  );
}
