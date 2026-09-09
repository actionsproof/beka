/**
 * Multi-Affiliate Manager
 * 
 * Manages multiple affiliate partners with fallback logic:
 * 1. Try primary partner first
 * 2. If unavailable, try backup partners
 * 3. Track which partner was used
 */

export type AffiliateProvider = 
  | 'booking.com'
  | 'expedia'
  | 'hotels.com'
  | 'agoda'
  | 'rentalcars'
  | 'getyourguide'
  | 'viator'

export type ProductType = 'hotels' | 'flights' | 'cars' | 'tours' | 'activities'

export interface AffiliateConfig {
  provider: AffiliateProvider
  url: string
  enabled: boolean
  products: ProductType[]
  commission: {
    hotels?: string
    flights?: string
    cars?: string
    tours?: string
  }
  region?: string // e.g., 'global', 'asia', 'europe'
  priority: number // Lower = higher priority
}

/**
 * Get all configured affiliate partners
 */
export function getAffiliateProviders(): AffiliateConfig[] {
  const providers: AffiliateConfig[] = []

  // Booking.com - Complete platform
  if (process.env.BOOKING_COM_AFFILIATE_URL) {
    providers.push({
      provider: 'booking.com',
      url: process.env.BOOKING_COM_AFFILIATE_URL,
      enabled: true,
      products: ['hotels', 'flights', 'cars', 'tours'],
      commission: {
        hotels: '25-40%',
        flights: '1-3%',
        cars: '10-15%',
        tours: '8-12%',
      },
      region: 'global',
      priority: 1, // Primary
    })
  }

  // Expedia - Strong alternative
  if (process.env.EXPEDIA_AFFILIATE_URL && process.env.EXPEDIA_AFFILIATE_URL !== 'your_expedia_affiliate_link_here') {
    providers.push({
      provider: 'expedia',
      url: process.env.EXPEDIA_AFFILIATE_URL,
      enabled: true,
      products: ['hotels', 'flights', 'cars'],
      commission: {
        hotels: '4-7%',
        flights: '2-5%',
        cars: '5-10%',
      },
      region: 'global',
      priority: 2, // Backup
    })
  }

  // Hotels.com - Hotel specialist
  if (process.env.HOTELS_COM_AFFILIATE_URL && process.env.HOTELS_COM_AFFILIATE_URL !== 'your_hotels_com_link_here') {
    providers.push({
      provider: 'hotels.com',
      url: process.env.HOTELS_COM_AFFILIATE_URL,
      enabled: true,
      products: ['hotels'],
      commission: {
        hotels: '4-6%',
      },
      region: 'global',
      priority: 3,
    })
  }

  // Agoda - Asia specialist
  if (process.env.AGODA_AFFILIATE_URL && process.env.AGODA_AFFILIATE_URL !== 'your_agoda_link_here') {
    providers.push({
      provider: 'agoda',
      url: process.env.AGODA_AFFILIATE_URL,
      enabled: true,
      products: ['hotels'],
      commission: {
        hotels: '4-7%',
      },
      region: 'asia',
      priority: 4,
    })
  }

  // Rentalcars.com - Car specialist
  if (process.env.RENTALCARS_AFFILIATE_URL && process.env.RENTALCARS_AFFILIATE_URL !== 'your_rentalcars_link_here') {
    providers.push({
      provider: 'rentalcars',
      url: process.env.RENTALCARS_AFFILIATE_URL,
      enabled: true,
      products: ['cars'],
      commission: {
        cars: '10-15%',
      },
      region: 'global',
      priority: 2, // Alternative to Booking.com cars
    })
  }

  // GetYourGuide - Tours specialist
  if (process.env.GETYOURGUIDE_AFFILIATE_URL && process.env.GETYOURGUIDE_AFFILIATE_URL !== 'your_getyourguide_link_here') {
    providers.push({
      provider: 'getyourguide',
      url: process.env.GETYOURGUIDE_AFFILIATE_URL,
      enabled: true,
      products: ['tours', 'activities'],
      commission: {
        tours: '8-12%',
      },
      region: 'global',
      priority: 2, // Better than Booking.com for tours
    })
  }

  // Viator - Premium tours
  if (process.env.VIATOR_AFFILIATE_URL && process.env.VIATOR_AFFILIATE_URL !== 'your_viator_link_here') {
    providers.push({
      provider: 'viator',
      url: process.env.VIATOR_AFFILIATE_URL,
      enabled: true,
      products: ['tours', 'activities'],
      commission: {
        tours: '8-10%',
      },
      region: 'global',
      priority: 3,
    })
  }

  return providers.sort((a, b) => a.priority - b.priority)
}

/**
 * Get best affiliate provider for a product
 */
export function getBestProvider(product: ProductType, region?: string): AffiliateConfig | null {
  const providers = getAffiliateProviders()
    .filter(p => p.enabled && p.products.includes(product))

  // Filter by region if specified
  const regionalProviders = region 
    ? providers.filter(p => !p.region || p.region === 'global' || p.region === region)
    : providers

  return regionalProviders[0] || providers[0] || null
}

/**
 * Get all providers for a product (for showing multiple options)
 */
export function getProvidersForProduct(product: ProductType): AffiliateConfig[] {
  return getAffiliateProviders()
    .filter(p => p.enabled && p.products.includes(product))
}

/**
 * Generate affiliate link using the best provider
 */
export function generateAffiliateLink(
  product: ProductType,
  params: {
    destination?: string
    origin?: string
    checkin?: string
    checkout?: string
    departureDate?: string
    returnDate?: string
    adults?: number
    rooms?: number
  }
): { provider: AffiliateProvider; url: string; commission: string } | null {
  const provider = getBestProvider(product)
  
  if (!provider) {
    return null
  }

  // Use product-specific generators
  let url = provider.url

  if (provider.provider === 'booking.com') {
    // Use existing Booking.com generator
    const { generateBookingComLink } = require('./booking-com')
    url = generateBookingComLink({
      product: product === 'tours' || product === 'activities' ? 'attractions' : product,
      city: params.destination,
      checkin: params.checkin,
      checkout: params.checkout,
      adults: params.adults,
      rooms: params.rooms,
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
    })
  } else if (provider.provider === 'expedia') {
    // Use Expedia-specific generator
    const { generateExpediaLink } = require('./expedia')
    url = generateExpediaLink({
      product: product === 'tours' || product === 'activities' ? 'hotels' : product,
      city: params.destination,
      checkin: params.checkin,
      checkout: params.checkout,
      adults: params.adults,
      rooms: params.rooms,
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      tripType: params.returnDate ? 'round-trip' : 'one-way',
    })
  } else {
    // Basic URL append for other providers
    // You can enhance this per provider
    const queryParams = new URLSearchParams()
    if (params.destination) queryParams.append('destination', params.destination)
    if (params.checkin) queryParams.append('checkin', params.checkin)
    if (params.checkout) queryParams.append('checkout', params.checkout)
    const query = queryParams.toString()
    url = query ? `${url}?${query}` : url
  }

  const commissionRate = provider.commission[product] || 'varies'

  return {
    provider: provider.provider,
    url,
    commission: commissionRate,
  }
}
