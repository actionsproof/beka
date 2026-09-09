'use client'

import { ExternalLink, Hotel, Plane, Car, MapPin, Ticket } from 'lucide-react'
import { generateBookingComLink, getDestinationId } from '@/lib/affiliates/booking-com'
import type { AffiliateLink } from '@/lib/travel/types'

interface AffiliateLinkButtonProps {
  affiliateLink: AffiliateLink
}

const PRODUCT_ICONS = {
  hotels: Hotel,
  flights: Plane,
  cars: Car,
  taxis: MapPin,
  attractions: Ticket,
}

export default function AffiliateLinkButton({ affiliateLink }: AffiliateLinkButtonProps) {
  const Icon = PRODUCT_ICONS[affiliateLink.product]
  
  const handleClick = () => {
    const destinationId = affiliateLink.destination 
      ? getDestinationId(affiliateLink.destination) 
      : undefined

    const link = generateBookingComLink({
      product: affiliateLink.product,
      // Hotels
      city: affiliateLink.destination,
      destinationId,
      checkin: affiliateLink.checkin,
      checkout: affiliateLink.checkout,
      adults: affiliateLink.adults,
      rooms: affiliateLink.rooms,
      // Flights
      origin: affiliateLink.origin,
      destination: affiliateLink.destination,
      departureDate: affiliateLink.departureDate,
      returnDate: affiliateLink.returnDate,
      tripType: affiliateLink.returnDate ? 'round-trip' : 'one-way',
    })

    // Track the click
    fetch('/api/affiliates/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: affiliateLink.provider,
        product: affiliateLink.product,
        searchParams: {
          origin: affiliateLink.origin,
          destination: affiliateLink.destination,
          departureDate: affiliateLink.departureDate,
          returnDate: affiliateLink.returnDate,
          checkin: affiliateLink.checkin,
          checkout: affiliateLink.checkout,
          adults: affiliateLink.adults,
          rooms: affiliateLink.rooms,
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error)

    // Open in new tab
    window.open(link, '_blank')
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <button
        onClick={handleClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Icon className="w-5 h-5" />
        {affiliateLink.text}
        <ExternalLink className="w-5 h-5" />
      </button>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
        Powered by {affiliateLink.provider} • Secure booking • Best price guarantee
      </p>
    </div>
  )
}
