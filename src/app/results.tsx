import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ACHIEVEMENTS } from '@/engine/achievements';
import { DIFFICULTY_CONFIG, JOURNEY_LEVEL_COUNT, MODE_CONFIG, getJourneyChapter } from '@/engine/config';
import { AppHeader } from '@/components/AppHeader';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { usePalette } from '@/hooks/usePalette';
import { useProgress } from '@/state/ProgressProvider';

export default function ResultsScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width } = useWindowDimensions();
  const { data } = useProgress();
  const result = data.lastResult;

  if (!result) {
    return (
      <AppScreen header={<AppHeader title="Results" />} contentStyle={styles.emptyContent}>
        <Panel style={styles.emptyPanel}>
          <Text style={[styles.emptyTitle, { color: palette.text }]}>No finished run yet</Text>
          <Text style={[styles.emptyCopy, { color: palette.textMuted }]}>Complete a game and its results will appear here.</Text>
          <PrimaryButton label="Choose a mode" onPress={() => router.replace('/')} />
        </Panel>
      </AppScreen>
    );
  }

  const replay = () => router.replace({
    pathname: '/play',
    params: {
      mode: result.mode,
      difficulty: result.difficulty,
      seed: result.seed,
      ...(result.journeyLevel ? { journeyLevel: String(result.journeyLevel) } : {})
    }
  });
  const nextJourney = result.mode === 'journey' && result.journeyLevel && result.journeyLevel < JOURNEY_LEVEL_COUNT ? result.journeyLevel + 1 : null;

  return (
    <AppScreen header={<AppHeader title="Run complete" back={false} />}>
      <View style={styles.hero}>
        <Text style={[styles.kicker, { color: palette.primary }]}>{MODE_CONFIG[result.mode].label.toUpperCase()} · {DIFFICULTY_CONFIG[result.difficulty].label.toUpperCase()}</Text>
        <Text style={[styles.score, { color: palette.text }]}>{result.score.toLocaleString()}</Text>
        <Text style={[styles.scoreLabel, { color: palette.textMuted }]}>POINTS</Text>
        {result.mode === 'daily' ? (
          <View style={[styles.official, { backgroundColor: result.officialDaily ? palette.primary : palette.panelStrong }]}>
            <Text style={[styles.officialText, { color: result.officialDaily ? palette.onPrimary : palette.text }]}>{result.officialDaily ? 'OFFICIAL RESULT SAVED' : 'REPLAY · OFFICIAL RESULT UNCHANGED'}</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.statGrid, width >= 650 && styles.statGridWide]}>
        <ResultStat label="Accuracy" value={`${Math.round(result.accuracy * 100)}%`} />
        <ResultStat label="Mistakes" value={String(result.mistakes)} />
        <ResultStat label="Avg. response" value={`${result.averageResponseTimeMs} ms`} />
        <ResultStat label="Best streak" value={`×${result.bestStreak}`} />
      </View>

      <Panel style={styles.xpPanel}>
        <View><Text style={[styles.xpKicker, { color: palette.primary }]}>XP EARNED</Text><Text style={[styles.xp, { color: palette.text }]}>+{result.xpEarned} XP</Text></View>
        <Text style={[styles.sessionCopy, { color: palette.textMuted }]}>{result.correctActions} correct from {result.attempts} actions · {result.ruleSwitches} successful switches</Text>
      </Panel>

      {result.newAchievementIds.length > 0 ? (
        <Panel style={[styles.unlockPanel, { borderColor: palette.warning }]}>
          <Text style={[styles.unlockKicker, { color: palette.warning }]}>ACHIEVEMENT UNLOCKED</Text>
          {result.newAchievementIds.map((id) => {
            const achievement = ACHIEVEMENTS.find((item) => item.id === id);
            return achievement ? <Text key={id} style={[styles.unlockTitle, { color: palette.text }]}>{achievement.icon}  {achievement.title}</Text> : null;
          })}
        </Panel>
      ) : null}

      <View style={styles.actions}>
        {nextJourney ? (
          <PrimaryButton
            label={`Next · ${getJourneyChapter(nextJourney).title} ${nextJourney}`}
            icon="→"
            onPress={() => {
              const chapter = getJourneyChapter(nextJourney);
              router.replace({ pathname: '/play', params: { mode: 'journey', difficulty: chapter.difficulty, seed: `journey:${nextJourney}`, journeyLevel: String(nextJourney) } });
            }}
          />
        ) : null}
        <PrimaryButton label="Play again" variant={nextJourney ? 'secondary' : 'primary'} onPress={replay} />
        <PrimaryButton label="Home" variant="ghost" onPress={() => router.replace('/')} />
      </View>
    </AppScreen>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  const palette = usePalette();
  return (
    <Panel style={styles.stat}>
      <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: palette.textMuted }]}>{label}</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  emptyContent: { justifyContent: 'center' },
  emptyPanel: { alignSelf: 'center', width: '100%', maxWidth: 450, gap: 12 },
  emptyTitle: { fontSize: 23, fontWeight: '900' },
  emptyCopy: { fontSize: 14, lineHeight: 21, marginBottom: 8 },
  hero: { alignItems: 'center', paddingVertical: 16 },
  kicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  score: { fontSize: 60, lineHeight: 67, fontWeight: '900', letterSpacing: -2, marginTop: 8 },
  scoreLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  official: { borderRadius: 99, paddingVertical: 8, paddingHorizontal: 14, marginTop: 14 },
  officialText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  statGridWide: {},
  stat: { width: '48%', flexGrow: 1, minWidth: 140, alignItems: 'center', paddingVertical: 17 },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 4 },
  xpPanel: { marginTop: 13, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  xpKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2 },
  xp: { fontSize: 22, fontWeight: '900', marginTop: 3 },
  sessionCopy: { flex: 1, minWidth: 180, fontSize: 12, lineHeight: 18, textAlign: 'right' },
  unlockPanel: { marginTop: 13, gap: 8 },
  unlockKicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.3 },
  unlockTitle: { fontSize: 18, fontWeight: '900' },
  actions: { gap: 9, marginTop: 18 }
});
