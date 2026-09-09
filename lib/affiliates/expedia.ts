/**
 * Expedia Affiliate Integration
 * 
 * Products: Hotels, Flights, Cars, Vacation Packages
 * Commission: 4-7% hotels, 2-5% packages, 1-3% flights
 */

export interface ExpediaSearchParams {
  product?: 'hotels' | 'flights' | 'cars' | 'packages'
  // Hotels
  city?: string
  checkin?: string // YYYY-MM-DD
  checkout?: string // YYYY-MM-DD
  adults?: number
  children?: number
  rooms?: number
  // Flights
  origin?: string
  destination?: string
  departureDate?: string
  returnDate?: string
  tripType?: 'round-trip' | 'one-way'
  // Cars
  pickupLocation?: string
  dropoffLocation?: string
  pickupDate?: string
  dropoffDate?: string
}

/**
 * Generate Expedia affiliate link with search parameters
 */
export function generateExpediaLink(params: ExpediaSearchParams): string {
  const baseUrl = process.env.EXPEDIA_AFFILIATE_URL || 'https://expedia.com/affiliate/1EOkgIE'
  const product = params.product || 'hotels'
  
  // Expedia uses different base URLs per product
  const productPaths: Record<string, string> = {
    hotels: '/Hotel-Search',
    flights: '/Flights',
    cars: '/Cars',
    packages: '/Vacation-Packages',
  }
  
  const queryParams = new URLSearchParams()
  
  // HOTELS
  if (product === 'hotels') {
    if (params.city) queryParams.append('destination', params.city)
    if (params.checkin) queryParams.append('startDate', params.checkin)
    if (params.checkout) queryParams.append('endDate', params.checkout)
    if (params.adults) queryParams.append('adults', params.adults.toString())
    if (params.rooms) queryParams.append('rooms', params.rooms.toString())
  }
  
  // FLIGHTS
  if (product === 'flights') {
    if (params.origin) queryParams.append('flight-type', params.tripType === 'one-way' ? 'oneway' : 'roundtrip')
    if (params.origin) queryParams.append('fromLocation', params.origin)
    if (params.destination) queryParams.append('toLocation', params.destination)
    if (params.departureDate) queryParams.append('departureDate', params.departureDate)
    if (params.returnDate) queryParams.append('returnDate', params.returnDate)
    if (params.adults) queryParams.append('adults', params.adults.toString())
  }
  
  // CARS
  if (product === 'cars') {
    if (params.pickupLocation) queryParams.append('pickUpLocation', params.pickupLocation)
    if (params.dropoffLocation) queryParams.append('dropOffLocation', params.dropoffLocation)
    if (params.pickupDate) queryParams.append('pickUpDate', params.pickupDate)
    if (params.dropoffDate) queryParams.append('dropOffDate', params.dropoffDate)
  }
  
  const path = productPaths[product] || ''
  const query = queryParams.toString()
  
  return query ? `${baseUrl}${path}?${query}` : `${baseUrl}${path}`
}

/**
 * Format city name for Expedia search
 */
export function formatExpediaCity(city: string): string {
  // Expedia uses city names with spaces
  return city.trim()
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
