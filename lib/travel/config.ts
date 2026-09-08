import 'server-only'

export const travelConfig = {
  environment: process.env.BEKA_ENV ?? process.env.NODE_ENV ?? 'development',
  debug: process.env.BEKA_DEBUG === 'true',
  mockEnabled: process.env.MOCK_TRAVEL_PROVIDER === 'true' && (process.env.BEKA_ENV ?? process.env.NODE_ENV) !== 'production',
  duffel: { enabled: process.env.DUFFEL_ENABLED === 'true', configured: Boolean(process.env.DUFFEL_ENABLED === 'true' && process.env.DUFFEL_API_URL && process.env.DUFFEL_API_TOKEN), baseUrl: process.env.DUFFEL_API_URL },
  wink: { enabled: process.env.WINK_ENABLED === 'true', configured: Boolean(process.env.WINK_ENABLED === 'true' && process.env.WINK_TOKEN_URL && process.env.WINK_CLIENT_ID && process.env.WINK_CLIENT_SECRET), bookingEnabled: process.env.WINK_BOOKING_ENABLED === 'true' },
  routeStack: { enabled: process.env.ROUTESTACK_ENABLED === 'true', configured: Boolean(process.env.ROUTESTACK_ENABLED === 'true' && process.env.ROUTESTACK_API_URL && process.env.ROUTESTACK_API_TOKEN) },
  timeoutMs: Math.min(Number(process.env.BEKA_PROVIDER_TIMEOUT_MS ?? 8000), 30000),
  retries: Math.min(Number(process.env.BEKA_PROVIDER_RETRIES ?? 1), 3),
} as const

export type ProviderStatus = 'LIVE' | 'NOT_CONFIGURED' | 'DISABLED' | 'UNAVAILABLE' | 'MOCK'
export function providerStatus(enabled: boolean, configured: boolean, unavailable = false): ProviderStatus { return unavailable ? 'UNAVAILABLE' : !enabled ? 'DISABLED' : !configured ? 'NOT_CONFIGURED' : 'LIVE' }
