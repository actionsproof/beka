import { NextResponse } from 'next/server'
import { searchFlights } from '@/lib/travel/registry'
import { resolveAirportCode } from '@/lib/travel/airport-codes'

export async function GET() {
  try {
    // Test with hardcoded values
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const departureDate = tomorrow.toISOString().split('T')[0]

    const testRequest = {
      origin: resolveAirportCode('Cairo'),
      destination: resolveAirportCode('Rome'),
      departureDate,
    }

    console.log('🧪 Test search:', testRequest)

    const result = await searchFlights(testRequest)

    return NextResponse.json({
      testRequest,
      offersFound: result.offers.length,
      errors: result.errors,
      sample: result.offers.slice(0, 3),
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
