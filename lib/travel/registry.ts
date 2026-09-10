import 'server-only'
import type { TravelProvider, TravelRequest, HotelOffer, FlightOffer, ActivityOffer } from './types'
import { travelConfig } from './config'
import { DuffelProvider } from './providers/duffel'

export function enabledProviders(): TravelProvider[] { 
  const providers: TravelProvider[] = []
  
  // ONLY Duffel for flights - working and tested
  if (travelConfig.duffel.enabled) providers.push(new DuffelProvider())
  
  return providers
}
export async function searchFlights(request: TravelRequest) { const providers = enabledProviders().filter((provider) => provider.capabilities.includes('flight_search')); const settled = await Promise.allSettled(providers.map((provider) => provider.searchFlights(request))); return { offers: settled.flatMap((item) => item.status === 'fulfilled' ? item.value : []), errors: settled.flatMap((item, index) => item.status === 'rejected' ? [{ provider: providers[index].name, code: 'UNAVAILABLE', message: 'Provider unavailable' }] : []) } }
export async function searchHotels(request: TravelRequest) { const providers = enabledProviders().filter((provider) => provider.capabilities.includes('hotel_search')); const settled = await Promise.allSettled(providers.map((provider) => provider.searchHotels(request))); return { offers: settled.flatMap((item) => item.status === 'fulfilled' ? item.value : []), errors: settled.flatMap((item, index) => item.status === 'rejected' ? [{ provider: providers[index].name, code: 'UNAVAILABLE', message: 'Provider unavailable' }] : []) } }
export async function searchActivities(request: TravelRequest) { const providers = enabledProviders().filter((provider) => provider.capabilities.includes('activity_search')); const settled = await Promise.allSettled(providers.map((provider) => provider.searchActivities(request))); return { offers: settled.flatMap((item) => item.status === 'fulfilled' ? item.value : []), errors: [] }
}
export function providerHealth() {
  return {
    Duffel: {
      status: travelConfig.duffel.enabled ? (travelConfig.duffel.configured ? 'LIVE' : 'NOT_CONFIGURED') : 'DISABLED',
      capabilities: ['flight_search']
    }
  }
}
