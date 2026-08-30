import { StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { AppScreen } from '@/components/AppScreen';
import { Panel } from '@/components/Panel';
import { usePalette } from '@/hooks/usePalette';

export default function PrivacyScreen() {
  const palette = usePalette();
  return (
    <AppScreen header={<AppHeader title="Privacy" />} contentStyle={styles.content}>
      <Panel style={styles.hero}>
        <Text style={[styles.kicker, { color: palette.primary }]}>PRIVACY BY DEFAULT</Text>
        <Text style={[styles.title, { color: palette.text }]}>Play as a guest. Stay offline.</Text>
        <Text style={[styles.copy, { color: palette.textMuted }]}>RuleSwitch does not require an account and does not collect names, contacts, precise location, messages, or other sensitive personal information.</Text>
      </Panel>
      <Section title="Stored on this device" items={['Settings and tutorial status', 'XP, level, Journey progress, and achievements', 'Scores, accuracy, response times, and streaks', 'The first official Daily Switch result for each date']} />
      <Section title="Optional diagnostics" items={['When a PostHog key is configured, anonymous gameplay events and non-sensitive performance properties are sent.', 'When a Sentry DSN is configured, crashes and errors are reported without default personal information.', 'With no environment credentials configured, both services remain disabled. Core play is unchanged.']} />
      <Section title="Network and monetization" items={['Daily challenges are generated locally from the calendar date and work offline.', 'No advertising SDK is active. Future ads are isolated between sessions and will never interrupt an active sequence.', 'Future cloud saves, leaderboards, and friend challenges will require a separate opt-in design.']} />
      <Text style={[styles.footer, { color: palette.textMuted }]}>You can delete all locally stored game data at any time from Settings → Reset all progress.</Text>
    </AppScreen>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  const palette = usePalette();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>{title}</Text>
      <Panel style={styles.sectionPanel}>
        {items.map((item) => <View key={item} style={styles.item}><Text style={[styles.bullet, { color: palette.primary }]}>●</Text><Text style={[styles.itemText, { color: palette.textMuted }]}>{item}</Text></View>)}
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { maxWidth: 680 },
  hero: { marginBottom: 20 },
  kicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  title: { fontSize: 24, fontWeight: '900', marginTop: 8 },
  copy: { fontSize: 14, lineHeight: 21, marginTop: 7 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '900', marginBottom: 8 },
  sectionPanel: { gap: 12 },
  item: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bullet: { fontSize: 9, marginTop: 5 },
  itemText: { flex: 1, fontSize: 13, lineHeight: 19 },
  footer: { fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 12 }
});
