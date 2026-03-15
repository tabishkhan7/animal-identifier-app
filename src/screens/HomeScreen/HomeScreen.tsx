import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { ImageUploader } from '../../components/ImageUploader';
import { useIdentifyAnimal } from '../../hooks/useIdentifyAnimal';

type ImageMeta = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [image, setImage] = useState<ImageMeta | null>(null);
  const { identify, loading, error, reset } = useIdentifyAnimal();

  const handleIdentify = useCallback(async () => {
    if (!image?.uri || loading) return;

    const result = await identify({
      uri: image.uri,
      fileName: image.fileName,
      mimeType: image.mimeType,
    });

    if (!result) {
      if (error) {
        Alert.alert('Identification failed', error);
      }
      return;
    }

    reset();

    router.push({
      pathname: '/result',
      params: {
        payload: JSON.stringify({
          animal: result,
          imageUri: image.uri,
        }),
      },
    });
  }, [error, identify, image, loading, reset, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Animal & Insect Identifier</Text>
          <Text style={styles.subtitle}>Upload a photo to let AI identify the species.</Text>
        </View>

        <ImageUploader value={image ?? undefined} onChange={setImage} />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.identifyButton,
            (!image?.uri || loading) && styles.identifyButtonDisabled,
            pressed && styles.identifyButtonPressed,
          ]}
          disabled={!image?.uri || loading}
          onPress={handleIdentify}>
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.identifyButtonText}>Identify Animal</Text>
          )}
        </Pressable>
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
    gap: 24,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f9fafb',
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  errorText: {
    color: '#fecaca',
    backgroundColor: '#450a0a',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  identifyButton: {
    marginTop: 'auto',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  identifyButtonDisabled: {
    opacity: 0.4,
  },
  identifyButtonPressed: {
    opacity: 0.8,
  },
  identifyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#020617',
  },
});

