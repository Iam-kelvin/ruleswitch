import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { SessionSummary } from '@/engine/types';
import { track } from '@/services/analytics';
import { reportError } from '@/services/errors';
import { applySession } from './progression';
import { clearProgress, loadProgress, saveProgress, type StorageAdapter } from './persistence';
import { createDefaultProgress, type ProgressData, type Settings } from './schema';

type LoadStatus = 'loading' | 'ready' | 'error';

interface ProgressContextValue {
  data: ProgressData;
  status: LoadStatus;
  error: string | null;
  completeTutorial(): void;
  updateSettings(settings: Partial<Settings>): void;
  completeSession(summary: SessionSummary): SessionSummary;
  resetProgress(): Promise<void>;
  retryLoad(): void;
  useFreshProgress(): void;
}

const storage: StorageAdapter = AsyncStorage;
const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<ProgressData>(createDefaultProgress);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const loadAttempt = useRef(0);

  const hydrate = useCallback(() => {
    const attempt = ++loadAttempt.current;
    setStatus('loading');
    setError(null);
    loadProgress(storage)
      .then((progress) => {
        if (attempt !== loadAttempt.current) return;
        dataRef.current = progress;
        setData(progress);
        setStatus('ready');
      })
      .catch((caught: unknown) => {
        if (attempt !== loadAttempt.current) return;
        reportError(caught, { operation: 'load_progress' });
        setError(caught instanceof Error ? caught.message : 'Progress could not be loaded.');
        setStatus('error');
      });
  }, []);

  useEffect(hydrate, [hydrate]);

  const commit = useCallback((next: ProgressData) => {
    dataRef.current = next;
    setData(next);
    saveProgress(storage, next).catch((caught: unknown) => reportError(caught, { operation: 'save_progress' }));
  }, []);

  const completeTutorial = useCallback(() => {
    commit({ ...dataRef.current, hasCompletedTutorial: true });
    track('tutorial_completed');
  }, [commit]);

  const updateSettings = useCallback(
    (settings: Partial<Settings>) => {
      commit({ ...dataRef.current, settings: { ...dataRef.current.settings, ...settings } });
      if (settings.preferredDifficulty) track('difficulty_selected', { difficulty: settings.preferredDifficulty });
    },
    [commit]
  );

  const completeSession = useCallback(
    (incoming: SessionSummary) => {
      const result = applySession(dataRef.current, incoming);
      commit(result.progress);
      track('round_completed', {
        mode: result.summary.mode,
        difficulty: result.summary.difficulty,
        score: result.summary.score,
        accuracy: result.summary.accuracy,
        mistakes: result.summary.mistakes
      });
      if (result.summary.mode === 'daily') track('daily_completed', { score: result.summary.score });
      if (result.summary.mode === 'timeAttack') track('time_attack_completed', { score: result.summary.score });
      if (result.summary.mode === 'noMistakes') track('no_mistakes_ended', { streak: result.summary.bestStreak });
      result.summary.newAchievementIds.forEach((achievementId) => track('achievement_unlocked', { achievementId }));
      return result.summary;
    },
    [commit]
  );

  const resetProgress = useCallback(async () => {
    await clearProgress(storage);
    const fresh = createDefaultProgress();
    dataRef.current = fresh;
    setData(fresh);
    setError(null);
    setStatus('ready');
  }, []);

  const useFreshProgress = useCallback(() => {
    const fresh = createDefaultProgress();
    commit(fresh);
    setError(null);
    setStatus('ready');
  }, [commit]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      data,
      status,
      error,
      completeTutorial,
      updateSettings,
      completeSession,
      resetProgress,
      retryLoad: hydrate,
      useFreshProgress
    }),
    [completeSession, completeTutorial, data, error, hydrate, resetProgress, status, updateSettings, useFreshProgress]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used inside ProgressProvider.');
  return context;
}
