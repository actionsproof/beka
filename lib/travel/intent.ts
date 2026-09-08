import type { TravelContext, TravelIntent } from './types'

export function detectTravelIntent(input: string): TravelIntent {
  const text = input.toLowerCase()
  if (/compare|versus| vs\.? /.test(text)) return 'comparison'
  if (/cancel|cancellation/.test(text)) return 'cancellation'
  if (/book|reserve|reservation/.test(text)) return 'booking'
  if (/flight|fly|airline|airport/.test(text) && /hotel|stay/.test(text)) return 'multi_product_search'
  if (/flight|fly|airline|airport/.test(text)) return 'flight_search'
  if (/activity|things to do|tour|experience/.test(text)) return 'activity_search'
  if (/hotel|resort|accommodation|stay|room/.test(text)) return 'hotel_search'
  if (/plan|itinerary|trip|holiday|vacation|visit/.test(text)) return 'trip_planning'
  return 'general_travel'
}

export function extractTravelContext(input: string, previous: TravelContext = {}): TravelContext {
  const context = { ...previous }
  const origin = input.match(/from\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
  if (origin && !context.origin) context.origin = origin[1]
  const destination = input.match(/(?:in|to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/)
  if (destination && !context.destination) context.destination = destination[1]
  const budget = input.match(/(?:under|below|budget of|less than)\s*[€$£]?\s*([\d,]+)/i)
  if (budget) context.budget = Number(budget[1].replace(',', ''))
  const guests = input.match(/(?:for|with)\s+(\d+)\s+(?:people|guests|travelers)/i)
  if (guests) context.guests = Number(guests[1])
  const nights = input.match(/(\d+)\s+nights?/i)
  if (nights) context.nights = Number(nights[1])
  const stars = input.match(/(\d)\s*[- ]?star/i)
  if (stars) context.hotelStars = Number(stars[1])
  if (/euro|€/.test(input.toLowerCase())) context.currency = 'EUR'
  return context
}

export function missingForIntent(intent: TravelIntent, context: TravelContext) {
  if (intent === 'hotel_search' && !context.destination) return ['destination']
  if (intent === 'hotel_search' && !context.nights) return ['dates or number of nights']
  if (intent === 'flight_search' && !context.origin) return ['origin airport or city']
  if (intent === 'flight_search' && !context.destination) return ['destination']
  return []
}
