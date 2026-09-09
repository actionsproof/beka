import { NextResponse } from 'next/server'
import { db, bookings } from '@/lib/db'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      paymentIntentId,
      offerData,
      passengerData,
      userEmail,
      userName,
      userId,
    } = body

    // Validate required fields
    if (!paymentIntentId || !offerData || !passengerData || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Create booking in database
    const [booking] = await db.insert(bookings).values({
      userId: userId || null,
      userEmail,
      userName,
      type: offerData.type, // 'flight' or 'hotel'
      offerData,
      passengerData,
      stripePaymentIntentId: paymentIntentId,
      stripePaymentStatus: paymentIntent.status,
      totalAmount: paymentIntent.amount,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'confirmed',
      provider: offerData.provider,
      providerOfferId: offerData.id,
    }).returning()

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        type: booking.type,
      },
    })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
