import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { usePalette } from '@/hooks/usePalette';

export default function NotFoundScreen() {
  const router = useRouter();
  const palette = usePalette();
  return (
    <AppScreen contentStyle={styles.content}>
      <Panel style={styles.panel}>
        <Text style={[styles.code, { color: palette.primary }]}>404</Text>
        <Text style={[styles.title, { color: palette.text }]}>That rule does not exist.</Text>
        <Text style={[styles.copy, { color: palette.textMuted }]}>The requested screen could not be found.</Text>
        <PrimaryButton label="Back to home" onPress={() => router.replace('/')} />
      </Panel>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: { justifyContent: 'center' },
  panel: { alignSelf: 'center', width: '100%', maxWidth: 460, gap: 12 },
  code: { fontSize: 48, fontWeight: '900' },
  title: { fontSize: 23, fontWeight: '900' },
  copy: { fontSize: 15, lineHeight: 22, marginBottom: 10 }
});
