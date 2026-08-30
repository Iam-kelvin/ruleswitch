import { StyleSheet, View } from 'react-native';
import { usePalette } from '@/hooks/usePalette';

export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const palette = usePalette();
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { backgroundColor: palette.panelStrong }]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}>
      <View style={[styles.fill, { backgroundColor: color ?? palette.primary, width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 99 }
});
