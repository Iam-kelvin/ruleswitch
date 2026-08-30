import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SettingRow } from '@/components/SettingRow';
import { DIFFICULTIES, type Difficulty } from '@/engine/types';
import { DIFFICULTY_CONFIG } from '@/engine/config';
import { usePalette } from '@/hooks/usePalette';
import { useProgress } from '@/state/ProgressProvider';
import type { ThemePreference } from '@/state/schema';

export default function SettingsScreen() {
  const router = useRouter();
  const palette = usePalette();
  const { data, updateSettings, resetProgress } = useProgress();

  const confirmReset = () => {
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Reset all RuleSwitch progress, achievements, and settings on this device?')) void resetProgress().then(() => router.replace('/tutorial'));
      return;
    }
    Alert.alert('Reset all progress?', 'This removes local XP, Journey levels, stats, achievements, settings, and Daily results. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void resetProgress().then(() => router.replace('/tutorial')) }
    ]);
  };

  return (
    <AppScreen header={<AppHeader title="Settings" />} contentStyle={styles.content}>
      <Text style={[styles.section, { color: palette.text }]}>Feedback</Text>
      <Panel style={styles.panel}>
        <SettingRow label="Sound" description="Action, result, switch, streak, and achievement cues." value={data.settings.sound} onValueChange={(sound) => updateSettings({ sound })} />
        <SettingRow label="Background music" description="A quiet, looping offline soundtrack." value={data.settings.music} onValueChange={(music) => updateSettings({ music })} />
        <SettingRow label="Haptics" description="Touch feedback for actions and outcomes." value={data.settings.haptics} onValueChange={(haptics) => updateSettings({ haptics })} />
        <SettingRow label="Reduced motion" description="Removes route and tutorial transition motion." value={data.settings.reducedMotion} onValueChange={(reducedMotion) => updateSettings({ reducedMotion })} />
      </Panel>

      <Text style={[styles.section, { color: palette.text }]}>Theme</Text>
      <SegmentedControl<ThemePreference>
        options={[{ value: 'midnight', label: 'Midnight' }, { value: 'daylight', label: 'Daylight' }, { value: 'highContrast', label: 'High contrast' }]}
        value={data.settings.theme}
        onChange={(theme) => updateSettings({ theme })}
      />

      <Text style={[styles.section, { color: palette.text }]}>Preferred difficulty</Text>
      <SegmentedControl<Difficulty>
        options={DIFFICULTIES.map((value) => ({ value, label: DIFFICULTY_CONFIG[value].label }))}
        value={data.settings.preferredDifficulty}
        onChange={(preferredDifficulty) => updateSettings({ preferredDifficulty })}
      />

      <Text style={[styles.section, { color: palette.text }]}>Help & privacy</Text>
      <Panel style={styles.links}>
        <LinkRow label="Replay tutorial" copy="Practice reading, ignoring, swiping, and switching." onPress={() => router.push('/tutorial')} />
        <LinkRow label="Privacy information" copy="See what stays local and what optional analytics sends." onPress={() => router.push('/privacy')} last />
      </Panel>

      <Text style={[styles.section, { color: palette.danger }]}>Local data</Text>
      <PrimaryButton label="Reset all progress" variant="danger" onPress={confirmReset} />
      <Text style={[styles.version, { color: palette.textMuted }]}>RuleSwitch {Constants.expoConfig?.version ?? '1.0.0'} · Game data v1</Text>
    </AppScreen>
  );
}

function LinkRow({ label, copy, onPress, last = false }: { label: string; copy: string; onPress(): void; last?: boolean }) {
  const palette = usePalette();
  return (
    <Pressable onPress={onPress} style={[styles.linkRow, !last && { borderBottomColor: palette.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
      <View style={styles.linkCopy}><Text style={[styles.linkLabel, { color: palette.text }]}>{label}</Text><Text style={[styles.linkDescription, { color: palette.textMuted }]}>{copy}</Text></View>
      <Text style={[styles.linkArrow, { color: palette.primary }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { maxWidth: 680 },
  section: { fontSize: 16, fontWeight: '900', marginTop: 20, marginBottom: 9 },
  panel: { paddingVertical: 0 },
  links: { paddingVertical: 0 },
  linkRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  linkCopy: { flex: 1 },
  linkLabel: { fontSize: 15, fontWeight: '800' },
  linkDescription: { fontSize: 12, lineHeight: 17, marginTop: 3 },
  linkArrow: { fontSize: 27, fontWeight: '800' },
  version: { textAlign: 'center', fontSize: 11, marginTop: 24 }
});
