import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { affiliateClicks } from '@/lib/db/schema'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { provider, product, hotelName, destination, price, currency } = body

    // Get user from JWT token (optional - works for logged in and anonymous users)
    let userId: number | null = null
    try {
      const token = request.cookies.get('auth-token')?.value
      if (token) {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET)
        userId = payload.userId as number
      }
    } catch (error) {
      // Anonymous user - that's fine
    }

    // Track the affiliate click in database
    const [click] = await db
      .insert(affiliateClicks)
      .values({
        userId,
        provider,
        product,
        destination: destination || null,
        hotelName: hotelName || null,
        price: price || null,
        currency: currency || 'EUR',
        clickedAt: new Date(),
      })
      .returning()

    return NextResponse.json({
      success: true,
      clickId: click.id,
      message: 'Affiliate click tracked',
    })
  } catch (error) {
    console.error('[Affiliate Track] Error:', error)
    return NextResponse.json(
      { error: 'Failed to track affiliate click' },
      { status: 500 }
    )
  }
}
