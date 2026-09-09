import 'server-only'
import type { TravelProvider, TravelRequest, HotelOffer, FlightOffer, ActivityOffer } from './types'
import { travelConfig } from './config'
import { DuffelProvider } from './providers/duffel'
import { RouteStackProvider } from './providers/routestack'
import { WinkProvider } from './providers/wink'
import { MockTravelProvider } from './mock-provider'

export function enabledProviders(): TravelProvider[] { 
  const providers: TravelProvider[] = []
  
  // Add real API providers
  if (travelConfig.duffel.enabled) providers.push(new DuffelProvider())
  if (travelConfig.routeStack.enabled) providers.push(new RouteStackProvider())
  if (travelConfig.wink.enabled) providers.push(new WinkProvider())
  
  // Add mock provider last as fallback
  if (travelConfig.mockEnabled) providers.push(new MockTravelProvider())
  
  return providers
}
export async function searchFlights(request: TravelRequest) { const providers = enabledProviders().filter((provider) => provider.capabilities.includes('flight_search')); const settled = await Promise.allSettled(providers.map((provider) => provider.searchFlights(request))); return { offers: settled.flatMap((item) => item.status === 'fulfilled' ? item.value : []), errors: settled.flatMap((item, index) => item.status === 'rejected' ? [{ provider: providers[index].name, code: 'UNAVAILABLE', message: 'Provider unavailable' }] : []) } }
export async function searchHotels(request: TravelRequest) { const providers = enabledProviders().filter((provider) => provider.capabilities.includes('hotel_search')); const settled = await Promise.allSettled(providers.map((provider) => provider.searchHotels(request))); return { offers: settled.flatMap((item) => item.status === 'fulfilled' ? item.value : []), errors: settled.flatMap((item, index) => item.status === 'rejected' ? [{ provider: providers[index].name, code: 'UNAVAILABLE', message: 'Provider unavailable' }] : []) } }
export async function searchActivities(request: TravelRequest) { const providers = enabledProviders().filter((provider) => provider.capabilities.includes('activity_search')); const settled = await Promise.allSettled(providers.map((provider) => provider.searchActivities(request))); return { offers: settled.flatMap((item) => item.status === 'fulfilled' ? item.value : []), errors: [] }
}
export function providerHealth() { return { Duffel: { status: travelConfig.duffel.enabled ? (travelConfig.duffel.configured ? 'LIVE' : 'NOT_CONFIGURED') : 'DISABLED', capabilities: ['flight_search'] }, Wink: { status: travelConfig.wink.enabled ? (travelConfig.wink.configured ? 'LIVE' : 'NOT_CONFIGURED') : 'DISABLED', capabilities: ['hotel_search'] }, RouteStack: { status: travelConfig.routeStack.enabled ? (travelConfig.routeStack.configured ? 'LIVE' : 'NOT_CONFIGURED') : 'DISABLED', capabilities: ['hotel_search', 'flight_search'] }, Mock: { status: travelConfig.mockEnabled ? 'MOCK' : 'DISABLED', capabilities: ['hotel_search', 'flight_search', 'activity_search'] } } }
