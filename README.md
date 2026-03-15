# Animal & Insect Identifier – Code & Data Flow Guide

This document explains **how data flows through the app** from the moment a user selects an image in the mobile app to the point where results are displayed, and how the code is structured to support this flow.

---

## 1. High-Level Architecture

- **Frontend (React Native + Expo Router, TypeScript)**
  - UI and navigation
  - Image capture / selection
  - Calls backend via a **service layer**
  - Uses **hooks** for stateful logic (loading, error, result)

- **Backend (Express in `server/`)**
  - Exposes a `POST /identify` endpoint
  - Accepts `multipart/form-data` (`image` field)
  - Returns an `Animal` JSON object

- **Shared contract**
  - TypeScript `Animal` type (`src/types/Animal.ts`) describes the shape of backend responses.

The project follows a **feature-based architecture**, keeping UI, services, hooks, and types separated.

---

## 2. Data Flow Overview (Step by Step)

1. **User opens the app** on the **Home** tab.
   - Expo Router loads `app/(tabs)/index.tsx`, which renders the `HomeScreen`.

2. **User picks or takes a photo**.
   - `HomeScreen` renders `ImageUploader`.
   - `ImageUploader` uses `expo-image-picker` to either open the camera or gallery.
   - When the user confirms a photo, `ImageUploader` calls `onChange` with:
     - `uri`
     - `fileName`
     - `mimeType`
   - `HomeScreen` stores this metadata in local state.

3. **User taps “Identify Animal”**.
   - `HomeScreen` calls the `identify` function from the `useIdentifyAnimal` hook.
   - `useIdentifyAnimal` sets `loading=true`, clears old errors, and calls the service.

4. **Service layer sends image to backend**.
   - `useIdentifyAnimal` calls `animalService.identifyAnimal`.
   - `animalService.identifyAnimal`:
     - Creates a `FormData` object.
     - Appends the image file under the `image` field.
     - Uses the `apiClient.postForm` helper to `POST /identify` to the backend.

5. **Backend receives image and returns result**.
   - Express server in `server/index.js` receives the `multipart/form-data` request.
   - Multer parses the uploaded image.
   - The route handler returns an `Animal` JSON object (demo Monarch Butterfly data for now).

6. **Frontend receives response and navigates**.
   - `apiClient.postForm` parses the JSON and returns data to `animalService`.
   - `animalService` returns the `Animal` object to `useIdentifyAnimal`.
   - `useIdentifyAnimal` sets `loading=false`, `result=Animal`, `error=null`.
   - `HomeScreen` receives this `result`, calls `reset()` on the hook, and navigates to the `/result` route with:
     - A serialized payload: `{ animal, imageUri }`.

7. **Result screen displays the data**.
   - Expo Router loads `app/result.tsx` which renders `ResultScreen`.
   - `ResultScreen` reads the `payload` param, parses it, and, if valid:
     - Displays the image using the `imageUri`.
     - Renders an `AnimalCard` with all fields (name, scientificName, description, habitat, danger level, AI confidence %).

---

## 3. Types and Shared Contracts

### `src/types/Animal.ts`

Defines the shape of the AI response:

```ts
export type DangerLevel = 'Harmless' | 'Caution' | 'Dangerous' | string;

export type Animal = {
  name: string;
  scientificName: string;
  description: string;
  habitat: string;
  dangerLevel: DangerLevel;
  confidence: number; // 0..1
};
```

The **backend** returns this shape and the **frontend** expects this shape, keeping everything consistent.

---

## 4. Service Layer (No API Calls in Screens)

### 4.1 `src/services/apiClient.ts`

Purpose:

- Provide a reusable, typed HTTP client.
- Abstract away `fetch` details (timeouts, JSON parsing, error handling).

Key parts:

- `createApiClient({ baseUrl })` returns a client with:
  - `postForm<TResponse>(path, formData, opts?)`
- Uses `AbortController` to implement a request timeout.
- Parses JSON safely with `safeJsonParse`.
- Throws an `ApiError` on non-OK responses (makes errors consistent).

This file does **not** know anything about animals; it is generic.

### 4.2 `src/services/animalService.ts`

Purpose:

- Encapsulate **animal-related** API calls.
- Build the correct `FormData` for the backend.

Key points:

- Reads `API_BASE_URL` from the environment:

```ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
```

- Creates the API client:

```ts
const api = createApiClient({ baseUrl: API_BASE_URL });
```

- Implements `identifyAnimal`:

```ts
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
```

**Why this is good:**

- Screens never see `fetch` or `FormData`.
- If the backend URL or headers change, you only update this service.

---

## 5. Hooks – Encapsulating Business Logic

### `src/hooks/useIdentifyAnimal.ts`

Purpose:

- Provide a **reusable hook** that owns:
  - Loading state
  - Error state
  - Result state
  - The `identify` async function
  - A `reset` helper

The hook uses the service but exposes a UI-friendly API:

```ts
const { loading, error, result, identify, reset } = useIdentifyAnimal();
```

Key flow:

1. `identify` is called by the screen.
2. Hook sets `loading=true`, clears previous errors.
3. Calls `animalService.identifyAnimal`.
4. On success:
   - Stores `result` and clears `error`.
5. On failure:
   - Stores an error message and clears `result`.
6. `reset` resets the state to the initial values (useful before navigation).

This keeps your **screens focused on rendering and navigation**, not business logic.

---

## 6. Reusable UI Components

### 6.1 `src/components/ImageUploader/ImageUploader.tsx`

Purpose:

- Provide a **reusable image picker** with:
  - Preview area
  - “Choose from gallery” button
  - “Take photo” button

Responsibilities:

- Requests camera and media library permissions.
- Calls `expo-image-picker` APIs for camera and gallery.
- Displays:
  - Image preview if `value.uri` is present.
  - Placeholder text if no image is selected.
- Emits the chosen image metadata via `onChange`.

Why separate this:

- Any screen needing image selection can reuse this component.
- All permission and picker logic is centralized in one place.

### 6.2 `src/components/AnimalCard/AnimalCard.tsx`

Purpose:

- Display AI result details in a **single, styled card**.

Responsibilities:

- Shows:
  - `name` as title.
  - `scientificName` as italic subtitle.
  - `dangerLevel`, `habitat`, `confidence` lines.
  - `description` paragraph.
- Converts `confidence` from 0–1 into a 0–100 percentage.

Why separate this:

- Keeps `ResultScreen` simple and declarative (`<AnimalCard animal={payload.animal} />`).
- If design changes, you update it in one place.

---

## 7. Screens and Navigation

### 7.1 `src/screens/HomeScreen/HomeScreen.tsx`

Purpose:

- Main entry screen for the app.
- Coordinates:
  - User interaction
  - Hook calls
  - Navigation

Responsibilities:

1. **State and hooks**
   - Holds `image` state (from `ImageUploader`).
   - Uses `useIdentifyAnimal`:
     - `loading`, `error`, `identify`, `reset`.

2. **UI layout**
   - Title: “Animal & Insect Identifier”.
   - Subtitle describing the feature.
   - `ImageUploader` to select the image.
   - Error banner if `error` is present.
   - “Identify Animal” button:
     - Disabled when:
       - No image selected, or
       - `loading` is true.
     - Shows spinner when `loading`.

3. **Identify handler**

   ```ts
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
   ```

   - Calls `identify` from the hook.
   - On failure:
     - Shows an alert with the error message.
   - On success:
     - Resets the hook state.
     - Navigates to `/result` with a serialized payload.

### 7.2 `src/screens/ResultScreen/ResultScreen.tsx`

Purpose:

- Show the identification result.

Responsibilities:

1. **Read navigation params**
   - Uses `useLocalSearchParams` from Expo Router to get `payload`.
   - Parses `payload` JSON into `{ animal, imageUri }`.

2. **Handle invalid payload**
   - If parsing fails or required fields are missing:
     - Shows a simple “No result” message.
     - Provides a “Back to Home” button (using `router.replace('/')`).

3. **Render result**
   - Top row with:
     - Minimal “Back” button (using `router.back()`).
     - Centered “Result” title.
   - Main content:
     - Image preview for `imageUri`.
     - `AnimalCard` with `animal` data.

This keeps all result presentation details in one screen and one card component.

---

## 8. Expo Router Integration

### 8.1 `app/(tabs)/index.tsx`

- Tab route that renders the `HomeScreen`:

```ts
import { HomeScreen } from '../../src/screens/HomeScreen';

export default function HomeRoute() {
  return <HomeScreen />;
}
```

### 8.2 `app/result.tsx`

- Stack route that renders `ResultScreen`:

```ts
import { ResultScreen } from '../src/screens/ResultScreen';

export default function ResultRoute() {
  return <ResultScreen />;
}
```

### 8.3 `app/_layout.tsx`

- Root Stack configuration:
  - `(tabs)` for bottom-tab navigation.
  - `result` as a separate stack screen (for deep linking from `HomeScreen`).

---

## 9. Backend (`server/index.js`)

Purpose:

- Accept image uploads from the app.
- Provide an `Animal` response (currently demo data).

Flow:

1. `POST /identify` with `multipart/form-data`.
2. Multer parses the request and exposes `req.file`.
3. If `req.file` is missing, respond with `400`.
4. Otherwise, respond with a demo `Animal` object.

This mirrors what a real AI service would do, but with a fixed result, so you can develop the mobile app and end-to-end flow without needing the actual AI model in place yet.

---

## 10. Environment and Configuration

- **Environment variable**: `EXPO_PUBLIC_API_BASE_URL`
  - Used in `animalService` to know where the backend lives.
  - For a physical device (Expo Go on iPhone), this should be:
    - `http://<your-mac-LAN-ip>:3000`
  - Stored in `.env` in the project root.

This separation makes it easy to:

- Switch between local, staging, and production backends.
- Run the app against different servers without code changes.

---

## 11. Summary

- The app follows a **clean separation of concerns**:
  - **UI** components (`ImageUploader`, `AnimalCard`, screens)
  - **Hooks** for stateful logic (`useIdentifyAnimal`)
  - **Services** for networking (`apiClient`, `animalService`)
  - **Types** for shared contracts (`Animal`)
  - **Backend** for AI/identification (`server/index.js`)
- **Data flow** is straightforward:
  1. User selects image.
  2. Hook calls service.
  3. Service posts to backend.
  4. Backend returns `Animal`.
  5. Hook stores result.
  6. Screen navigates to Result.
  7. Result screen displays image + details.

This structure makes the app easy to extend (e.g., adding history, favorites, or multiple models) while keeping the core flow simple and testable.

