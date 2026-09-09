/**
 * Agoda Affiliate Integration
 * 
 * Strong in: Asia, Middle East, Australia
 * Products: Hotels only
 * Commission: 4-7%
 */

export interface AgodaSearchParams {
  city?: string
  checkin?: string // YYYY-MM-DD
  checkout?: string // YYYY-MM-DD
  adults?: number
  children?: number
  rooms?: number
  cityId?: number // Agoda city ID (optional)
}

/**
 * Generate Agoda affiliate link with search parameters
 */
export function generateAgodaLink(params: AgodaSearchParams): string {
  const partnerId = process.env.AGODA_PARTNER_ID || '1973407'
  const baseUrl = `https://www.agoda.com/partners/partnersearch.aspx`
  
  const queryParams = new URLSearchParams()
  
  // Required partner ID
  queryParams.append('cid', partnerId)
  
  // Search parameters
  if (params.city) {
    queryParams.append('city', params.city)
  }
  
  if (params.cityId) {
    queryParams.append('cityId', params.cityId.toString())
  }
  
  if (params.checkin) {
    queryParams.append('checkIn', params.checkin)
  }
  
  if (params.checkout) {
    queryParams.append('checkOut', params.checkout)
  }
  
  if (params.adults) {
    queryParams.append('adults', params.adults.toString())
  }
  
  if (params.children) {
    queryParams.append('children', params.children.toString())
  }
  
  if (params.rooms) {
    queryParams.append('rooms', params.rooms.toString())
  }
  
  // Tracking
  queryParams.append('tag', 'beka-travel')
  
  return `${baseUrl}?${queryParams.toString()}`
}

/**
 * Agoda city IDs for major Asian cities
 */
export const AGODA_CITY_IDS: Record<string, number> = {
  'tokyo': 2156,
  'bangkok': 4567,
  'singapore': 8801,
  'hong kong': 5085,
  'seoul': 6503,
  'dubai': 9255,
  'bali': 8976,
  'phuket': 10647,
  'kuala lumpur': 6801,
  'taipei': 12984,
  'jakarta': 6173,
  'manila': 7820,
  'ho chi minh': 17208,
  'hanoi': 9077,
  'macau': 4223,
  'osaka': 4718,
  'shanghai': 2909,
  'beijing': 2934,
  'mumbai': 15026,
  'delhi': 12444,
}

/**
 * Get Agoda city ID by name
 */
export function getAgodaCityId(city: string): number | undefined {
  const normalized = city.toLowerCase().trim()
  return AGODA_CITY_IDS[normalized]
}

/**
 * Check if destination is in Agoda's strong regions
 */
export function isAgodaStrongRegion(city: string): boolean {
  const normalized = city.toLowerCase().trim()
  return normalized in AGODA_CITY_IDS
}
