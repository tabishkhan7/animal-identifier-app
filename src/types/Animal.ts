export type DangerLevel = 'Harmless' | 'Caution' | 'Dangerous' | string;

export type Animal = {
  name: string;
  scientificName: string;
  description: string;
  habitat: string;
  dangerLevel: DangerLevel;
  confidence: number; // 0..1
};

