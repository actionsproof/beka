import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { bookings } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

async function getUserFromToken(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null

    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as { userId: number; email: string }
  } catch {
    return null
  }
}

// GET /api/bookings - Fetch user's bookings
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // optional filter: confirmed, pending, completed, cancelled

    let query = db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, user.userId))
      .orderBy(desc(bookings.createdAt))

    const userBookings = await query

    // Filter by status if provided
    const filtered = status && status !== 'all' 
      ? userBookings.filter(b => b.status === status)
      : userBookings

    return NextResponse.json({ bookings: filtered })
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      conversationId,
      bookingType,
      provider,
      providerBookingId,
      providerStatus,
      passengerDetails,
      bookingDetails,
      amount,
      currency,
      paymentIntentId,
      paymentStatus,
      affiliatePartner,
      affiliateClickId,
    } = body

    const [newBooking] = await db
      .insert(bookings)
      .values({
        userId: user.userId,
        conversationId: conversationId || null,
        bookingType: bookingType || 'flight',
        provider: provider || 'duffel',
        providerBookingId: providerBookingId || null,
        providerStatus: providerStatus || 'pending',
        passengerDetails: passengerDetails || {},
        bookingDetails: bookingDetails || {},
        amount: amount || '0',
        currency: currency || 'EUR',
        status: 'pending',
        paymentIntentId: paymentIntentId || null,
        paymentStatus: paymentStatus || 'pending',
        affiliatePartner: affiliatePartner || null,
        affiliateClickId: affiliateClickId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning()

    return NextResponse.json({ booking: newBooking })
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
