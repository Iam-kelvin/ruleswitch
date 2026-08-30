import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { FeedbackOverlay } from '@/components/FeedbackOverlay';
import { GameBoard } from '@/components/GameBoard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RuleBanner } from '@/components/RuleBanner';
import { DIFFICULTY_CONFIG, MODE_CONFIG } from '@/engine/config';
import { DIFFICULTIES, GAME_MODES, type Difficulty, type GameMode, type SessionSummary } from '@/engine/types';
import { useGameSession } from '@/game/useGameSession';
import { usePalette } from '@/hooks/usePalette';
import { monetization } from '@/services/monetization';
import { useFeedback } from '@/services/FeedbackProvider';
import { useProgress } from '@/state/ProgressProvider';

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function PlayScreen() {
  const params = useLocalSearchParams();
  const rawMode = firstParam(params.mode);
  const rawDifficulty = firstParam(params.difficulty);
  const mode: GameMode = GAME_MODES.includes(rawMode as GameMode) ? (rawMode as GameMode) : 'endless';
  const difficulty: Difficulty = DIFFICULTIES.includes(rawDifficulty as Difficulty) ? (rawDifficulty as Difficulty) : 'normal';
  const seed = firstParam(params.seed) ?? `${mode}:fallback`;
  const parsedLevel = Number(firstParam(params.journeyLevel));
  const journeyLevel = mode === 'journey' && Number.isInteger(parsedLevel) && parsedLevel >= 1 && parsedLevel <= 35 ? parsedLevel : undefined;
  const router = useRouter();
  const palette = usePalette();
  const { data, completeSession } = useProgress();
  const feedback = useFeedback();

  const onComplete = useCallback(
    (incoming: SessionSummary) => {
      const completed = completeSession(incoming);
      if (completed.newAchievementIds.length > 0) feedback.result('achievement');
      void monetization.onSessionCompleted();
      router.replace('/results');
    },
    [completeSession, feedback, router]
  );

  const session = useGameSession({ mode, difficulty, seed, ...(journeyLevel ? { journeyLevel } : {}), onComplete });
  const { state, challenge } = session;
  const progressLabel = session.targetCorrect
    ? `${Math.min(state.correctActions, session.targetCorrect)} / ${session.targetCorrect}`
    : mode === 'timeAttack'
      ? formatTime(state.overallRemainingMs ?? 0)
      : mode === 'noMistakes'
        ? `${state.currentStreak} alive`
        : `${state.correctActions} correct`;

  return (
    <AppScreen
      scroll={false}
      header={
        <View style={[styles.gameHeader, { backgroundColor: palette.background, borderBottomColor: palette.border }]}>
          <View style={styles.gameHeaderInner}>
            <Pressable onPress={session.togglePause} accessibilityRole="button" accessibilityLabel="Pause game" style={[styles.pause, { borderColor: palette.border }]}>
              <Text style={[styles.pauseText, { color: palette.text }]}>Ⅱ</Text>
            </Pressable>
            <View style={styles.headerStat}><Text style={[styles.headerLabel, { color: palette.textMuted }]}>SCORE</Text><Text style={[styles.headerValue, { color: palette.text }]}>{state.score.toLocaleString()}</Text></View>
            <View style={styles.headerStat}><Text style={[styles.headerLabel, { color: palette.textMuted }]}>STREAK</Text><Text style={[styles.headerValue, { color: palette.primary }]}>×{state.currentStreak}</Text></View>
            <View style={styles.headerStat}><Text style={[styles.headerLabel, { color: palette.textMuted }]}>{mode === 'timeAttack' ? 'TIME' : 'PROGRESS'}</Text><Text style={[styles.headerValue, { color: mode === 'timeAttack' && (state.overallRemainingMs ?? 0) < 10_000 ? palette.danger : palette.text }]}>{progressLabel}</Text></View>
          </View>
        </View>
      }
      contentStyle={styles.gameContent}
      testID="game-screen"
    >
      <View style={styles.ruleWrap}>
        <Text style={[styles.modeLabel, { color: palette.textMuted }]}>{MODE_CONFIG[mode].label.toUpperCase()} · {DIFFICULTY_CONFIG[difficulty].label.toUpperCase()}</Text>
        <RuleBanner challenge={challenge} timeRatio={session.promptTimeRatio} />
      </View>
      <GameBoard objects={challenge.objects} onAction={session.act} disabled={state.inputLocked || state.paused} />
      <View style={styles.bottomRow}>
        <Text style={[styles.gestureHint, { color: palette.textMuted }]}>Tap or swipe from an object. Read the rule every time it changes.</Text>
        {mode === 'endless' ? <PrimaryButton label="Finish run" variant="ghost" onPress={session.finish} style={styles.finishButton} /> : null}
      </View>
      <FeedbackOverlay state={state.feedback} />

      <Modal transparent visible={state.paused} animationType={data.settings.reducedMotion ? 'none' : 'fade'} onRequestClose={session.togglePause}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: palette.panel, borderColor: palette.border }]}>
            <Text style={[styles.modalKicker, { color: palette.primary }]}>RUN PAUSED</Text>
            <Text style={[styles.modalTitle, { color: palette.text }]}>Take a breath.</Text>
            <Text style={[styles.modalCopy, { color: palette.textMuted }]}>The prompt and overall timer are frozen.</Text>
            <PrimaryButton label="Resume" onPress={session.togglePause} />
            {mode === 'endless' && state.attempts > 0 ? (
              <PrimaryButton label="End & score run" variant="secondary" onPress={session.finish} />
            ) : null}
            <PrimaryButton label="Quit without saving" variant="ghost" onPress={() => router.replace('/')} />
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

function formatTime(milliseconds: number): string {
  return `${Math.max(0, Math.ceil(milliseconds / 1000))}s`;
}

const styles = StyleSheet.create({
  gameHeader: { borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  gameHeaderInner: { width: '100%', maxWidth: 960, minHeight: 66, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 10 },
  pause: { width: 43, height: 43, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pauseText: { fontSize: 18, fontWeight: '900', letterSpacing: -2 },
  headerStat: { flex: 1, alignItems: 'center' },
  headerLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  headerValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
  gameContent: { maxWidth: 720, paddingTop: 10, paddingBottom: 10 },
  ruleWrap: { width: '100%', zIndex: 2 },
  modeLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginBottom: 7, marginLeft: 3 },
  bottomRow: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  gestureHint: { flex: 1, fontSize: 11, lineHeight: 16 },
  finishButton: { minWidth: 120 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  modalCard: { width: '100%', maxWidth: 430, borderWidth: 1, borderRadius: 27, padding: 22, gap: 10 },
  modalKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  modalTitle: { fontSize: 25, fontWeight: '900', marginTop: 3 },
  modalCopy: { fontSize: 14, lineHeight: 20, marginBottom: 8 }
});
