import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ACHIEVEMENTS } from '@/engine/achievements';
import { AppHeader } from '@/components/AppHeader';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { ProgressBar } from '@/components/ProgressBar';
import { usePalette } from '@/hooks/usePalette';
import { useProgress } from '@/state/ProgressProvider';

export default function AchievementsScreen() {
  const palette = usePalette();
  const { width } = useWindowDimensions();
  const { data } = useProgress();
  const unlockedCount = Object.keys(data.achievements).length;
  return (
    <AppScreen header={<AppHeader title="Achievements" subtitle={`${unlockedCount} of ${ACHIEVEMENTS.length} unlocked`} />}>
      <Panel style={styles.overview}>
        <View style={styles.overviewTop}><Text style={[styles.overviewTitle, { color: palette.text }]}>Collection progress</Text><Text style={[styles.overviewValue, { color: palette.primary }]}>{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</Text></View>
        <ProgressBar accessibilityLabel="Achievement collection progress" value={unlockedCount / ACHIEVEMENTS.length} />
      </Panel>
      <View style={[styles.grid, width >= 720 && styles.gridWide]}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlockedAt = data.achievements[achievement.id];
          const progress = Math.min(achievement.target, achievement.progress(data));
          return (
            <Panel key={achievement.id} style={[styles.card, width >= 720 && styles.cardWide]}>
              <View style={[styles.icon, { backgroundColor: unlockedAt ? palette.warning : palette.panelStrong, borderColor: unlockedAt ? palette.warning : palette.border }]}>
                <Text style={[styles.iconText, { color: unlockedAt ? palette.onWarning : palette.textMuted }]}>{unlockedAt ? achievement.icon : '●'}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={[styles.title, { color: palette.text }]}>{achievement.title}</Text>
                <Text style={[styles.description, { color: palette.textMuted }]}>{achievement.description}</Text>
                {unlockedAt ? (
                  <Text style={[styles.unlocked, { color: palette.success }]}>UNLOCKED · {new Date(unlockedAt).toLocaleDateString()}</Text>
                ) : (
                  <View style={styles.progressWrap}><ProgressBar accessibilityLabel={`${achievement.title} progress`} value={progress / achievement.target} color={palette.secondary} /><Text style={[styles.progressText, { color: palette.textMuted }]}>{progress} / {achievement.target}</Text></View>
                )}
              </View>
            </Panel>
          );
        })}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  overview: { marginBottom: 14 },
  overviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  overviewTitle: { fontSize: 15, fontWeight: '900' },
  overviewValue: { fontSize: 15, fontWeight: '900' },
  grid: { gap: 10 },
  gridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { flexDirection: 'row', gap: 14, padding: 15 },
  cardWide: { width: '48.9%', flexGrow: 1 },
  icon: { width: 52, height: 52, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 20, fontWeight: '900' },
  copy: { flex: 1 },
  title: { fontSize: 16, fontWeight: '900' },
  description: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  unlocked: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8, marginTop: 8 },
  progressWrap: { marginTop: 9, gap: 5 },
  progressText: { fontSize: 9, fontWeight: '700', textAlign: 'right' }
});
