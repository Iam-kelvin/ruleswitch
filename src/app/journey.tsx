import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { JOURNEY_CHAPTERS } from '@/engine/config';
import { usePalette } from '@/hooks/usePalette';
import { useProgress } from '@/state/ProgressProvider';

export default function JourneyScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { width } = useWindowDimensions();
  const { data } = useProgress();
  const completed = Object.keys(data.journey.levels).length;
  return (
    <AppScreen header={<AppHeader title="Journey" subtitle={`${completed} of 35 levels cleared`} />}>
      <Panel style={styles.intro}>
        <Text style={[styles.introKicker, { color: palette.primary }]}>YOUR TRAINING PATH</Text>
        <Text style={[styles.introTitle, { color: palette.text }]}>One new mental gear at a time.</Text>
        <Text style={[styles.introCopy, { color: palette.textMuted }]}>Every level uses a fixed seed, so practice stays fair and reproducible.</Text>
      </Panel>
      <View style={[styles.chapters, width >= 760 && styles.chaptersWide]}>
        {JOURNEY_CHAPTERS.map((chapter) => (
          <Panel key={chapter.id} style={[styles.chapter, width >= 760 && styles.chapterWide]}>
            <View style={styles.chapterHeader}>
              <View style={[styles.chapterNumber, { backgroundColor: chapter.accent }]}><Text style={styles.chapterNumberText}>{chapter.id}</Text></View>
              <View style={styles.chapterCopy}>
                <Text style={[styles.chapterTitle, { color: palette.text }]}>{chapter.title}</Text>
                <Text style={[styles.chapterSubtitle, { color: palette.textMuted }]}>{chapter.subtitle}</Text>
              </View>
              <Text style={[styles.difficulty, { color: chapter.accent }]}>{chapter.difficulty.toUpperCase()}</Text>
            </View>
            <View style={styles.levelRow}>
              {Array.from({ length: 5 }, (_, offset) => {
                const level = (chapter.id - 1) * 5 + offset + 1;
                const unlocked = level <= data.journey.unlockedLevel;
                const result = data.journey.levels[String(level)];
                return (
                  <PrimaryButton
                    key={level}
                    label={result ? `✓ ${level}` : unlocked ? String(level) : '🔒'}
                    disabled={!unlocked}
                    variant={result ? 'primary' : 'secondary'}
                    accessibilityHint={unlocked ? `${chapter.title}, level ${level}` : `Level ${level} is locked`}
                    onPress={() => router.push({ pathname: '/play', params: { mode: 'journey', difficulty: chapter.difficulty, seed: `journey:${level}`, journeyLevel: String(level) } })}
                    style={styles.levelButton}
                  />
                );
              })}
            </View>
          </Panel>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: 16 },
  introKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  introTitle: { fontSize: 21, fontWeight: '900', marginTop: 7 },
  introCopy: { fontSize: 13, lineHeight: 19, marginTop: 5 },
  chapters: { gap: 12 },
  chaptersWide: { flexDirection: 'row', flexWrap: 'wrap' },
  chapter: { padding: 15 },
  chapterWide: { width: '48.9%', flexGrow: 1 },
  chapterHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  chapterNumber: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chapterNumberText: { color: '#101526', fontSize: 18, fontWeight: '900' },
  chapterCopy: { flex: 1 },
  chapterTitle: { fontSize: 17, fontWeight: '900' },
  chapterSubtitle: { fontSize: 11, marginTop: 2 },
  difficulty: { fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  levelRow: { flexDirection: 'row', gap: 6, marginTop: 14 },
  levelButton: { flex: 1, minHeight: 48 }
});
