import { StyleSheet, Text, View } from 'react-native';
import type { Challenge } from '@/engine/types';
import { usePalette } from '@/hooks/usePalette';
import { ProgressBar } from './ProgressBar';

export function RuleBanner({ challenge, timeRatio }: { challenge: Challenge; timeRatio: number }) {
  const palette = usePalette();
  const reversal = challenge.rule.category === 'reversal';
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: reversal ? palette.warning : palette.panel, borderColor: reversal ? palette.warning : palette.border }
      ]}
      accessibilityRole="header"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.topRow}>
        <Text style={[styles.kicker, { color: reversal ? '#241800' : palette.primary }]}>
          {challenge.isRuleSwitch ? 'NEW RULE' : challenge.rule.category.toUpperCase()}
        </Text>
        <Text style={[styles.action, { color: reversal ? '#241800' : palette.textMuted }]}>
          {challenge.rule.expectedAction.startsWith('swipe') ? 'SWIPE' : 'TAP'}
        </Text>
      </View>
      <Text style={[styles.rule, { color: reversal ? '#171000' : palette.text }]} adjustsFontSizeToFit numberOfLines={2}>
        {challenge.rule.displayText}
      </Text>
      <Text style={[styles.hint, { color: reversal ? '#4B3600' : palette.textMuted }]} numberOfLines={2}>
        {challenge.rule.instructionHint}
      </Text>
      <ProgressBar value={timeRatio} color={timeRatio < 0.25 ? palette.danger : reversal ? '#241800' : palette.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', borderWidth: 1, borderRadius: 25, paddingHorizontal: 18, paddingVertical: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  kicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  action: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  rule: { fontSize: 25, lineHeight: 29, fontWeight: '900', letterSpacing: 0.25 },
  hint: { fontSize: 12, lineHeight: 17, marginTop: 5, marginBottom: 13 }
});
