import 'server-only'

export class ProviderError extends Error { constructor(public provider: string, public code: string, message: string, public retryable = false, public status?: number) { super(message) } }
export function correlationId() { return crypto.randomUUID() }
export async function fetchWithPolicy(url: string, init: RequestInit, timeoutMs: number, retries: number, provider: string) {
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs)
    try { const response = await fetch(url, { ...init, signal: controller.signal }); clearTimeout(timer); if (response.ok) return response; const retryable = response.status === 408 || response.status === 429 || response.status >= 500; if (!retryable || attempt === retries) throw new ProviderError(provider, 'HTTP_ERROR', `Provider returned ${response.status}`, retryable, response.status) } catch (error) { clearTimeout(timer); lastError = error; if (error instanceof ProviderError && !error.retryable) throw error; if (attempt === retries) break }
    await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)))
  }
  throw lastError instanceof ProviderError ? lastError : new ProviderError(provider, 'UNAVAILABLE', 'Provider request unavailable', true)
}
export function sanitizeProviderError(error: unknown) { return error instanceof ProviderError ? { provider: error.provider, code: error.code, message: error.message, retryable: error.retryable } : { provider: 'unknown', code: 'UNKNOWN', message: 'Provider unavailable', retryable: true } }
