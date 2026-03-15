import type { Animal } from '../types/Animal';
import { createApiClient } from './apiClient';

// Set this to your backend URL (must be reachable by the device/emulator).
// Example for local dev:
//   - iOS simulator:   http://localhost:3000
//   - Android emulator: http://10.0.2.2:3000
//   - Physical device: http://<your-computer-LAN-ip>:3000
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

const api = createApiClient({ baseUrl: API_BASE_URL });

export type IdentifyAnimalResponse = Animal;

export async function identifyAnimal(params: {
  uri: string;
  fileName?: string;
  mimeType?: string;
}): Promise<IdentifyAnimalResponse> {
  const form = new FormData();
  form.append('image', {
    uri: params.uri,
    name: params.fileName ?? 'upload.jpg',
    type: params.mimeType ?? 'image/jpeg',
  } as any);

  return await api.postForm<IdentifyAnimalResponse>('/identify', form);
}

