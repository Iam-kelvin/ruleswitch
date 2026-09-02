import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette } from '@/hooks/usePalette';

interface Option<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel
}: {
  options: Option<T>[];
  value: T;
  onChange(value: T): void;
  accessibilityLabel: string;
}) {
  const palette = usePalette();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.wrap, { backgroundColor: palette.backgroundAlt, borderColor: palette.border }]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && { backgroundColor: palette.primary }]}
          >
            <Text style={[styles.label, { color: selected ? palette.onPrimary : palette.textMuted }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderRadius: 16, padding: 4, gap: 4 },
  option: { flexGrow: 1, minWidth: 82, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  label: { fontSize: 13, fontWeight: '800' }
});
