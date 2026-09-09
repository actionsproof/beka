import type { TravelContext, TravelIntent } from './types'

export function detectTravelIntent(input: string): TravelIntent {
  const text = input.toLowerCase()
  if (/compare|versus| vs\.? /.test(text)) return 'comparison'
  if (/cancel|cancellation/.test(text)) return 'cancellation'
  if (/book|reserve|reservation/.test(text)) return 'booking'
  if (/flight|fly|airline|airport|ticket/.test(text) && /hotel|stay/.test(text)) return 'multi_product_search'
  if (/flight|fly|airline|airport|ticket/.test(text)) return 'flight_search'
  if (/activity|things to do|tour|experience/.test(text)) return 'activity_search'
  if (/hotel|resort|accommodation|stay|room/.test(text)) return 'hotel_search'
  if (/plan|itinerary|trip|holiday|vacation|visit/.test(text)) return 'trip_planning'
  return 'general_travel'
}

export function extractTravelContext(input: string, previous: TravelContext = {}): TravelContext {
  const context = { ...previous }
  const text = input.toLowerCase()
  
  // Extract origin (from X, leaving from X, departing from X)
  const originPatterns = [
    /from\s+([a-z]+(?:\s+[a-z]+)?)/i,
    /leaving\s+(?:from\s+)?([a-z]+(?:\s+[a-z]+)?)/i,
    /depart(?:ing)?\s+(?:from\s+)?([a-z]+(?:\s+[a-z]+)?)/i,
  ]
  for (const pattern of originPatterns) {
    const match = input.match(pattern)
    if (match && !context.origin) {
      context.origin = match[1].trim()
      break
    }
  }
  
  // Extract destination (to X, for X, in X)
  const destinationPatterns = [
    /(?:to|heading to|going to)\s+([a-z]+(?:\s+[a-z]+)?)/i,
    /(?:flight|flights|ticket|tickets)\s+(?:to|for)\s+([a-z]+(?:\s+[a-z]+)?)/i,
    /(?:in|visit|visiting)\s+([a-z]+(?:\s+[a-z]+)?)/i,
  ]
  for (const pattern of destinationPatterns) {
    const match = input.match(pattern)
    if (match && !context.destination) {
      context.destination = match[1].trim()
      break
    }
  }
  
  // Handle date keywords
  const today = new Date()
  if (/tomorrow/i.test(input)) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    context.departureDate = tomorrow.toISOString().split('T')[0]
  } else if (/today/i.test(input)) {
    context.departureDate = today.toISOString().split('T')[0]
  } else if (/next week/i.test(input)) {
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    context.departureDate = nextWeek.toISOString().split('T')[0]
  }
  
  // Extract specific dates (YYYY-MM-DD, MM/DD, DD/MM)
  const dateMatch = input.match(/(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) context.departureDate = dateMatch[1]
  
  const budget = input.match(/(?:under|below|budget of|less than)\s*[€$£]?\s*([\d,]+)/i)
  if (budget) context.budget = Number(budget[1].replace(',', ''))
  
  const guests = input.match(/(?:for|with)\s+(\d+)\s+(?:people|guests|travelers|passengers?)/i)
  if (guests) context.guests = Number(guests[1])
  
  const nights = input.match(/(\d+)\s+nights?/i)
  if (nights) context.nights = Number(nights[1])
  
  const stars = input.match(/(\d)\s*[- ]?star/i)
  if (stars) context.hotelStars = Number(stars[1])
  
  if (/euro|€/.test(text)) context.currency = 'EUR'
  if (/dollar|\$|usd/.test(text)) context.currency = 'USD'
  
  return context
}

export function missingForIntent(intent: TravelIntent, context: TravelContext) {
  if (intent === 'hotel_search') {
    if (!context.destination) return ['destination']
    if (!context.nights && !context.checkIn) return ['dates or number of nights']
  }
  if (intent === 'flight_search') {
    // If only origin specified (departing from cairo), ask for destination
    if (context.origin && !context.destination) return ['destination']
    // If neither specified, ask where they're going
    if (!context.origin && !context.destination) return ['where you want to go']
    // If only destination, assume they mean "from here to there" and just need date
    if (!context.origin && context.destination && !context.departureDate) return ['departure date']
    if (context.origin && context.destination && !context.departureDate) return ['departure date']
  }
  return []
}
