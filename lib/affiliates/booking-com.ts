/**
 * Booking.com Affiliate Integration
 * Generates deep links to Booking.com with pre-filled search parameters
 * 
 * PRODUCTS AVAILABLE:
 * - Hotels & Accommodations
 * - Flights
 * - Car Rentals
 * - Airport Taxis
 * - Attractions & Tours
 * 
 * Commission: 25-40% on completed bookings
 */

export type BookingComProduct = 'hotels' | 'flights' | 'cars' | 'taxis' | 'attractions'

export interface BookingComSearchParams {
  product?: BookingComProduct
  city?: string
  destinationId?: string
  checkin?: string // YYYY-MM-DD
  checkout?: string // YYYY-MM-DD
  adults?: number
  children?: number
  rooms?: number
  // Flight-specific
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  tripType?: 'round-trip' | 'one-way'
  // Car rental-specific
  pickupLocation?: string
  dropoffLocation?: string
  pickupDate?: string
  dropoffDate?: string
  driverAge?: number
}

/**
 * Generate a Booking.com affiliate link with search parameters
 * Supports: hotels, flights, car rentals, taxis, attractions
 */
export function generateBookingComLink(params: BookingComSearchParams): string {
  const baseUrl = process.env.BOOKING_COM_AFFILIATE_URL || 'https://www.dpbolvw.net/click-101869299-15735418'
  const product = params.product || 'hotels'
  
  // Product-specific URLs
  const productUrls: Record<BookingComProduct, string> = {
    hotels: baseUrl,
    flights: `${baseUrl}?affiliate_id=2311228&type=flights`,
    cars: `${baseUrl}?affiliate_id=2311228&type=cars`,
    taxis: `${baseUrl}?affiliate_id=2311228&type=airport_taxis`,
    attractions: `${baseUrl}?affiliate_id=2311228&type=attractions`,
  }
  
  let finalUrl = productUrls[product]
  const queryParams = new URLSearchParams()
  
  // Common parameters
  queryParams.append('aid', '2311228')
  queryParams.append('label', 'beka-travel-app')
  
  // HOTELS
  if (product === 'hotels') {
    if (params.city) queryParams.append('ss', params.city)
    if (params.destinationId) {
      queryParams.append('dest_id', params.destinationId)
      queryParams.append('dest_type', 'city')
    }
    if (params.checkin) queryParams.append('checkin', params.checkin)
    if (params.checkout) queryParams.append('checkout', params.checkout)
    if (params.adults) queryParams.append('group_adults', params.adults.toString())
    if (params.children) queryParams.append('group_children', params.children.toString())
    if (params.rooms) queryParams.append('no_rooms', params.rooms.toString())
  }
  
  // FLIGHTS
  if (product === 'flights') {
    if (params.origin) queryParams.append('from', params.origin)
    if (params.destination) queryParams.append('to', params.destination)
    if (params.departureDate) queryParams.append('depart', params.departureDate)
    if (params.returnDate) queryParams.append('return', params.returnDate)
    if (params.adults) queryParams.append('adults', params.adults.toString())
    if (params.tripType) queryParams.append('type', params.tripType === 'one-way' ? 'oneway' : 'return')
  }
  
  // CAR RENTALS
  if (product === 'cars') {
    if (params.pickupLocation) queryParams.append('city', params.pickupLocation)
    if (params.pickupDate) queryParams.append('pickup_date', params.pickupDate)
    if (params.dropoffDate) queryParams.append('dropoff_date', params.dropoffDate)
    if (params.driverAge) queryParams.append('driver_age', params.driverAge.toString())
  }
  
  // AIRPORT TAXIS
  if (product === 'taxis') {
    if (params.pickupLocation) queryParams.append('from', params.pickupLocation)
    if (params.dropoffLocation) queryParams.append('to', params.dropoffLocation)
    if (params.pickupDate) queryParams.append('date', params.pickupDate)
  }
  
  // ATTRACTIONS
  if (product === 'attractions') {
    if (params.city) queryParams.append('city', params.city)
    if (params.destinationId) queryParams.append('destination_id', params.destinationId)
  }
  
  const query = queryParams.toString()
  return query ? `${finalUrl}&${query}` : finalUrl
}

/**
 * Common destination IDs for major cities
 * You can find more at: https://www.booking.com/
 */
export const BOOKING_COM_DESTINATIONS = {
  'cairo': '-290692',
  'rome': '-126693',
  'paris': '-1456928',
  'london': '-2601889',
  'new york': '20088325',
  'dubai': '-782831',
  'tokyo': '-246227',
  'barcelona': '-372490',
  'amsterdam': '-2140479',
  'istanbul': '-755070',
  'berlin': '-1746443',
  'madrid': '-390625',
  'prague': '-553173',
  'vienna': '-1995499',
  'athens': '-814876',
  'lisbon': '-2167973',
  'budapest': '-850553',
  'warsaw': '-523920',
  'moscow': '-2095177',
  'miami': '20023181',
}

/**
 * Get destination ID by city name
 */
export function getDestinationId(city: string): string | undefined {
  const normalizedCity = city.toLowerCase().trim()
  return BOOKING_COM_DESTINATIONS[normalizedCity as keyof typeof BOOKING_COM_DESTINATIONS]
}
