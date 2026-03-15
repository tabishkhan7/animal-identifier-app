import { useCallback, useState } from 'react';

import type { Animal } from '../types/Animal';
import { identifyAnimal } from '../services/animalService';

type State = {
  loading: boolean;
  error: string | null;
  result: Animal | null;
};

export function useIdentifyAnimal() {
  const [state, setState] = useState<State>({
    loading: false,
    error: null,
    result: null,
  });

  const identify = useCallback(async (params: { uri: string; fileName?: string; mimeType?: string }) => {
    if (!params.uri) return null;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await identifyAnimal(params);
      setState({ loading: false, error: null, result });
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong while identifying the animal.';
      setState({ loading: false, error: message, result: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null });
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    result: state.result,
    identify,
    reset,
  };
}

