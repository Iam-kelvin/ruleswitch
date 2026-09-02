import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { ProgressBar } from '@/components/ProgressBar';
import { RULE_CATEGORIES } from '@/engine/types';
import { levelFromXp } from '@/engine/scoring';
import { usePalette } from '@/hooks/usePalette';
import { useProgress } from '@/state/ProgressProvider';

const CATEGORY_LABELS = { tap: 'Tap', ignore: 'Ignore', number: 'Numbers', swipe: 'Swipe', comparison: 'Comparison', conditional: 'Conditional', reversal: 'Reversal' };

export default function StatsScreen() {
  const palette = usePalette();
  const { width } = useWindowDimensions();
  const { data } = useProgress();
  const lifetimeAccuracy = data.totals.totalActions > 0 ? data.totals.correctActions / data.totals.totalActions : 0;
  const avgResponse = data.totals.totalActions > 0 ? Math.round(data.totals.totalResponseTimeMs / data.totals.totalActions) : 0;
  return (
    <AppScreen header={<AppHeader title="Stats" subtitle="Stored locally on this device" />}>
      <View style={[styles.summaryGrid, width >= 650 && styles.summaryWide]}>
        <Summary label="Level" value={String(levelFromXp(data.xp))} />
        <Summary label="Accuracy" value={`${Math.round(lifetimeAccuracy * 100)}%`} />
        <Summary label="Correct" value={data.totals.correctActions.toLocaleString()} />
        <Summary label="Best response" value={data.totals.bestResponseTimeMs === null ? '—' : `${data.totals.bestResponseTimeMs} ms`} />
        <Summary label="Longest streak" value={`×${data.totals.longestActionStreak}`} />
        <Summary label="Avg. response" value={avgResponse ? `${avgResponse} ms` : '—'} />
      </View>

      <Text style={[styles.section, { color: palette.text }]}>Performance by rule type</Text>
      {data.totals.totalActions === 0 ? (
        <Panel><Text style={[styles.emptyTitle, { color: palette.text }]}>Your patterns will appear here.</Text><Text style={[styles.emptyCopy, { color: palette.textMuted }]}>Finish a run to begin measuring accuracy and response time by rule family.</Text></Panel>
      ) : (
        <Panel style={styles.rulePanel}>
          {RULE_CATEGORIES.map((category, index) => {
            const stat = data.ruleStats[category];
            const accuracy = stat.attempts ? stat.correct / stat.attempts : 0;
            return (
              <View key={category} style={[styles.ruleRow, index < RULE_CATEGORIES.length - 1 && { borderBottomColor: palette.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
                <View style={styles.ruleTop}><Text style={[styles.ruleName, { color: palette.text }]}>{CATEGORY_LABELS[category]}{data.masteredRuleCategories.includes(category) ? <Text style={{ color: palette.primary }}> · MASTERED</Text> : null}</Text><Text style={[styles.ruleValue, { color: palette.textMuted }]}>{stat.attempts ? `${Math.round(accuracy * 100)}% · ${stat.correct}/${stat.attempts}` : 'Not played'}</Text></View>
                <ProgressBar accessibilityLabel={`${CATEGORY_LABELS[category]} accuracy`} value={accuracy} color={stat.attempts ? palette.primary : palette.border} />
              </View>
            );
          })}
        </Panel>
      )}

      <Text style={[styles.section, { color: palette.text }]}>Personal bests</Text>
      <Panel style={styles.bestPanel}>
        <Best label="Time Attack" value={data.totals.bestTimeAttackScore.toLocaleString()} />
        <Best label="No Mistakes" value={`${data.totals.bestNoMistakesRun} streak`} />
        <Best label="Daily streak" value={`${data.daily.longestStreak} days`} last />
      </Panel>
    </AppScreen>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  const palette = usePalette();
  return <Panel style={styles.summary}><Text style={[styles.summaryValue, { color: palette.text }]}>{value}</Text><Text style={[styles.summaryLabel, { color: palette.textMuted }]}>{label}</Text></Panel>;
}

function Best({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const palette = usePalette();
  return <View style={[styles.bestRow, !last && { borderBottomColor: palette.border, borderBottomWidth: StyleSheet.hairlineWidth }]}><Text style={[styles.bestLabel, { color: palette.textMuted }]}>{label}</Text><Text style={[styles.bestValue, { color: palette.text }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  summaryWide: {},
  summary: { minWidth: 142, width: '31%', flexGrow: 1, alignItems: 'center', paddingVertical: 15 },
  summaryValue: { fontSize: 21, fontWeight: '900' },
  summaryLabel: { fontSize: 11, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '900', marginTop: 24, marginBottom: 10 },
  emptyTitle: { fontSize: 17, fontWeight: '900' },
  emptyCopy: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  rulePanel: { paddingVertical: 2 },
  ruleRow: { paddingVertical: 14 },
  ruleTop: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6, marginBottom: 9 },
  ruleName: { flexShrink: 1, fontSize: 14, fontWeight: '800' },
  ruleValue: { fontSize: 12, textAlign: 'right' },
  bestPanel: { paddingVertical: 3 },
  bestRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bestLabel: { fontSize: 14 },
  bestValue: { fontSize: 15, fontWeight: '900' }
});
