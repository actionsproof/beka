'use client'

import { ExternalLink } from 'lucide-react'
import { generateBookingComLink, getDestinationId } from '@/lib/affiliates/booking-com'
import type { AffiliateLink } from '@/lib/travel/types'

interface AffiliateLinkButtonProps {
  affiliateLink: AffiliateLink
}

export default function AffiliateLinkButton({ affiliateLink }: AffiliateLinkButtonProps) {
  const handleClick = () => {
    const destinationId = affiliateLink.destination 
      ? getDestinationId(affiliateLink.destination) 
      : undefined

    const link = generateBookingComLink({
      city: affiliateLink.destination,
      destinationId,
      checkin: affiliateLink.checkin,
      checkout: affiliateLink.checkout,
      adults: affiliateLink.adults,
      rooms: affiliateLink.rooms,
    })

    // Track the click
    fetch('/api/affiliates/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: affiliateLink.provider,
        searchParams: {
          destination: affiliateLink.destination,
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
        {affiliateLink.text}
        <ExternalLink className="w-5 h-5" />
      </button>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
        Powered by {affiliateLink.provider} • You'll be redirected to complete your booking securely
      </p>
    </div>
  )
}
