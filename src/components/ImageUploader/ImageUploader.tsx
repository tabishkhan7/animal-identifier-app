import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

type ImageMeta = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

type Props = {
  value?: ImageMeta | null;
  onChange: (image: ImageMeta | null) => void;
};

export function ImageUploader({ value, onChange }: Props) {
  const [picking, setPicking] = useState(false);

  const requestPermission = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }
    return true;
  }, []);

  const handlePick = useCallback(
    async (mode: 'camera' | 'library') => {
      setPicking(true);
      try {
        const hasPermission =
          mode === 'camera'
            ? await requestPermission()
            : (await ImagePicker.requestMediaLibraryPermissionsAsync()).status === 'granted';

        if (!hasPermission) {
          return;
        }

        const result =
          mode === 'camera'
            ? await ImagePicker.launchCameraAsync({
                quality: 0.7,
                allowsEditing: true,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
              })
            : await ImagePicker.launchImageLibraryAsync({
                quality: 0.7,
                allowsEditing: true,
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
              });

        if (result.canceled || !result.assets?.[0]?.uri) {
          return;
        }

        const asset = result.assets[0];
        onChange({
          uri: asset.uri,
          fileName: asset.fileName ?? 'upload.jpg',
          mimeType: asset.type ? `image/${asset.type}` : asset.mimeType ?? 'image/jpeg',
        });
      } finally {
        setPicking(false);
      }
    },
    [onChange, requestPermission]
  );

  return (
    <View style={styles.container}>
      <View style={styles.previewContainer}>
        {value?.uri ? (
          <Image source={{ uri: value.uri }} style={styles.previewImage} />
        ) : (
          <Text style={styles.previewPlaceholder}>No image selected</Text>
        )}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => handlePick('library')}
          disabled={picking}>
          {picking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Choose from gallery</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.buttonSecondary, pressed && styles.buttonPressed]}
          onPress={() => handlePick('camera')}
          disabled={picking}>
          <Text style={styles.buttonText}>Take photo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  previewContainer: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    color: '#64748b',
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#f9fafb',
    fontSize: 14,
    fontWeight: '600',
  },
});

