import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function AboutScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.centerText}>
            Loyiha haqida
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            Bu khakaton uchun yaratilgan loyiha. React Native, Expo Router va
            boshqa texnologiyalardan foydalanadi.
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.two,
    width: '100%',
  },
  centerText: {
    textAlign: 'center',
  },
});
