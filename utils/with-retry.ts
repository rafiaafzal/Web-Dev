export function isRetryableAiError(error: unknown): boolean {
  const errStr = String(error).toLowerCase();
  return (
    errStr.includes('503') ||
    errStr.includes('unavailable') ||
    errStr.includes('high demand') ||
    errStr.includes('overloaded') ||
    errStr.includes('429') ||
    errStr.includes('resource_exhausted')
  );
}

export function formatActionError(error: unknown): string {
  const str = error instanceof Error ? error.message : String(error);
  if (str.includes('Invalid API key')) {
    return 'Server configuration error: the Supabase service key is invalid or missing. Contact the administrator.';
  }
  if (isRetryableAiError(str)) {
    return 'The AI service is busy right now. Please try again in a few seconds.';
  }
  return str;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 2
): Promise<T> {
  const delays = [2000, 5000];

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      if (!isRetryableAiError(err) || attempt === attempts) {
        throw err;
      }
      const delay = delays[attempt - 1] ?? 5000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Unexpected retry failure');
}
