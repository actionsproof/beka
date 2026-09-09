import 'server-only'
import type { TravelProvider, TravelRequest, FlightOffer, HotelOffer } from '../types'
import { travelConfig } from '../config'

export class RouteStackProvider implements TravelProvider {
  name = 'RouteStack'
  capabilities = ['flight_search', 'hotel_search'] as const

  private async makeRequest(endpoint: string, body: any) {
    const response = await fetch(`${travelConfig.routeStack.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${travelConfig.routeStack.apiToken}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(travelConfig.timeoutMs),
    })

    if (!response.ok) {
      throw new Error(`RouteStack API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
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
    try {
      const body = {
        location: request.destination,
        check_in: request.checkIn,
        check_out: request.checkOut,
        guests: request.adults || 1,
        rooms: request.rooms || 1,
      }

      const data = await this.makeRequest('/v1/hotels/search', body)

      // Map RouteStack response to our HotelOffer format
      return (data.offers || []).map((offer: any) => ({
        id: offer.id || `routestack-${Math.random().toString(36).substring(7)}`,
        name: offer.name || offer.hotel_name || 'Unknown Hotel',
        location: request.destination || 'Unknown Location',
        stars: offer.star_rating || offer.stars || 3,
        rating: offer.rating || offer.guest_rating || '8.0',
        image: offer.image_url || offer.main_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        price: {
          amount: Math.round(parseFloat(offer.price || offer.total_price || '0')),
          currency: offer.currency || 'USD',
        },
        pricePerNight: Math.round(parseFloat(offer.price_per_night || offer.nightly_rate || '0')),
        roomType: offer.room_type || offer.room_name || 'Standard Room',
        amenities: offer.amenities || ['WiFi', 'Breakfast'],
        cancellation: offer.cancellation_policy || 'Free cancellation',
        recommendation: offer.description || `Located in ${request.destination}`,
      }))
    } catch (error) {
      console.error('[RouteStack] Hotel search error:', error)
      throw error
    }
  }

  async searchActivities(): Promise<never[]> {
    return []
  }
}
