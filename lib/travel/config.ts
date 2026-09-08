import 'server-only'

export const travelConfig = {
  environment: process.env.BEKA_ENV ?? process.env.NODE_ENV ?? 'development',
  debug: process.env.BEKA_DEBUG === 'true',
  mockEnabled: process.env.MOCK_TRAVEL_PROVIDER === 'true' && (process.env.BEKA_ENV ?? process.env.NODE_ENV) !== 'production',
  duffel: { enabled: Boolean(process.env.DUFFEL_API_TOKEN), baseUrl: process.env.DUFFEL_API_URL ?? 'https://api.duffel.com' },
  wink: { enabled: process.env.WINK_ENABLED === 'true' && Boolean(process.env.WINK_TOKEN_URL && process.env.WINK_CLIENT_ID && process.env.WINK_CLIENT_SECRET), bookingEnabled: process.env.WINK_BOOKING_ENABLED === 'true' },
  routeStack: { enabled: process.env.ROUTESTACK_ENABLED === 'true' && Boolean(process.env.ROUTESTACK_API_URL && process.env.ROUTESTACK_API_TOKEN) },
  timeoutMs: Math.min(Number(process.env.BEKA_PROVIDER_TIMEOUT_MS ?? 8000), 30000),
  retries: Math.min(Number(process.env.BEKA_PROVIDER_RETRIES ?? 1), 3),
} as const

export type ProviderStatus = 'connected' | 'not_configured' | 'blocked'
export function providerStatus(enabled: boolean, blocked = false): ProviderStatus { return blocked ? 'blocked' : enabled ? 'connected' : 'not_configured' }
