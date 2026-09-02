import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { usePalette, useReducedMotion } from '@/hooks/usePalette';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export function AppHeader({ title, subtitle, back = true, right }: AppHeaderProps) {
  const router = useRouter();
  const palette = usePalette();
  const reducedMotion = useReducedMotion();
  return (
    <View style={[styles.shell, { borderBottomColor: palette.border, backgroundColor: palette.background }]}>
      <View style={styles.inner}>
        {back ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={({ pressed }) => [styles.back, { borderColor: palette.border }, pressed && (reducedMotion ? styles.pressedReduced : styles.pressed)]}
          >
            <Text style={[styles.backText, { color: palette.text }]}>‹</Text>
          </Pressable>
        ) : (
          <View style={styles.back} />
        )}
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} style={[styles.title, { color: palette.text }]}>{title}</Text>
          {subtitle ? <Text numberOfLines={1} style={[styles.subtitle, { color: palette.textMuted }]}>{subtitle}</Text> : null}
        </View>
        <View style={styles.right}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { borderBottomWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 960, minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  back: { width: 44, height: 44, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 34, lineHeight: 36, marginTop: -3 },
  titleWrap: { flex: 1 },
  title: { fontSize: 19, fontWeight: '800', letterSpacing: 0.2 },
  subtitle: { fontSize: 12, marginTop: 2 },
  right: { minWidth: 44, alignItems: 'flex-end' },
  pressed: { opacity: 0.65, transform: [{ scale: 0.97 }] },
  pressedReduced: { opacity: 0.65 }
});
