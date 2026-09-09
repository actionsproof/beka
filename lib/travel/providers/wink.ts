import 'server-only'
import type { TravelProvider, TravelRequest, HotelOffer } from '../types'
import { travelConfig } from '../config'

export class WinkProvider implements TravelProvider {
  name = 'Wink'
  capabilities = ['hotel_search'] as const

  private accessToken: string | null = null
  private tokenExpiry: number = 0

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    // Get new OAuth2 token
    const response = await fetch(travelConfig.wink.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: travelConfig.wink.clientId,
        client_secret: travelConfig.wink.clientSecret,
      }),
    })

    if (!response.ok) {
      throw new Error(`Wink OAuth error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    // Set expiry 5 minutes before actual expiry to be safe
    this.tokenExpiry = Date.now() + ((data.expires_in - 300) * 1000)
    
    return this.accessToken
  }

  private async makeRequest(endpoint: string, params: Record<string, any>) {
    const token = await this.getAccessToken()
    
    const url = new URL(`https://api.wink.travel${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(travelConfig.timeoutMs),
    })

    if (!response.ok) {
      throw new Error(`Wink API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async searchFlights(): Promise<never[]> {
    return []
  }

  async searchHotels(request: TravelRequest): Promise<HotelOffer[]> {
    try {
      const params = {
        location: request.destination,
        check_in: request.checkIn,
        check_out: request.checkOut,
        guests: request.adults || 1,
        rooms: request.rooms || 1,
      }

      const data = await this.makeRequest('/v1/inventory/search', params)

      // Map Wink response to our HotelOffer format
      return (data.hotels || data.results || []).map((hotel: any) => ({
        id: hotel.id || `wink-${Math.random().toString(36).substring(7)}`,
        name: hotel.name || hotel.property_name || 'Unknown Hotel',
        location: request.destination || hotel.city || 'Unknown Location',
        stars: hotel.star_rating || hotel.stars || 3,
        rating: hotel.rating || hotel.guest_rating || '8.0',
        image: hotel.main_image || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        price: {
          amount: Math.round(parseFloat(hotel.total_price || hotel.price || '0')),
          currency: hotel.currency || 'USD',
        },
        pricePerNight: Math.round(parseFloat(hotel.nightly_rate || hotel.rate_per_night || '0')),
        roomType: hotel.room_type || hotel.room_name || 'Standard Room',
        amenities: hotel.amenities || hotel.facilities || ['WiFi', 'Breakfast'],
        cancellation: hotel.cancellation_policy || 'Free cancellation',
        recommendation: hotel.description || `${hotel.stars || 3}-star hotel in ${request.destination}`,
      }))
    } catch (error) {
      console.error('[Wink] Hotel search error:', error)
      throw error
    }
  }

  async searchActivities(): Promise<never[]> {
    return []
  }
}
