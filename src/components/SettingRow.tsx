import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { usePalette } from '@/hooks/usePalette';

interface SettingRowProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange(value: boolean): void;
}

export function SettingRow({ label, description, value, onValueChange }: SettingRowProps) {
  const palette = usePalette();
  return (
    <Pressable
      style={[styles.row, { borderBottomColor: palette.border }]}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value }}
    >
      <View style={styles.copy}>
        <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        <Text style={[styles.description, { color: palette.textMuted }]}>{description}</Text>
      </View>
      <Switch
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        value={value}
        trackColor={{ false: palette.border, true: palette.primary }}
        thumbColor={value ? '#FFFFFF' : palette.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12 },
  copy: { flex: 1 },
  label: { fontSize: 16, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 18, marginTop: 3 }
});
