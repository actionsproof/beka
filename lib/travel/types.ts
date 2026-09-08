export type TravelIntent =
  | 'hotel_search'
  | 'flight_search'
  | 'activity_search'
  | 'trip_planning'
  | 'multi_product_search'
  | 'comparison'
  | 'booking'
  | 'cancellation'
  | 'general_travel'

export type FulfillmentMethod = 'api_booking' | 'hold' | 'redirect' | 'manual'
export type BookingState = 'searching' | 'price_check' | 'awaiting_payment' | 'payment_confirmed' | 'booking' | 'confirmed' | 'failed' | 'cancelled' | 'manual_review'

export interface Price { amount: number; currency: string }
export interface HotelOffer { id: string; type: 'hotel'; name: string; location: string; stars: number; rating: number; reviewCount: number; image: string; roomType: string; amenities: string[]; cancellation: string; price: Price; pricePerNight: number; provider: string; recommendation: string }
export interface FlightOffer { id: string; type: 'flight'; airline: string; route: string; departure: string; arrival: string; duration: string; stops: string; baggage: string; price: Price; provider: string }
export interface ActivityOffer { id: string; type: 'activity'; name: string; location: string; rating: number; duration: string; description: string; cancellation: string; image: string; price: Price; provider: string }
export interface TravelContext { origin?: string; destination?: string; departureDate?: string; returnDate?: string; guests?: number; rooms?: number; nights?: number; budget?: number; currency?: string; hotelStars?: number; tripType?: string; preferences?: string[] }
export interface ItineraryDay { day: number; city: string; title: string; description: string }
export interface TravelProvider { searchHotels(request: TravelContext): Promise<HotelOffer[]>; searchFlights(request: TravelContext): Promise<FlightOffer[]>; searchActivities(request: TravelContext): Promise<ActivityOffer[]>; checkAvailability(offerId: string): Promise<{ available: boolean }>; priceCheck(offerId: string): Promise<{ confirmed: boolean; price?: Price }>; createBooking(request: { offerId: string; context: TravelContext }): Promise<{ state: BookingState; reference?: string }> }
export type TravelResult = { kind: 'hotels'; offers: HotelOffer[] } | { kind: 'flights'; offers: FlightOffer[] } | { kind: 'activities'; offers: ActivityOffer[] } | { kind: 'itinerary'; destination: string; days: ItineraryDay[] } | { kind: 'comparison'; ids: string[] }
export interface TravelResponse { intent: TravelIntent; context: TravelContext; message: string; result?: TravelResult; missing?: string[] }
