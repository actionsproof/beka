import type { ActivityOffer, FlightOffer, HotelOffer, TravelContext, TravelProvider } from './types'

const romeHotels: HotelOffer[] = [
  { id: 'rome-eden', type: 'hotel', name: 'Hotel Eden Rome', location: 'Spanish Steps, Rome', stars: 5, rating: 4.8, reviewCount: 2184, image: '/images/rome-eden.png', roomType: 'Deluxe city view', amenities: ['Breakfast included', 'Rooftop terrace', 'Free cancellation'], cancellation: 'Free cancellation until 18 Sep', price: { amount: 548, currency: 'EUR' }, pricePerNight: 137, provider: 'BEKA mock provider', recommendation: 'Best overall value for your budget and location.' },
  { id: 'rome-hassler', type: 'hotel', name: 'Hotel Hassler Roma', location: 'Trinità dei Monti, Rome', stars: 5, rating: 4.7, reviewCount: 1642, image: '/images/rome-hassler.png', roomType: 'Classic king room', amenities: ['Breakfast included', 'Spa', 'Central location'], cancellation: 'Free cancellation until 17 Sep', price: { amount: 592, currency: 'EUR' }, pricePerNight: 148, provider: 'BEKA mock provider', recommendation: 'Strongest location for first-time visitors.' },
  { id: 'rome-hoxton', type: 'hotel', name: 'The Hoxton, Rome', location: 'Parioli, Rome', stars: 4, rating: 4.6, reviewCount: 987, image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80', roomType: 'Cosy double', amenities: ['Wi-Fi included', 'Restaurant', 'Late checkout'], cancellation: 'Free cancellation until 19 Sep', price: { amount: 436, currency: 'EUR' }, pricePerNight: 109, provider: 'BEKA mock provider', recommendation: 'Best price while keeping a polished stay.' },
]

const flights: FlightOffer[] = [
  { id: 'egyptair-101', type: 'flight', airline: 'EgyptAir', route: 'Cairo → Rome', departure: '08:15', arrival: '12:10', duration: '3h 55m', stops: 'Nonstop', baggage: '1 checked bag', price: { amount: 286, currency: 'EUR' }, provider: 'BEKA mock provider' },
  { id: 'ita-204', type: 'flight', airline: 'ITA Airways', route: 'Cairo → Rome', departure: '16:40', arrival: '20:35', duration: '3h 55m', stops: 'Nonstop', baggage: '1 checked bag', price: { amount: 312, currency: 'EUR' }, provider: 'BEKA mock provider' },
]

const activities: ActivityOffer[] = [
  { id: 'colosseum', type: 'activity', name: 'Colosseum Underground Tour', location: 'Rome', rating: 4.9, duration: '3 hours', description: 'A small-group tour through the arena floor and ancient tunnels.', cancellation: 'Free cancellation 24 hours before', image: '/images/rome-colosseum.png', price: { amount: 54, currency: 'EUR' }, provider: 'BEKA mock provider' },
  { id: 'pasta', type: 'activity', name: 'Fresh Pasta with a Roman Nonna', location: 'Rome', rating: 4.8, duration: '2.5 hours', description: 'Learn the craft of handmade pasta in a welcoming local kitchen.', cancellation: 'Free cancellation 48 hours before', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80', price: { amount: 72, currency: 'EUR' }, provider: 'BEKA mock provider' },
]

export class MockTravelProvider implements TravelProvider {
  name = 'BEKA mock provider'
  capabilities = ['hotel_search', 'flight_search', 'activity_search']
  // Development-only provider. Results are illustrative and never represent live inventory.
  async searchHotels(request: TravelContext) { const max = request.budget ?? Infinity; return romeHotels.filter((hotel) => hotel.price.amount <= max && (!request.hotelStars || hotel.stars >= request.hotelStars)) }
  async searchFlights() { return flights }
  async searchActivities() { return activities }
  async checkAvailability() { return { available: true } }
  async priceCheck(offerId: string) { return { confirmed: false, price: undefined } }
  async createBooking() { return { state: 'manual_review' as const } }
}

export const mockTravelProvider = new MockTravelProvider()
