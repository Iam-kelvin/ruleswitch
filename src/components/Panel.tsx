import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { usePalette } from '@/hooks/usePalette';

interface PanelProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function Panel({ children, style }: PanelProps) {
  const palette = usePalette();
  return <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.border, shadowColor: palette.shadow }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  }
});
