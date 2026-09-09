'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { X, Loader2 } from 'lucide-react'
import type { FlightOffer, HotelOffer } from '@/lib/travel/types'

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY

if (!stripePublicKey) {
  console.error('❌ NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set!')
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null

interface BookingModalProps {
  offer: FlightOffer | HotelOffer | null
  onClose: () => void
  onSuccess: (bookingId: number) => void
}

function CheckoutForm({ 
  offer, 
  onClose, 
  onSuccess,
  clientSecret,
}: BookingModalProps & { clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Passenger form data
  const [passengerData, setPassengerData] = useState({
    name: '',
    email: '',
    phone: '',
    passportOrId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !offer) return

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (stripeError) {
        setErrorMessage(stripeError.message || 'Payment failed')
        setIsProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // Save booking to database
        const response = await fetch('/api/bookings/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            offerData: offer,
            passengerData,
            userEmail: passengerData.email,
            userName: passengerData.name,
            userId: null, // TODO: Add auth integration
          }),
        })

        const data = await response.json()

        if (data.success) {
          onSuccess(data.booking.id)
        } else {
          setErrorMessage('Booking failed. Please contact support.')
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!offer) return null

  const isFlight = offer.type === 'flight'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Booking Summary */}
      <div className="rounded-xl bg-secondary p-4">
        <h3 className="font-semibold">
          {isFlight ? `✈️ Flight: ${(offer as FlightOffer).airline}` : `🏨 Hotel: ${(offer as HotelOffer).name}`}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isFlight 
            ? `${(offer as FlightOffer).route} · ${(offer as FlightOffer).departure} → ${(offer as FlightOffer).arrival}`
            : `${(offer as HotelOffer).location} · ${(offer as HotelOffer).roomType}`
          }
        </p>
        <p className="mt-2 text-lg font-bold">€{offer.price.amount}</p>
      </div>

      {/* Passenger Information */}
      <div className="space-y-3">
        <h3 className="font-semibold">Passenger Information</h3>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Full Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={passengerData.name}
            onChange={(e) => setPassengerData({ ...passengerData, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            id="email"
            type="email"
            required
            value={passengerData.email}
            onChange={(e) => setPassengerData({ ...passengerData, email: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number *
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={passengerData.phone}
            onChange={(e) => setPassengerData({ ...passengerData, phone: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="+1 234 567 8900"
          />
        </div>

        {isFlight && (
          <div>
            <label htmlFor="passport" className="block text-sm font-medium mb-1">
              Passport / ID Number *
            </label>
            <input
              id="passport"
              type="text"
              required
              value={passengerData.passportOrId}
              onChange={(e) => setPassengerData({ ...passengerData, passportOrId: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="A1234567"
            />
          </div>
        )}
      </div>

      {/* Payment Element */}
      <div className="space-y-3">
        <h3 className="font-semibold">Payment Details</h3>
        <PaymentElement />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-accent disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay €${offer.price.amount}`
          )}
        </button>
      </div>
    </form>
  )
}

export function BookingModal({ offer, onClose, onSuccess }: BookingModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create payment intent when modal opens
  useEffect(() => {
    if (offer) {
      fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: offer.price.amount,
          currency: offer.price.currency,
          offerType: offer.type,
          offerDetails: {
            id: offer.id,
            provider: offer.provider,
          },
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.clientSecret) {
            setClientSecret(data.clientSecret)
          } else {
            setError('Failed to initialize payment')
          }
        })
        .catch(() => setError('Failed to initialize payment'))
        .finally(() => setIsLoading(false))
    }
  }, [offer])

  if (!offer) return null

  const isFlight = offer.type === 'flight'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-card p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Complete Your Booking</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isFlight ? 'Flight' : 'Hotel'} booking with {offer.provider}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-accent"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
            {!stripePublicKey && (
              <p className="mt-2 text-xs">
                Missing Stripe public key. Restart dev server with: npm run dev
              </p>
            )}
          </div>
        )}

        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm 
              offer={offer} 
              onClose={onClose} 
              onSuccess={onSuccess}
              clientSecret={clientSecret}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
