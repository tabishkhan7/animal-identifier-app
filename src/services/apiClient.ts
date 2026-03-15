type ApiClientOptions = {
  baseUrl: string;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const DEFAULT_TIMEOUT_MS = 45_000;

export function createApiClient({ baseUrl }: ApiClientOptions) {
  async function postForm<TResponse>(
    path: string,
    formData: FormData,
    opts?: { timeoutMs?: number; headers?: Record<string, string> }
  ): Promise<TResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    try {
      const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        body: formData,
        headers: opts?.headers,
        signal: controller.signal,
      });

      const text = await res.text();
      const payload = text ? safeJsonParse(text) : undefined;

      if (!res.ok) {
        throw new ApiError(
          (payload as any)?.message ?? `Request failed with status ${res.status}`,
          res.status,
          payload
        );
      }

      return (payload as TResponse) ?? ({} as TResponse);
    } finally {
      clearTimeout(timeout);
    }
  }

  return { postForm };
}

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

