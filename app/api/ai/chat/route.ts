import { NextResponse } from 'next/server'
import { detectTravelIntent, extractTravelContext, missingForIntent } from '@/lib/travel/intent'
import { mockTravelProvider } from '@/lib/travel/mock-provider'
import { searchFlights, searchHotels, searchActivities } from '@/lib/travel/registry'
import { travelConfig } from '@/lib/travel/config'
import { AI_ENABLED, extractTravelIntent as aiExtractIntent } from '@/lib/ai/groq-client'
import { resolveAirportCode } from '@/lib/travel/airport-codes'
import { generateAffiliateLink } from '@/lib/affiliates/manager'
import type { TravelContext, TravelResponse } from '@/lib/travel/types'

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: string; context?: TravelContext; history?: Array<{role: 'user'|'assistant'; content: string}> }
    const message = body.message?.trim()
    if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 })

    console.log('[AI Chat] Message:', message)
    console.log('[AI Chat] Context:', body.context)

    // Use AI if enabled, otherwise fall back to rule-based
    if (AI_ENABLED) {
      try {
        const aiResult = await aiExtractIntent(message, body.history || [])
        
        console.log('[AI Chat] AI Result:', JSON.stringify(aiResult, null, 2))
        
        // Convert AI result to our travel context
        const context: TravelContext = {
          ...body.context,
          origin: aiResult.origin ? resolveAirportCode(aiResult.origin) : body.context?.origin,
          destination: aiResult.destination ? resolveAirportCode(aiResult.destination) : body.context?.destination,
          departureDate: aiResult.departureDate || body.context?.departureDate,
          returnDate: aiResult.returnDate || body.context?.returnDate,
          checkIn: aiResult.checkIn || body.context?.checkIn,
          checkOut: aiResult.checkOut || body.context?.checkOut,
          guests: aiResult.guests || body.context?.guests,
          rooms: aiResult.rooms || body.context?.rooms,
          nights: aiResult.nights || body.context?.nights,
          budget: aiResult.budget || body.context?.budget,
          currency: aiResult.currency || body.context?.currency,
          hotelStars: aiResult.hotelStars || body.context?.hotelStars,
        }

        console.log('[AI Chat] Resolved Context:', context)

        // If AI says we need more info, ask for it
        if (aiResult.needsMoreInfo) {
          return NextResponse.json({
            intent: aiResult.intent,
            context,
            missing: aiResult.missingFields,
            message: aiResult.responseMessage,
          } satisfies TravelResponse)
        }

        // Otherwise, search based on intent
        if (aiResult.intent === 'hotel_search') {
          const live = await searchHotels(context)
          const fallback = travelConfig.mockEnabled && live.offers.length === 0 ? await mockTravelProvider.searchHotels(context) : []
          
          // If no live results, suggest best affiliate partner
          if (live.offers.length === 0 && fallback.length === 0) {
            const affiliate = generateAffiliateLink('hotels', {
              destination: context.destination,
              checkin: context.checkIn,
              checkout: context.checkOut,
              adults: context.guests,
              rooms: context.rooms,
            })

            if (affiliate) {
              return NextResponse.json({
                intent: 'hotel_search',
                context,
                source: 'affiliate',
                providerErrors: live.errors,
                message: `I can help you find the perfect hotel ${context.destination ? `in ${context.destination}` : ''}! Let me connect you with our trusted partner ${affiliate.provider}.`,
                affiliateLink: {
                  provider: affiliate.provider,
                  product: 'hotels',
                  text: `Search Hotels on ${affiliate.provider.charAt(0).toUpperCase() + affiliate.provider.slice(1)}`,
                  destination: context.destination,
                  checkin: context.checkIn,
                  checkout: context.checkOut,
                  adults: context.guests,
                  rooms: context.rooms,
                },
              } satisfies TravelResponse)
            }
          }
          
          return NextResponse.json({
            intent: 'hotel_search',
            context,
            source: live.offers.length ? 'live' : fallback.length ? 'mock' : 'unavailable',
            providerErrors: live.errors,
            message: live.offers.length 
              ? `I found ${live.offers.length} live hotel${live.offers.length > 1 ? 's' : ''} ${context.destination ? `in ${context.destination}` : ''}.` 
              : fallback.length 
              ? 'Here are development-only illustrative stays. Availability and pricing are not live.' 
              : 'No configured hotel provider returned results.',
            result: { kind: 'hotels', offers: [...live.offers, ...fallback] },
          } satisfies TravelResponse)
        }

        if (aiResult.intent === 'flight_search') {
          const live = await searchFlights(context)
          const fallback = travelConfig.mockEnabled && live.offers.length === 0 ? await mockTravelProvider.searchFlights(context) : []
          return NextResponse.json({
            intent: 'flight_search',
            context,
            source: live.offers.length ? 'live' : fallback.length ? 'mock' : 'unavailable',
            providerErrors: live.errors,
            message: live.offers.length 
              ? `I found ${live.offers.length} live flight option${live.offers.length > 1 ? 's' : ''} ${context.origin && context.destination ? `from ${context.origin} to ${context.destination}` : ''}.` 
              : fallback.length 
              ? 'Here are development-only illustrative flights. Availability and pricing are not live.' 
              : 'No configured flight provider returned results.',
            result: { kind: 'flights', offers: [...live.offers, ...fallback] },
          } satisfies TravelResponse)
        }

        // General response
        return NextResponse.json({
          intent: aiResult.intent as any,
          context,
          source: 'unavailable',
          message: aiResult.responseMessage,
        } satisfies TravelResponse)

      } catch (aiError) {
        console.error('[AI] Error, falling back to rule-based:', aiError)
        // Fall through to rule-based logic
      }
    }

    // Rule-based fallback (original logic)
    const intent = detectTravelIntent(message)
    const context = extractTravelContext(message, body.context)
    const missing = missingForIntent(intent, context)
    
    if (missing.length) return NextResponse.json({ intent, context, missing, message: `Absolutely. What ${missing[0]} are you planning?` } satisfies TravelResponse)
    
    if (intent === 'hotel_search' || intent === 'multi_product_search') { 
      const live = await searchHotels(context)
      const fallback = travelConfig.mockEnabled && live.offers.length === 0 ? await mockTravelProvider.searchHotels(context) : []
      
      // If no live results, suggest best affiliate partner
      if (live.offers.length === 0 && fallback.length === 0) {
        const affiliate = generateAffiliateLink('hotels', {
          destination: context.destination,
          checkin: context.checkIn,
          checkout: context.checkOut,
          adults: context.guests,
          rooms: context.rooms,
        })

        if (affiliate) {
          return NextResponse.json({
            intent,
            context,
            source: 'affiliate',
            providerErrors: live.errors,
            message: `I can help you find the perfect hotel ${context.destination ? `in ${context.destination}` : ''}! Let me connect you with our trusted partner ${affiliate.provider}.`,
            affiliateLink: {
              provider: affiliate.provider,
              product: 'hotels',
              text: `Search Hotels on ${affiliate.provider.charAt(0).toUpperCase() + affiliate.provider.slice(1)}`,
              destination: context.destination,
              checkin: context.checkIn,
              checkout: context.checkOut,
              adults: context.guests,
              rooms: context.rooms,
            },
          } satisfies TravelResponse)
        }
      }
      
      return NextResponse.json({ intent, context, source: live.offers.length ? 'live' : fallback.length ? 'mock' : 'unavailable', providerErrors: live.errors, message: live.offers.length ? `I found ${live.offers.length} live hotel options.` : fallback.length ? 'Here are development-only illustrative stays. Availability and pricing are not live.' : 'No configured hotel provider returned results.', result: { kind: 'hotels', offers: [...live.offers, ...fallback] } } satisfies TravelResponse) 
    }
    
    if (intent === 'flight_search') { 
      const live = await searchFlights(context)
      const fallback = travelConfig.mockEnabled && live.offers.length === 0 ? await mockTravelProvider.searchFlights(context) : []
      return NextResponse.json({ intent, context, source: live.offers.length ? 'live' : fallback.length ? 'mock' : 'unavailable', providerErrors: live.errors, message: live.offers.length ? `I found ${live.offers.length} live flight options.` : fallback.length ? 'Here are development-only illustrative flights. Availability and pricing are not live.' : 'No configured flight provider returned results.', result: { kind: 'flights', offers: [...live.offers, ...fallback] } } satisfies TravelResponse) 
    }
    
    if (intent === 'activity_search') { 
      const offers = travelConfig.mockEnabled ? await mockTravelProvider.searchActivities(context) : []
      
      // If no activities available, suggest best affiliate partner
      if (offers.length === 0) {
        const affiliate = generateAffiliateLink('tours', {
          destination: context.destination,
        })

        if (affiliate) {
          return NextResponse.json({ 
            intent, 
            context, 
            source: 'affiliate', 
            message: `I can help you find amazing tours and attractions ${context.destination ? `in ${context.destination}` : ''}! Let me connect you with our partner ${affiliate.provider}.`,
            affiliateLink: {
              provider: affiliate.provider as any,
              product: 'tours',
              text: `Browse Tours on ${affiliate.provider.charAt(0).toUpperCase() + affiliate.provider.slice(1)}`,
              destination: context.destination,
            },
          } satisfies TravelResponse)
        }
      }
      
      return NextResponse.json({ intent, context, source: offers.length ? 'mock' : 'unavailable', message: offers.length ? 'These are development-only illustrative experiences.' : 'Activities are not connected yet.', result: { kind: 'activities', offers } } satisfies TravelResponse) 
    }
    
    return NextResponse.json({ intent, context, source: 'unavailable', message: 'I can search configured flights and hotels, verify offers, and help plan itineraries. What would you like to arrange?' } satisfies TravelResponse)
  } catch (error) { 
    console.error('[v0] travel chat error', error)
    return NextResponse.json({ error: 'I could not complete that search right now.' }, { status: 500 }) 
  }
}
