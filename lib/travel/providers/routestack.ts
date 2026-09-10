import 'server-only'
import type { TravelProvider, TravelRequest, FlightOffer, HotelOffer } from '../types'
import { travelConfig } from '../config'

export class RouteStackProvider implements TravelProvider {
  name = 'RouteStack'
  capabilities = ['flight_search', 'hotel_search'] as const

  private async makeRequest(endpoint: string, body: any) {
    console.log('[RouteStack] Making request to:', `${travelConfig.routeStack.apiUrl}${endpoint}`)
    console.log('[RouteStack] With body:', JSON.stringify(body, null, 2))
    
    const response = await fetch(`${travelConfig.routeStack.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${travelConfig.routeStack.apiToken}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(travelConfig.timeoutMs),
    })

    console.log('[RouteStack] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[RouteStack] API error response:', errorText)
      throw new Error(`RouteStack API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log('[RouteStack] Response data:', JSON.stringify(data, null, 2))
    
    return data
  }

  async searchFlights(request: TravelRequest): Promise<FlightOffer[]> {
    try {
      const body = {
        origin: request.origin,
        destination: request.destination,
        departure_date: request.departureDate,
        return_date: request.returnDate,
        passengers: request.adults || 1,
        cabin_class: 'economy',
      }

      const data = await this.makeRequest('/v1/flights/search', body)

      // Map RouteStack response to our FlightOffer format
      return (data.offers || []).map((offer: any) => ({
        id: offer.id || `routestack-${Math.random().toString(36).substring(7)}`,
        airline: offer.airline || offer.carrier_name || 'Unknown Airline',
        route: `${request.origin} → ${request.destination}`,
        departure: offer.departure_time || '00:00',
        arrival: offer.arrival_time || '00:00',
        duration: offer.duration || 'N/A',
        stops: offer.stops === 0 ? 'Direct' : `${offer.stops} stop${offer.stops > 1 ? 's' : ''}`,
        price: {
          amount: Math.round(parseFloat(offer.price || offer.total_amount || '0')),
          currency: offer.currency || 'USD',
        },
      }))
    } catch (error) {
      console.error('[RouteStack] Flight search error:', error)
      throw error
    }
  }

  async searchHotels(request: TravelRequest): Promise<HotelOffer[]> {
    console.log('[RouteStack] Searching hotels with request:', request)
    
    try {
      const body = {
        location: request.destination,
        check_in: request.checkIn,
        check_out: request.checkOut,
        guests: request.adults || request.guests || 1,
        rooms: request.rooms || 1,
      }

      console.log('[RouteStack] Request body:', JSON.stringify(body, null, 2))

      const data = await this.makeRequest('/v1/hotels/search', body)

      console.log('[RouteStack] Response data:', JSON.stringify(data, null, 2))

      // Map RouteStack response to our HotelOffer format
      const offers = (data.offers || []).map((offer: any) => ({
        id: offer.id || `routestack-${Math.random().toString(36).substring(7)}`,
        type: 'hotel',
        name: offer.name || offer.hotel_name || 'Unknown Hotel',
        location: request.destination || 'Unknown Location',
        stars: offer.star_rating || offer.stars || 3,
        rating: offer.rating || offer.guest_rating || '8.0',
        image: offer.image_url || offer.main_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        price: {
          amount: Math.round(parseFloat(offer.price || offer.total_price || '0')),
          currency: offer.currency || 'EUR',
        },
        pricePerNight: Math.round(parseFloat(offer.price_per_night || offer.nightly_rate || '0')),
        roomType: offer.room_type || offer.room_name || 'Standard Room',
        amenities: offer.amenities || ['WiFi', 'Breakfast'],
        cancellation: offer.cancellation_policy || 'Free cancellation',
        recommendation: offer.description || `Located in ${request.destination}`,
        provider: this.name,
      }))

      console.log('[RouteStack] Mapped offers:', offers.length)

      return offers
    } catch (error) {
      console.error('[RouteStack] Hotel search error:', error)
      throw error
    }
  }

  async searchActivities(): Promise<never[]> {
    return []
  }
}
