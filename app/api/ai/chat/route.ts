import { NextResponse } from 'next/server'
import { detectTravelIntent, extractTravelContext, missingForIntent } from '@/lib/travel/intent'
import { mockTravelProvider } from '@/lib/travel/mock-provider'
import { searchFlights, searchHotels, searchActivities } from '@/lib/travel/registry'
import { travelConfig } from '@/lib/travel/config'
import type { TravelContext, TravelResponse } from '@/lib/travel/types'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: string; context?: TravelContext }
    const message = body.message?.trim(); if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
    const intent = detectTravelIntent(message); const context = extractTravelContext(message, body.context); const missing = missingForIntent(intent, context)
    if (missing.length) return NextResponse.json({ intent, context, missing, message: `Absolutely. What ${missing[0]} are you planning?` } satisfies TravelResponse)
    if (intent === 'hotel_search' || intent === 'multi_product_search') { const live = await searchHotels(context); const fallback = travelConfig.mockEnabled && live.offers.length === 0 ? await mockTravelProvider.searchHotels(context) : []; return NextResponse.json({ intent, context, source: live.offers.length ? 'live' : fallback.length ? 'mock' : 'unavailable', providerErrors: live.errors, message: live.offers.length ? `I found ${live.offers.length} live hotel options.` : fallback.length ? 'Here are development-only illustrative stays. Availability and pricing are not live.' : 'No configured hotel provider returned results.', result: { kind: 'hotels', offers: [...live.offers, ...fallback] } } satisfies TravelResponse) }
    if (intent === 'flight_search') { const live = await searchFlights(context); const fallback = travelConfig.mockEnabled && live.offers.length === 0 ? await mockTravelProvider.searchFlights(context) : []; return NextResponse.json({ intent, context, source: live.offers.length ? 'live' : fallback.length ? 'mock' : 'unavailable', providerErrors: live.errors, message: live.offers.length ? `I found ${live.offers.length} live flight options.` : fallback.length ? 'Here are development-only illustrative flights. Availability and pricing are not live.' : 'No configured flight provider returned results.', result: { kind: 'flights', offers: [...live.offers, ...fallback] } } satisfies TravelResponse) }
    if (intent === 'activity_search') { const offers = travelConfig.mockEnabled ? await mockTravelProvider.searchActivities(context) : []; return NextResponse.json({ intent, context, source: offers.length ? 'mock' : 'unavailable', message: offers.length ? 'These are development-only illustrative experiences.' : 'Activities are not connected yet.', result: { kind: 'activities', offers } } satisfies TravelResponse) }
    return NextResponse.json({ intent, context, source: 'unavailable', message: 'I can search configured flights and hotels, verify offers, and help plan itineraries. What would you like to arrange?' } satisfies TravelResponse)
  } catch (error) { console.error('[v0] travel chat error', error); return NextResponse.json({ error: 'I could not complete that search right now.' }, { status: 500 }) }
}
