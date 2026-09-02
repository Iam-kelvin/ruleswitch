import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { DIFFICULTIES, type Difficulty, type GameMode } from '@/engine/types';
import { DIFFICULTY_CONFIG, MODE_CONFIG } from '@/engine/config';
import { usePalette } from '@/hooks/usePalette';
import { useProgress } from '@/state/ProgressProvider';

const SETUP_MODES: GameMode[] = ['endless', 'timeAttack', 'noMistakes'];

export default function ModeSetupScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = SETUP_MODES.includes(params.mode as GameMode) ? (params.mode as GameMode) : 'endless';
  const router = useRouter();
  const palette = usePalette();
  const { data, updateSettings } = useProgress();
  const [difficulty, setDifficulty] = useState<Difficulty>(data.settings.preferredDifficulty);
  const config = DIFFICULTY_CONFIG[difficulty];

  const start = () => {
    updateSettings({ preferredDifficulty: difficulty });
    router.replace({ pathname: '/play', params: { mode, difficulty, seed: `${mode}:${Date.now()}` } });
  };

  return (
    <AppScreen header={<AppHeader title={MODE_CONFIG[mode].label} subtitle="Choose your pace" />} contentStyle={styles.content}>
      <Panel style={styles.hero}>
        <Text style={[styles.modeIcon, { color: palette.primary }]}>{mode === 'endless' ? '∞' : mode === 'timeAttack' ? '⏱' : '◇'}</Text>
        <Text style={[styles.title, { color: palette.text }]}>{MODE_CONFIG[mode].label}</Text>
        <Text style={[styles.description, { color: palette.textMuted }]}>{MODE_CONFIG[mode].description}</Text>
      </Panel>

      <Text style={[styles.section, { color: palette.text }]}>Difficulty</Text>
      <SegmentedControl<Difficulty>
        accessibilityLabel="Difficulty"
        options={DIFFICULTIES.map((value) => ({ value, label: DIFFICULTY_CONFIG[value].label }))}
        value={difficulty}
        onChange={setDifficulty}
      />

      <Panel style={styles.details}>
        <Detail label="Objects" value={String(config.objectCount)} />
        <Detail label="Rule switch" value={`Every ${config.switchEvery} actions`} />
        <Detail label="Response window" value={`${(config.promptTimeMs / 1000).toFixed(1)} sec`} />
        <Detail label="Score multiplier" value={`${config.scoreMultiplier.toFixed(2)}×`} last />
      </Panel>

      <View style={styles.noteRow}>
        <Text style={[styles.noteIcon, { color: palette.warning, borderColor: palette.warning }]}>i</Text>
        <Text style={[styles.note, { color: palette.textMuted }]}>Difficulty adds rule complexity and pace—not unnecessary visual clutter.</Text>
      </View>
      <PrimaryButton label={`Start ${MODE_CONFIG[mode].label}`} icon="→" onPress={start} style={styles.start} />
    </AppScreen>
  );
}

function Detail({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  const palette = usePalette();
  return (
    <View style={[styles.detailRow, !last && { borderBottomColor: palette.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <Text style={[styles.detailLabel, { color: palette.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { maxWidth: 620 },
  hero: { alignItems: 'center', paddingVertical: 27, marginBottom: 24 },
  modeIcon: { fontSize: 46, fontWeight: '900' },
  title: { fontSize: 28, fontWeight: '900', marginTop: 6 },
  description: { fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 430, marginTop: 7 },
  section: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  details: { paddingVertical: 4, marginTop: 20 },
  detailRow: { minHeight: 53, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '800' },
  noteRow: { flexDirection: 'row', gap: 10, marginTop: 17, alignItems: 'flex-start', paddingHorizontal: 5 },
  noteIcon: { width: 23, height: 23, borderWidth: 1, borderRadius: 99, textAlign: 'center', fontWeight: '900' },
  note: { flex: 1, fontSize: 12, lineHeight: 18 },
  start: { marginTop: 24 }
});
