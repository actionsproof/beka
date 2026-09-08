import 'server-only'
import type { FlightOffer, TravelProvider, TravelRequest, VerificationResult } from '../types'
import { travelConfig } from '../config'
import { fetchWithPolicy, ProviderError } from '../provider-utils'

export class DuffelProvider implements TravelProvider {
  name = 'Duffel'; capabilities = ['flight_search']
  private headers() { if (!process.env.DUFFEL_API_TOKEN) throw new ProviderError(this.name, 'NOT_CONFIGURED', 'Duffel is not configured'); return { Authorization: `Bearer ${process.env.DUFFEL_API_TOKEN}`, 'Content-Type': 'application/json', 'Duffel-Version': 'v2' } }
  async searchFlights(request: TravelRequest): Promise<FlightOffer[]> {
    if (!request.origin || !request.destination || !request.departureDate) throw new ProviderError(this.name, 'INVALID_REQUEST', 'Origin, destination, and departure date are required')
    if (!travelConfig.duffel.baseUrl) throw new ProviderError(this.name, 'NOT_CONFIGURED', 'Duffel API URL is not configured')
    const response = await fetchWithPolicy(`${travelConfig.duffel.baseUrl}/air/offer_requests`, { method: 'POST', headers: this.headers(), body: JSON.stringify({ data: { slices: [{ origin: request.origin, destination: request.destination, departure_date: request.departureDate }].concat(request.returnDate ? [{ origin: request.destination, destination: request.origin, departure_date: request.returnDate }] : []), passengers: Array.from({ length: request.passengerCount ?? request.guests ?? 1 }, () => ({ type: 'adult' })), cabin_class: request.cabin ?? 'economy', max_connections: request.connectionLimit } }) }, travelConfig.timeoutMs, travelConfig.retries, this.name)
    const json = await response.json() as { data?: { id?: string; expires_at?: string; offers?: Array<{ id: string; total_amount: string; total_currency: string; slices?: Array<{ segments?: Array<{ origin?: { iata_code?: string }; destination?: { iata_code?: string }; departing_at?: string; arriving_at?: string; marketing_carrier?: { name?: string }; operating_carrier?: { name?: string } }> }> }> } }
    return (json.data?.offers ?? []).map((offer) => { const segments = offer.slices?.flatMap((slice) => slice.segments ?? []) ?? []; const first = segments[0]; const last = segments.at(-1); const airline = first?.operating_carrier?.name ?? first?.marketing_carrier?.name ?? 'Airline'; return { id: offer.id, type: 'flight', airline, route: `${first?.origin?.iata_code ?? request.origin} → ${last?.destination?.iata_code ?? request.destination}`, departure: first?.departing_at ? new Date(first.departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBC', arrival: last?.arriving_at ? new Date(last.arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBC', duration: 'See itinerary', stops: `${Math.max(0, segments.length - 1)} stop(s)`, baggage: 'See fare conditions', price: { amount: Number(offer.total_amount), currency: offer.total_currency }, provider: this.name, providerMeta: { provider: this.name, offerId: offer.id, expiresAt: json.data?.expires_at, availability: 'available', capabilities: ['redirect'] } } satisfies FlightOffer })
  }
  async searchHotels() { return [] }
  async searchActivities() { return [] }
  async checkAvailability() { return { available: true } }
  async priceCheck(offerId: string): Promise<VerificationResult> { return { confirmed: false, reason: `Duffel offer ${offerId} must be re-fetched before purchase.` } }
  async createBooking() { return { state: 'pending' as const } }
}
