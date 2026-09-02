import { useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Head from 'expo-router/head';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { ProgressBar } from '@/components/ProgressBar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { MODE_CONFIG } from '@/engine/config';
import { levelFromXp, xpForLevel, xpForNextLevel } from '@/engine/scoring';
import { dailySeed, localDateKey } from '@/engine/sequence';
import type { GameMode } from '@/engine/types';
import { usePalette, useReducedMotion } from '@/hooks/usePalette';
import { useProgress } from '@/state/ProgressProvider';

const MODE_ICONS: Record<GameMode, string> = { journey: '↗', daily: '◉', endless: '∞', timeAttack: '⏱', noMistakes: '◇' };

export default function HomeScreen() {
  const router = useRouter();
  const palette = usePalette();
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const { data } = useProgress();
  const level = levelFromXp(data.xp);
  const levelStart = xpForLevel(level);
  const levelEnd = xpForNextLevel(level);
  const todayKey = localDateKey();
  const todayResult = data.daily.results[todayKey];

  useEffect(() => {
    if (!data.hasCompletedTutorial) router.replace('/tutorial');
  }, [data.hasCompletedTutorial, router]);

  const xpRatio = useMemo(() => (data.xp - levelStart) / Math.max(1, levelEnd - levelStart), [data.xp, levelEnd, levelStart]);
  const startMode = (mode: Exclude<GameMode, 'journey' | 'daily'>) => router.push({ pathname: '/mode', params: { mode } });

  return (
    <AppScreen>
      <Head><title>RuleSwitch</title><meta name="description" content="Switch rules. Stay sharp. Build your streak." /></Head>
      <View style={styles.brandRow}>
        <View style={[styles.brandMark, { backgroundColor: palette.primary }]}><Text style={[styles.brandMarkText, { color: palette.onPrimary }]}>↔</Text></View>
        <View style={styles.brandCopy}>
          <Text style={[styles.brand, { color: palette.text }]}>RuleSwitch</Text>
          <Text style={[styles.tagline, { color: palette.textMuted }]}>SWITCH FAST · STAY SHARP</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} style={[styles.levelBadge, { backgroundColor: palette.panel, borderColor: palette.border }]} accessibilityLabel={`Level ${level}. Open settings.`}>
          <Text style={[styles.levelSmall, { color: palette.textMuted }]}>LEVEL</Text><Text style={[styles.levelNumber, { color: palette.text }]}>{level}</Text>
        </Pressable>
      </View>

      <Panel style={styles.xpPanel}>
        <View style={styles.xpRow}><Text style={[styles.xpLabel, { color: palette.text }]}>Level progress</Text><Text style={[styles.xpValue, { color: palette.textMuted }]}>{data.xp - levelStart} / {levelEnd - levelStart} XP</Text></View>
        <ProgressBar accessibilityLabel="Level progress" value={xpRatio} />
      </Panel>

      <Pressable
        onPress={() => router.push({ pathname: '/play', params: { mode: 'daily', difficulty: 'normal', seed: dailySeed(new Date()) } })}
        style={({ pressed }) => [styles.daily, { backgroundColor: palette.secondary }, pressed && (reducedMotion ? styles.pressedReduced : styles.pressed)]}
        accessibilityRole="button"
        accessibilityLabel={`Daily Switch. ${todayResult ? `Official score ${todayResult.score}. Replay today.` : 'Play today’s challenge.'}`}
      >
        <View style={styles.dailyTop}>
          <Text style={[styles.dailyKicker, { color: palette.onSecondary }]}>{todayResult ? 'REPLAY AVAILABLE' : 'TODAY’S CHALLENGE'}</Text>
          <Text style={[styles.dailyStreak, { color: palette.onSecondary }]}>🔥 {data.daily.currentStreak} day streak</Text>
        </View>
        <Text style={[styles.dailyTitle, { color: palette.onSecondary }]}>Daily Switch</Text>
        <Text style={[styles.dailyDescription, { color: palette.onSecondary }]}>{todayResult ? `Official score ${todayResult.score.toLocaleString()} · Replays won’t replace it.` : MODE_CONFIG.daily.description}</Text>
        <View style={styles.dailyAction}><Text style={[styles.dailyActionText, { color: palette.onSecondary }]}>{todayResult ? 'Replay today' : 'Play today'}</Text><Text style={[styles.dailyArrow, { color: palette.onSecondary }]}>→</Text></View>
      </Pressable>

      <Text style={[styles.sectionTitle, { color: palette.text }]}>Choose your run</Text>
      <View style={[styles.modeGrid, width >= 720 && styles.modeGridWide]}>
        <ModeCard icon={MODE_ICONS.journey} title="Journey" copy="35 levels · Learn every switch" accent={palette.primary} onPress={() => router.push('/journey')} wide={width >= 720} />
        <ModeCard icon={MODE_ICONS.endless} title="Endless" copy="Play at your chosen difficulty" accent="#58B9FF" onPress={() => startMode('endless')} wide={width >= 720} />
        <ModeCard icon={MODE_ICONS.timeAttack} title="Time Attack" copy="60 seconds · Mistakes cost time" accent="#FFC15C" onPress={() => startMode('timeAttack')} wide={width >= 720} />
        <ModeCard icon={MODE_ICONS.noMistakes} title="No Mistakes" copy={`Personal best · ${data.totals.bestNoMistakesRun}`} accent="#FF7897" onPress={() => startMode('noMistakes')} wide={width >= 720} />
      </View>

      <View style={styles.quickRow}>
        <PrimaryButton label="Stats" icon="▥" variant="secondary" onPress={() => router.push('/stats')} style={styles.quickButton} />
        <PrimaryButton label="Achievements" icon="★" variant="secondary" onPress={() => router.push('/achievements')} style={styles.quickButton} />
        <PrimaryButton label="Settings" icon="⚙" variant="secondary" onPress={() => router.push('/settings')} style={styles.quickButton} />
      </View>
    </AppScreen>
  );
}

function ModeCard({ icon, title, copy, accent, onPress, wide }: { icon: string; title: string; copy: string; accent: string; onPress(): void; wide: boolean }) {
  const palette = usePalette();
  const reducedMotion = useReducedMotion();
  const iconForeground = accent === palette.primary ? palette.onPrimary : '#101526';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${copy}`}
      onPress={onPress}
      style={({ pressed }) => [styles.modeCard, wide && styles.modeCardWide, { backgroundColor: palette.panel, borderColor: palette.border }, pressed && (reducedMotion ? styles.pressedReduced : styles.pressed)]}
    >
      <View style={[styles.modeIcon, { backgroundColor: accent }]}><Text style={[styles.modeIconText, { color: iconForeground }]}>{icon}</Text></View>
      <View style={styles.modeCopy}><Text style={[styles.modeTitle, { color: palette.text }]}>{title}</Text><Text style={[styles.modeDescription, { color: palette.textMuted }]}>{copy}</Text></View>
      <Text style={[styles.chevron, { color: accent }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 16 },
  brandMark: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { fontSize: 29, fontWeight: '900' },
  brandCopy: { flex: 1 },
  brand: { fontSize: 25, fontWeight: '900', letterSpacing: -0.5 },
  tagline: { fontSize: 9, fontWeight: '900', letterSpacing: 1.45, marginTop: 2 },
  levelBadge: { minWidth: 62, height: 52, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  levelSmall: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  levelNumber: { fontSize: 19, lineHeight: 21, fontWeight: '900' },
  xpPanel: { padding: 14, borderRadius: 18, marginBottom: 16 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  xpLabel: { fontSize: 13, fontWeight: '800' },
  xpValue: { fontSize: 12, fontWeight: '700' },
  daily: { borderRadius: 27, padding: 21, minHeight: 202, justifyContent: 'space-between', marginBottom: 27 },
  dailyTop: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  dailyKicker: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1.35 },
  dailyStreak: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  dailyTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: '900', marginTop: 20 },
  dailyDescription: { color: '#EFEAFF', fontSize: 14, lineHeight: 20, maxWidth: 560, marginTop: 5 },
  dailyAction: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  dailyActionText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  dailyArrow: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  sectionTitle: { fontSize: 19, fontWeight: '900', marginBottom: 12 },
  modeGrid: { gap: 11 },
  modeGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  modeCard: { minHeight: 86, borderRadius: 22, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 13 },
  modeCardWide: { width: '48.9%', flexGrow: 1 },
  modeIcon: { width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  modeIconText: { fontSize: 24, fontWeight: '900' },
  modeCopy: { flex: 1 },
  modeTitle: { fontSize: 17, fontWeight: '900' },
  modeDescription: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  chevron: { fontSize: 30, fontWeight: '700' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 22 },
  quickButton: { flexGrow: 1, minWidth: 130 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  pressedReduced: { opacity: 0.78 }
});
