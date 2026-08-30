import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePalette } from '@/hooks/usePalette';

interface AppScreenProps extends PropsWithChildren {
  scroll?: boolean;
  header?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function AppScreen({ children, scroll = true, header, contentStyle, testID }: AppScreenProps) {
  const palette = usePalette();
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top', 'right', 'bottom', 'left']} testID={testID}>
      <LinearGradient colors={[palette.background, palette.backgroundAlt]} style={StyleSheet.absoluteFill} />
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.fixed}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  fixed: { flex: 1, alignItems: 'center' },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: {
    width: '100%',
    maxWidth: 960,
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32
  }
});
