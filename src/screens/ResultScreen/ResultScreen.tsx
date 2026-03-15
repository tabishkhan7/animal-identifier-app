import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import type { Animal } from '../../types/Animal';
import { AnimalCard } from '../../components/AnimalCard';

type Payload = {
  animal: Animal;
  imageUri: string;
};

function parsePayload(raw: unknown): Payload | null {
  if (typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw) as Payload;
    if (!parsed?.animal || !parsed?.imageUri) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ payload?: string }>();
  const payload = parsePayload(params.payload);

  if (!payload) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.errorTitle}>No result</Text>
          <Text style={styles.errorText}>We could not load the identification result.</Text>
          <Pressable style={styles.backButton} onPress={() => router.replace('/')}>
            <Text style={styles.backButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButtonMinimal} onPress={() => router.back()}>
            <Text style={styles.backButtonMinimalText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Result</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.imageWrapper}>
          <Image source={{ uri: payload.imageUri }} style={styles.image} />
        </View>

        <AnimalCard animal={payload.animal} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#020617',
  },
  image: {
    width: '100%',
    height: 260,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
  },
  backButton: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#020617',
  },
  backButtonMinimal: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  backButtonMinimalText: {
    fontSize: 13,
    color: '#e5e7eb',
  },
});

