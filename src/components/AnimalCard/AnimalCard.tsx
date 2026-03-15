import { StyleSheet, Text, View } from 'react-native';

import type { Animal } from '../../types/Animal';

type Props = {
  animal: Animal;
};

export function AnimalCard({ animal }: Props) {
  const confidencePercent = Math.round(animal.confidence * 100);

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{animal.name}</Text>
      <Text style={styles.scientificName}>{animal.scientificName}</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Danger level:</Text>
        <Text style={styles.value}>{animal.dangerLevel}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Habitat:</Text>
        <Text style={styles.value}>{animal.habitat}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>AI confidence:</Text>
        <Text style={styles.value}>{confidencePercent}%</Text>
      </View>

      <Text style={styles.description}>{animal.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0f172a',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#9ca3af',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#9ca3af',
  },
  value: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#d1d5db',
    marginTop: 4,
  },
});

