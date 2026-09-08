import { NextResponse } from 'next/server'
import { detectTravelIntent, extractTravelContext, missingForIntent } from '@/lib/travel/intent'
import { mockTravelProvider } from '@/lib/travel/mock-provider'
import type { TravelContext, TravelResponse } from '@/lib/travel/types'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: string; context?: TravelContext }
    const message = body.message?.trim()
    if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    const intent = detectTravelIntent(message)
    const context = extractTravelContext(message, body.context)
    const missing = missingForIntent(intent, context)
    if (missing.length) {
      return NextResponse.json({ intent, context, missing, message: `Absolutely. What ${missing[0]} are you planning?` } satisfies TravelResponse)
    }

    if (intent === 'hotel_search' || intent === 'multi_product_search') {
      const offers = await mockTravelProvider.searchHotels(context)
      return NextResponse.json({ intent, context, message: `I found ${offers.length || 3} illustrative stays matching your request. These are the options I'd consider first. Mock results only — availability and pricing are not live.`, result: { kind: 'hotels', offers } } satisfies TravelResponse)
    }
    if (intent === 'flight_search') {
      const offers = await mockTravelProvider.searchFlights(context)
      return NextResponse.json({ intent, context, message: `Here are the strongest illustrative flight options for your route. Mock results only — availability and pricing are not live.`, result: { kind: 'flights', offers } } satisfies TravelResponse)
    }
    if (intent === 'activity_search') {
      const offers = await mockTravelProvider.searchActivities(context)
      return NextResponse.json({ intent, context, message: `These are two standout experiences to start with in ${context.destination ?? 'your destination'}.`, result: { kind: 'activities', offers } } satisfies TravelResponse)
    }
    if (intent === 'trip_planning') {
      const destination = context.destination ?? 'Italy'
      const cities = destination.toLowerCase().includes('italy') ? ['Rome', 'Rome', 'Florence', 'Florence', 'Venice', 'Venice', 'Milan'] : [destination, destination, destination, destination, destination, destination, destination]
      return NextResponse.json({ intent, context, message: `Here is a considered 7-day starting point for ${destination}. You can ask me to find hotels or activities for any stop.`, result: { kind: 'itinerary', destination, days: cities.map((city, index) => ({ day: index + 1, city, title: index === 0 ? 'Arrive and settle in' : 'A day to explore', description: `A relaxed ${city} day with space for local food, culture, and a little serendipity.` })) } } satisfies TravelResponse)
    }
    return NextResponse.json({ intent, context, message: `I can help with hotels, flights, activities, itineraries, and comparisons. What would you like to arrange?` } satisfies TravelResponse)
  } catch (error) {
    console.error('[v0] travel chat error', error)
    return NextResponse.json({ error: 'I could not complete that search right now.' }, { status: 500 })
  }
}
