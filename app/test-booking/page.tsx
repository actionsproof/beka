'use client'

import { useState, useEffect } from 'react'
import { BookingModal } from '@/components/booking-modal'

export default function TestBookingPage() {
  const [flights, setFlights] = useState<any[]>([])
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [bookingConfirmed, setBookingConfirmed] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch flights on load
    fetch('/api/debug/search')
      .then(res => res.json())
      .then(data => {
        setFlights(data.sample || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading flights:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading flights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🧪 Booking System Test</h1>
        <p className="text-muted-foreground mb-8">
          Click any flight below to test the complete booking flow
        </p>

        {/* Flight Cards */}
        <div className="space-y-3">
          {flights.map((flight) => (
            <button
              key={flight.id}
              onClick={() => setSelectedFlight(flight)}
              className="w-full text-left flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 hover:border-primary hover:shadow-md transition-all"
            >
              <div>
                <p className="font-semibold">{flight.airline}</p>
                <p className="text-sm text-muted-foreground">
                  {flight.route} · {flight.stops} · {flight.duration}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">€{flight.price.amount}</p>
                <p className="text-xs text-muted-foreground">
                  {flight.departure} → {flight.arrival}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-xl bg-secondary p-6">
          <h3 className="font-semibold mb-2">📝 Test Instructions:</h3>
          <ol className="space-y-1 text-sm text-muted-foreground">
            <li>1. Click any flight above</li>
            <li>2. Fill in passenger details (any fake data)</li>
            <li>3. Use Stripe test card: <code className="bg-background px-2 py-1 rounded">4242 4242 4242 4242</code></li>
            <li>4. Expiry: 12/34, CVC: 123, Zip: 12345</li>
            <li>5. Click "Pay" button</li>
            <li>6. See confirmation with booking ID!</li>
          </ol>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedFlight && (
        <BookingModal
          offer={selectedFlight}
          onClose={() => setSelectedFlight(null)}
          onSuccess={(bookingId) => {
            setBookingConfirmed({ id: bookingId, offer: selectedFlight })
            setSelectedFlight(null)
          }}
        />
      )}

      {/* Confirmation Modal */}
      {bookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold">🎉 Booking Confirmed!</h2>
            <p className="mt-2 text-muted-foreground">
              Your flight booking has been successfully processed
            </p>
            <div className="mt-6 rounded-xl bg-secondary p-4 text-left">
              <p className="text-sm font-semibold">Booking Details</p>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>✅ Booking ID: <span className="font-mono">#{bookingConfirmed.id}</span></p>
                <p>✈️ Flight: {bookingConfirmed.offer.airline}</p>
                <p>🛫 Route: {bookingConfirmed.offer.route}</p>
                <p>💰 Amount: €{bookingConfirmed.offer.price.amount}</p>
                <p>🏢 Provider: {bookingConfirmed.offer.provider}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              ✉️ Confirmation email sent! Check your inbox.
            </p>
            <button
              onClick={() => setBookingConfirmed(null)}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Book Another Flight
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
