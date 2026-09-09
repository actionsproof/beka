/**
 * Booking.com Affiliate Integration
 * Generates deep links to Booking.com with pre-filled search parameters
 * Commission: 25-40% on completed bookings
 */

export interface BookingComSearchParams {
  city?: string
  destinationId?: string
  checkin?: string // YYYY-MM-DD
  checkout?: string // YYYY-MM-DD
  adults?: number
  children?: number
  rooms?: number
}

/**
 * Generate a Booking.com affiliate link with search parameters
 */
export function generateBookingComLink(params: BookingComSearchParams): string {
  const baseUrl = process.env.BOOKING_COM_AFFILIATE_URL || 'https://www.dpbolvw.net/click-101869299-15735418'
  
  // Build query parameters for deep linking
  const queryParams = new URLSearchParams()
  
  if (params.city) {
    queryParams.append('ss', params.city)
  }
  
  if (params.destinationId) {
    queryParams.append('dest_id', params.destinationId)
    queryParams.append('dest_type', 'city')
  }
  
  if (params.checkin) {
    queryParams.append('checkin', params.checkin)
  }
  
  if (params.checkout) {
    queryParams.append('checkout', params.checkout)
  }
  
  if (params.adults) {
    queryParams.append('group_adults', params.adults.toString())
  }
  
  if (params.children) {
    queryParams.append('group_children', params.children.toString())
  }
  
  if (params.rooms) {
    queryParams.append('no_rooms', params.rooms.toString())
  }
  
  // Add affiliate tracking
  queryParams.append('aid', '2311228') // Booking.com affiliate ID
  queryParams.append('label', 'beka-travel-app')
  
  const query = queryParams.toString()
  return query ? `${baseUrl}?${query}` : baseUrl
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
