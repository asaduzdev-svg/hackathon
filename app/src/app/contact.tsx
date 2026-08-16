import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function ContactScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.centerText}>
            Aloqa
          </ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.centerText}>
            info@example.com
            {'\n'}
            +998 00 000 00 00
            {'\n'}
            Toshkent, O'zbekiston
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
