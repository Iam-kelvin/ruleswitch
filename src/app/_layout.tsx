import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { FeedbackProvider } from '@/services/FeedbackProvider';
import { initializeErrorReporting, reportError, Sentry } from '@/services/errors';
import { registerPwa } from '@/services/pwa';
import { track } from '@/services/analytics';
import { ProgressProvider, useProgress } from '@/state/ProgressProvider';
import { PALETTES } from '@/constants/theme';

initializeErrorReporting();
void SplashScreen.preventAutoHideAsync();

function Bootstrap() {
  const { data, status, error, retryLoad, useFreshProgress } = useProgress();
  const opened = useRef(false);
  const palette = PALETTES[data.settings.theme];

  useEffect(() => {
    registerPwa();
  }, []);

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
    if (status === 'ready' && !opened.current) {
      opened.current = true;
      track('app_opened');
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <View style={[styles.bootstrap, { backgroundColor: palette.background }]}>
        <View style={[styles.mark, { borderColor: palette.primary }]}><Text style={[styles.markText, { color: palette.primary }]}>↔</Text></View>
        <Text style={[styles.loadingTitle, { color: palette.text }]}>RuleSwitch</Text>
        <Text style={[styles.loadingCopy, { color: palette.textMuted }]}>Loading your offline progress…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.bootstrap, { backgroundColor: palette.background }]}>
        <Text style={[styles.errorIcon, { color: palette.danger }]}>!</Text>
        <Text style={[styles.loadingTitle, { color: palette.text }]}>Progress needs attention</Text>
        <Text style={[styles.loadingCopy, { color: palette.textMuted }]}>{error}</Text>
        <Pressable onPress={retryLoad} style={[styles.bootstrapButton, { backgroundColor: palette.primary }]}>
          <Text style={styles.bootstrapButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={useFreshProgress} style={[styles.bootstrapGhost, { borderColor: palette.border }]}>
          <Text style={[styles.bootstrapGhostText, { color: palette.text }]}>Start with fresh local progress</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FeedbackProvider>
      <StatusBar style={palette.statusBar} />
      <Stack screenOptions={{ headerShown: false, animation: data.settings.reducedMotion ? 'none' : 'fade' }} />
    </FeedbackProvider>
  );
}

function RootLayout() {
  return (
    <ProgressProvider>
      <Bootstrap />
    </ProgressProvider>
  );
}

export default Sentry.wrap(RootLayout);

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => reportError(error, { boundary: 'router' }), [error]);
  return (
    <View style={styles.bootstrap}>
      <Text style={styles.fallbackTitle}>RuleSwitch hit an unexpected error.</Text>
      <Text style={styles.fallbackCopy}>Your saved progress is still on this device.</Text>
      <Pressable onPress={retry} style={styles.fallbackButton}><Text style={styles.bootstrapButtonText}>Reload screen</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bootstrap: { flex: 1, backgroundColor: '#090C18', alignItems: 'center', justifyContent: 'center', padding: 28 },
  mark: { width: 82, height: 82, borderRadius: 28, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  markText: { fontSize: 42, fontWeight: '900' },
  loadingTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  loadingCopy: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8, marginBottom: 22, maxWidth: 420 },
  errorIcon: { fontSize: 54, fontWeight: '900', marginBottom: 12 },
  bootstrapButton: { minWidth: 220, minHeight: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  bootstrapButtonText: { color: '#071510', fontSize: 15, fontWeight: '900' },
  bootstrapGhost: { minWidth: 220, minHeight: 50, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginTop: 10, paddingHorizontal: 16 },
  bootstrapGhostText: { fontSize: 14, fontWeight: '800' },
  fallbackTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', textAlign: 'center' },
  fallbackCopy: { color: '#ADB6D5', fontSize: 15, marginTop: 8, marginBottom: 20, textAlign: 'center' },
  fallbackButton: { backgroundColor: '#41E3B5', minHeight: 50, borderRadius: 16, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' }
});
