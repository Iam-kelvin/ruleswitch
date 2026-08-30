import { StyleSheet, Text, View } from 'react-native';
import { usePalette } from '@/hooks/usePalette';

export type FeedbackState = 'correct' | 'incorrect' | 'switch' | null;

export function FeedbackOverlay({ state }: { state: FeedbackState }) {
  const palette = usePalette();
  if (!state) return null;
  const correct = state === 'correct';
  const isSwitch = state === 'switch';
  const color = correct ? palette.success : isSwitch ? palette.warning : palette.danger;
  const label = correct ? 'NICE!' : isSwitch ? 'RULE SWITCH' : 'RESET & READ';
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityLiveRegion="assertive">
      <View style={[styles.flash, { borderColor: color }]} />
      <View style={[styles.pill, { backgroundColor: color }]}>
        <Text style={[styles.text, { color: correct ? '#071510' : isSwitch ? '#241800' : '#FFFFFF' }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flash: { ...StyleSheet.absoluteFillObject, borderWidth: 5, borderRadius: 28 },
  pill: { position: 'absolute', top: '43%', alignSelf: 'center', borderRadius: 99, paddingVertical: 12, paddingHorizontal: 24 },
  text: { fontSize: 16, fontWeight: '900', letterSpacing: 1.4 }
});
