import { NextResponse } from 'next/server'
import { stripe, STRIPE_ACCOUNT_ID } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount, currency = 'eur', offerType, offerDetails } = body

    console.log('[Payment Intent] Request:', { amount, currency, offerType, offerDetails })

    if (!amount || amount <= 0) {
      console.error('[Payment Intent] Invalid amount:', amount)
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Create Stripe PaymentIntent
    const paymentIntentParams: any = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        offerType,
        offerDetails: JSON.stringify(offerDetails),
      },
    }

    // Add Stripe-Account header for organization keys
    const options: any = {}
    if (STRIPE_ACCOUNT_ID) {
      options.stripeAccount = STRIPE_ACCOUNT_ID
    }

    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentParams,
      options
    )

    console.log('[Payment Intent] Created:', paymentIntent.id)

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('[Payment Intent] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
