import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { FeedbackOverlay, type FeedbackState } from '@/components/FeedbackOverlay';
import { GameBoard } from '@/components/GameBoard';
import { ProgressBar } from '@/components/ProgressBar';
import { RuleBanner } from '@/components/RuleBanner';
import { getTargetObjects, getRuleById } from '@/engine/rules';
import type { ActionType, Challenge, ColorName, GameObject, ShapeName } from '@/engine/types';
import { usePalette } from '@/hooks/usePalette';
import { track } from '@/services/analytics';
import { useFeedback } from '@/services/FeedbackProvider';
import { useProgress } from '@/state/ProgressProvider';

const baseObject = (id: string, color: ColorName, shape: ShapeName, number: number, x: number, y: number): GameObject => ({
  id,
  kind: number > 0 ? 'number' : 'shape',
  color,
  shape,
  size: 1,
  number: Math.max(1, number),
  symbol: '★',
  fill: 'solid',
  orientation: 0,
  containerShape: 'none',
  position: { x, y }
});

const TUTORIAL_DATA = [
  {
    ruleId: 'tap-blue',
    title: 'Read the rule first',
    copy: 'The rule stays visible. Color cues include initials, so color is never the only signal.',
    objects: [baseObject('blue', 'blue', 'circle', 0, 0.08, 0.12), baseObject('red', 'red', 'square', 0, 0.74, 0.13), baseObject('amber', 'amber', 'triangle', 0, 0.42, 0.66)]
  },
  {
    ruleId: 'avoid-red',
    title: 'Resist the distractor',
    copy: 'Do not tap the thing named by an ignore rule. Choose a valid alternative.',
    objects: [baseObject('red2', 'red', 'circle', 0, 0.08, 0.11), baseObject('teal', 'teal', 'square', 0, 0.75, 0.12), baseObject('violet', 'violet', 'triangle', 0, 0.42, 0.66)]
  },
  {
    ruleId: 'swipe-circles-left',
    title: 'Actions can change too',
    copy: 'Start your gesture on the correct object, then move in the displayed direction.',
    objects: [baseObject('circle3', 'amber', 'circle', 0, 0.08, 0.12), baseObject('square3', 'blue', 'square', 0, 0.75, 0.12), baseObject('triangle3', 'red', 'triangle', 0, 0.42, 0.66)]
  },
  {
    ruleId: 'tap-odd',
    title: 'Reset when the rule switches',
    copy: 'The gold “NEW RULE” cue means let go of the old reflex. Read, then react.',
    objects: [baseObject('two', 'blue', 'square', 2, 0.08, 0.12), baseObject('seven', 'red', 'circle', 7, 0.75, 0.12), baseObject('four', 'teal', 'triangle', 4, 0.42, 0.66)]
  }
] as const;

export default function TutorialScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { height } = useWindowDimensions();
  const { data, completeTutorial } = useProgress();
  const feedbackService = useFeedback();
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('switch');
  const [inputLocked, setInputLocked] = useState(false);
  const inputLockedRef = useRef(false);
  const [message, setMessage] = useState('Try it now.');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tutorial = TUTORIAL_DATA[step]!;

  useEffect(() => {
    track('tutorial_started');
    feedbackService.result('rule');
    timerRef.current = setTimeout(() => setFeedback(null), data.settings.reducedMotion ? 180 : 650);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [data.settings.reducedMotion, feedbackService]);

  const challenge = useMemo<Challenge>(() => {
    const rule = getRuleById(tutorial.ruleId)!;
    const objects = [...tutorial.objects];
    return {
      id: `tutorial:${step}`,
      index: step,
      rule,
      objects,
      expectedTargets: getTargetObjects(rule, objects).map((object) => ({ objectId: object.id, action: rule.expectedAction })),
      isRuleSwitch: true,
      timeLimitMs: 60_000
    };
  }, [step, tutorial]);

  const act = (objectId: string, action: ActionType) => {
    if (inputLockedRef.current) return;
    const correct = challenge.expectedTargets.some((target) => target.objectId === objectId && target.action === action);
    inputLockedRef.current = true;
    setInputLocked(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    feedbackService.input(action);
    feedbackService.result(correct ? 'correct' : 'incorrect');
    setFeedback(correct ? 'correct' : 'incorrect');
    setMessage(correct ? 'Exactly right.' : 'Pause, reread the rule, and try again.');
    if (!correct) {
      timerRef.current = setTimeout(() => {
        setFeedback(null);
        inputLockedRef.current = false;
        setInputLocked(false);
      }, data.settings.reducedMotion ? 180 : 420);
      return;
    }
    timerRef.current = setTimeout(() => {
      if (step === TUTORIAL_DATA.length - 1) {
        completeTutorial();
        router.replace('/');
      } else {
        setStep((value) => value + 1);
        setFeedback('switch');
        setMessage('New rule—clear the old one.');
        feedbackService.result('rule');
        timerRef.current = setTimeout(() => {
          setFeedback(null);
          inputLockedRef.current = false;
          setInputLocked(false);
        }, data.settings.reducedMotion ? 180 : 650);
      }
    }, data.settings.reducedMotion ? 220 : 650);
  };

  const skip = () => {
    completeTutorial();
    router.replace('/');
  };

  return (
    <AppScreen scroll={height < 680} contentStyle={styles.content}>
      <View style={styles.topRow}>
        <View style={styles.progressCopy}><Text style={[styles.kicker, { color: palette.primary }]}>QUICK TUTORIAL</Text><Text style={[styles.step, { color: palette.text }]}>Step {step + 1} of {TUTORIAL_DATA.length}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Skip tutorial" onPress={skip} hitSlop={10} style={styles.skipButton}>
          <Text style={[styles.skip, { color: palette.textMuted }]}>Skip tutorial</Text>
        </Pressable>
      </View>
      <ProgressBar accessibilityLabel="Tutorial progress" value={(step + 1) / TUTORIAL_DATA.length} />
      <View style={styles.lesson}>
        <Text style={[styles.title, { color: palette.text }]}>{tutorial.title}</Text>
        <Text style={[styles.copy, { color: palette.textMuted }]}>{tutorial.copy}</Text>
      </View>
      <RuleBanner challenge={challenge} timeRatio={1} />
      <GameBoard objects={challenge.objects} onAction={act} disabled={inputLocked} />
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.message, { color: feedback === 'correct' ? palette.success : feedback === 'incorrect' ? palette.danger : palette.textMuted }]}
      >
        {message}
      </Text>
      <FeedbackOverlay state={feedback} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { maxWidth: 720, paddingTop: 20, paddingBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  progressCopy: { flex: 1 },
  kicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  step: { fontSize: 17, fontWeight: '900', marginTop: 3 },
  skipButton: { minHeight: 48, minWidth: 104, alignItems: 'flex-end', justifyContent: 'center' },
  skip: { fontSize: 13, fontWeight: '700' },
  lesson: { marginTop: 17, marginBottom: 15 },
  title: { fontSize: 24, fontWeight: '900' },
  copy: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  message: { marginTop: 'auto', textAlign: 'center', fontSize: 13, fontWeight: '800' }
});
