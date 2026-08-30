import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo } from 'react';
import type { ActionType } from '@/engine/types';
import { useProgress } from '@/state/ProgressProvider';
import { reportError } from './errors';

type FeedbackResult = 'correct' | 'incorrect' | 'rule' | 'streak' | 'achievement';

interface FeedbackContextValue {
  input(action: ActionType): void;
  result(type: FeedbackResult): void;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function replay(player: AudioPlayer): void {
  void player
    .seekTo(0)
    .then(() => player.play())
    .catch((error: unknown) => reportError(error, { service: 'audio' }));
}

export function FeedbackProvider({ children }: PropsWithChildren) {
  const { data } = useProgress();
  const tap = useAudioPlayer(require('../../assets/tap.wav'));
  const swipe = useAudioPlayer(require('../../assets/swipe.wav'));
  const correct = useAudioPlayer(require('../../assets/correct.wav'));
  const incorrect = useAudioPlayer(require('../../assets/incorrect.wav'));
  const rule = useAudioPlayer(require('../../assets/rule.wav'));
  const streak = useAudioPlayer(require('../../assets/streak.wav'));
  const achievement = useAudioPlayer(require('../../assets/achievement.wav'));
  const music = useAudioPlayer(require('../../assets/music.wav'));

  useEffect(() => {
    void setAudioModeAsync({ interruptionMode: 'mixWithOthers', playsInSilentMode: false }).catch((error: unknown) =>
      reportError(error, { service: 'audio', operation: 'configure' })
    );
  }, []);

  useEffect(() => {
    music.loop = true;
    music.volume = 0.32;
    if (data.settings.music) music.play();
    else music.pause();
  }, [data.settings.music, music]);

  const input = useCallback(
    (action: ActionType) => {
      if (data.settings.sound) replay(action === 'tap' ? tap : swipe);
      if (data.settings.haptics) void Haptics.selectionAsync();
    },
    [data.settings.haptics, data.settings.sound, swipe, tap]
  );

  const result = useCallback(
    (type: FeedbackResult) => {
      if (data.settings.sound) {
        const player = { correct, incorrect, rule, streak, achievement }[type];
        replay(player);
      }
      if (!data.settings.haptics) return;
      if (type === 'correct') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else if (type === 'incorrect') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      else if (type === 'rule') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      else void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [achievement, correct, data.settings.haptics, data.settings.sound, incorrect, rule, streak]
  );

  const value = useMemo(() => ({ input, result }), [input, result]);
  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used inside FeedbackProvider.');
  return context;
}
