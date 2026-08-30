import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { usePalette } from '@/hooks/usePalette';

interface PrimaryButtonProps {
  label: string;
  onPress(): void;
  icon?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  variant = 'primary',
  style,
  accessibilityHint
}: PrimaryButtonProps) {
  const palette = usePalette();
  const background = variant === 'danger' ? palette.danger : variant === 'secondary' ? palette.panelStrong : palette.primary;
  const foreground = variant === 'primary' ? '#071510' : variant === 'danger' ? '#FFFFFF' : palette.text;
  const content = (
    <View style={styles.row}>
      {icon ? <Text style={[styles.icon, { color: foreground }]}>{icon}</Text> : null}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </View>
  );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, style, pressed && !disabled && styles.pressed, disabled && styles.disabled]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={[palette.primary, '#71F0D0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fill}>
          {content}
        </LinearGradient>
      ) : variant === 'ghost' ? (
        <View style={[styles.fill, { borderColor: palette.border, borderWidth: 1 }]}>{content}</View>
      ) : (
        <View style={[styles.fill, { backgroundColor: background }]}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { minHeight: 52, borderRadius: 17, overflow: 'hidden' },
  fill: { minHeight: 52, paddingHorizontal: 19, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 17 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  label: { fontSize: 15, fontWeight: '800', letterSpacing: 0.25 },
  icon: { fontSize: 19, fontWeight: '900' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 }
});
