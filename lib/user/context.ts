export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  initials: string
}

export interface UserTrip {
  id: string
  destination: string
  startDate: string
  endDate: string
  status: 'planning' | 'booked' | 'completed' | 'cancelled'
  nights: number
  image: string
}

export interface UserActivity {
  id: string
  type: 'hotel_booked' | 'flight_booked' | 'activity_booked' | 'itinerary_created'
  title: string
  description: string
  timestamp: string
  tripId?: string
}

export const mockUser: UserProfile = {
  id: 'user-001',
  name: 'Alex Chen',
  email: 'alex@example.com',
  avatar: 'A',
  initials: 'AC',
}

export const mockTrips: UserTrip[] = [
  { id: 'trip-1', destination: 'Rome', startDate: '2026-03-15', endDate: '2026-03-22', status: 'booked', nights: 7, image: '/images/rome-eden.png' },
  { id: 'trip-2', destination: 'Paris', startDate: '2026-05-10', endDate: '2026-05-17', status: 'planning', nights: 7, image: '/images/rome-hassler.png' },
  { id: 'trip-3', destination: 'Barcelona', startDate: '2026-07-01', endDate: '2026-07-08', status: 'planning', nights: 7, image: '/images/rome-colosseum.png' },
]

export const mockActivities: UserActivity[] = [
  { id: 'act-1', type: 'hotel_booked', title: 'Hotel Eden booked in Rome', description: 'Confirmed 4 nights at Hotel Eden, Rome', timestamp: '2026-02-10T14:30:00Z', tripId: 'trip-1' },
  { id: 'act-2', type: 'flight_booked', title: 'Flight Cairo → Rome booked', description: 'Round-trip flight on Egyptair, departing Mar 15', timestamp: '2026-02-08T09:15:00Z', tripId: 'trip-1' },
  { id: 'act-3', type: 'itinerary_created', title: '7-day Paris itinerary created', description: 'Classic Paris cultural tour planned', timestamp: '2026-02-05T16:45:00Z', tripId: 'trip-2' },
  { id: 'act-4', type: 'activity_booked', title: 'Louvre Museum tour booked', description: 'Guided 3-hour tour, May 12', timestamp: '2026-02-03T11:20:00Z', tripId: 'trip-2' },
]
