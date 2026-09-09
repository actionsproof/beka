import 'server-only'
import type { TravelProvider, TravelRequest, HotelOffer } from '../types'

/**
 * Booking.com Provider
 * Uses Booking.com affiliate API to search hotels and generate deep links
 * 
 * NOTE: Booking.com doesn't have a public REST API for searches
 * Alternative approaches:
 * 1. Use Booking.com Content API (requires partner approval)
 * 2. Use RapidAPI Booking.com endpoints
 * 3. Use our affiliate deep links with pre-filled params
 */

const BOOKING_AFFILIATE_ID = process.env.BOOKING_COM_AFFILIATE_ID || '1972695'
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

interface BookingSearchParams {
  destination: string
  checkin: string
  checkout: string
  adults: number
  rooms: number
  currency?: string
}

export function generateBookingLink(params: BookingSearchParams): string {
  const baseUrl = 'https://www.booking.com/searchresults.html'
  const searchParams = new URLSearchParams({
    aid: BOOKING_AFFILIATE_ID,
    ss: params.destination,
    checkin: params.checkin,
    checkout: params.checkout,
    group_adults: params.adults.toString(),
    no_rooms: params.rooms.toString(),
    selected_currency: params.currency || 'EUR',
  })
  
  return `${baseUrl}?${searchParams.toString()}`
}

export const bookingComProvider: TravelProvider = {
  name: 'booking.com',
  capabilities: ['hotel_search'],
  enabled: true,

  async searchHotels(request: TravelRequest): Promise<HotelOffer[]> {
    // If RapidAPI key is available, use Booking.com API
    if (RAPIDAPI_KEY && RAPIDAPI_KEY !== 'your_rapidapi_key_here') {
      try {
        return await searchHotelsViaRapidAPI(request)
      } catch (error) {
        console.error('[Booking.com] RapidAPI search failed:', error)
      }
    }

    // Fallback: Return mock hotels with affiliate deep links
    // This demonstrates the UI/UX even without RapidAPI
    console.log('[Booking.com] Using mock data with affiliate links')
    
    const nights = request.nights || 3
    const checkOut = request.checkOut || new Date(new Date(request.checkIn || Date.now()).getTime() + nights * 86400000).toISOString().split('T')[0]
    
    // Generate affiliate deep link for search results
    const deepLink = generateBookingLink({
      destination: request.destination || 'Rome',
      checkin: request.checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      checkout: checkOut,
      adults: request.guests || 2,
      rooms: request.rooms || 1,
      currency: request.currency || 'EUR',
    })

    // Return mock hotels with real affiliate links
    const mockHotels: HotelOffer[] = [
      {
        id: 'booking-mock-1',
        type: 'hotel',
        name: 'Grand Hotel Plaza',
        location: request.destination || 'Rome',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        stars: 5,
        rating: '9.2',
        roomType: 'Deluxe Room',
        amenities: ['WiFi', 'Breakfast', 'Pool', 'Spa'],
        price: {
          amount: Math.round((request.budget || 400) * 0.8),
          currency: request.currency || 'EUR',
        },
        pricePerNight: Math.round((request.budget || 400) * 0.8 / nights),
        cancellation: 'Free cancellation',
        provider: 'booking.com',
        providerMeta: {
          provider: 'booking.com',
          hotelId: 'mock-1',
          availability: 'available',
          capabilities: ['redirect'],
          deepLink: deepLink,
        },
      },
      {
        id: 'booking-mock-2',
        type: 'hotel',
        name: 'Luxury Boutique Hotel',
        location: request.destination || 'Rome',
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
        stars: 4,
        rating: '8.8',
        roomType: 'Superior Room',
        amenities: ['WiFi', 'Breakfast', 'Gym', 'Bar'],
        price: {
          amount: Math.round((request.budget || 400) * 0.6),
          currency: request.currency || 'EUR',
        },
        pricePerNight: Math.round((request.budget || 400) * 0.6 / nights),
        cancellation: 'Free cancellation',
        provider: 'booking.com',
        providerMeta: {
          provider: 'booking.com',
          hotelId: 'mock-2',
          availability: 'available',
          capabilities: ['redirect'],
          deepLink: deepLink,
        },
      },
      {
        id: 'booking-mock-3',
        type: 'hotel',
        name: 'City Center Inn',
        location: request.destination || 'Rome',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
        stars: 3,
        rating: '8.5',
        roomType: 'Standard Room',
        amenities: ['WiFi', 'Breakfast', '24h Reception'],
        price: {
          amount: Math.round((request.budget || 400) * 0.4),
          currency: request.currency || 'EUR',
        },
        pricePerNight: Math.round((request.budget || 400) * 0.4 / nights),
        cancellation: 'Free cancellation',
        provider: 'booking.com',
        providerMeta: {
          provider: 'booking.com',
          hotelId: 'mock-3',
          availability: 'available',
          capabilities: ['redirect'],
          deepLink: deepLink,
        },
      },
    ]

    // Filter by budget if specified
    if (request.budget) {
      return mockHotels.filter(h => h.price.amount <= request.budget!)
    }

    return mockHotels
  },

  async searchFlights() {
    return []
  },

  async searchActivities() {
    return []
  },

  async checkAvailability() {
    return { available: true }
  },
}

async function searchHotelsViaRapidAPI(request: TravelRequest): Promise<HotelOffer[]> {
  if (!RAPIDAPI_KEY) return []

  // RapidAPI Booking.com endpoint
  const url = 'https://booking-com.p.rapidapi.com/v1/hotels/search'
  
  const params = new URLSearchParams({
    dest_type: 'city',
    locale: 'en-gb',
    checkout_date: request.checkOut || '',
    checkin_date: request.checkIn || '',
    adults_number: (request.guests || 2).toString(),
    room_number: (request.rooms || 1).toString(),
    filter_by_currency: request.currency || 'EUR',
    order_by: 'popularity',
    units: 'metric',
    dest_id: '-1', // Will need to resolve destination to ID
  })

  const response = await fetch(`${url}?${params.toString()}`, {
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
    },
  })

  if (!response.ok) {
    throw new Error(`Booking.com API error: ${response.status}`)
  }

  const data = await response.json()

  // Transform Booking.com results to our format
  return (data.result || []).slice(0, 10).map((hotel: any) => ({
    id: hotel.hotel_id?.toString() || Math.random().toString(),
    type: 'hotel',
    name: hotel.hotel_name || 'Hotel',
    location: hotel.city || request.destination || '',
    image: hotel.max_photo_url || hotel.main_photo_url || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    stars: hotel.class || 3,
    rating: hotel.review_score?.toString() || '8.0',
    roomType: hotel.accommodation_type_name || 'Room',
    amenities: hotel.hotel_facilities?.slice(0, 5) || ['WiFi', 'Breakfast'],
    price: {
      amount: hotel.min_total_price || hotel.price_breakdown?.gross_price || 100,
      currency: hotel.currency_code || 'EUR',
    },
    pricePerNight: hotel.composite_price_breakdown?.net_amount?.value || Math.round((hotel.min_total_price || 100) / ((request.nights || 1))),
    cancellation: hotel.is_free_cancellable ? 'Free cancellation' : 'Non-refundable',
    provider: 'booking.com',
    providerMeta: {
      provider: 'booking.com',
      hotelId: hotel.hotel_id,
      availability: 'available',
      capabilities: ['redirect'],
      // Generate deep link to this specific hotel
      deepLink: `https://www.booking.com/hotel/${hotel.cc1}/${hotel.hotel_name_trans}.html?aid=${BOOKING_AFFILIATE_ID}&checkin=${request.checkIn}&checkout=${request.checkOut}&group_adults=${request.guests || 2}&no_rooms=${request.rooms || 1}`,
    },
  } satisfies HotelOffer))
}
