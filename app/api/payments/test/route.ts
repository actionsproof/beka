import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function GET() {
  try {
    // Test creating a simple payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 33039, // €330.39
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    })
  } catch (error) {
    console.error('Stripe test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}
