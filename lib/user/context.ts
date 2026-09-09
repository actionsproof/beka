// Re-export from new structure for backward compatibility
export { mockUser, mockActivities } from './mockData'
export type { UserProfile, UserActivity } from './types'

// Keep old interfaces for backward compatibility
export interface UserTrip {
  id: string
  destination: string
  startDate: string
  endDate: string
  status: 'planning' | 'booked' | 'completed' | 'cancelled'
  nights: number
  image: string
}

export const mockTrips: UserTrip[] = [
  { id: 'trip-1', destination: 'Rome', startDate: '2026-03-15', endDate: '2026-03-22', status: 'booked', nights: 7, image: '/images/rome-eden.png' },
  { id: 'trip-2', destination: 'Paris', startDate: '2026-05-10', endDate: '2026-05-17', status: 'planning', nights: 7, image: '/images/rome-hassler.png' },
  { id: 'trip-3', destination: 'Barcelona', startDate: '2026-07-01', endDate: '2026-07-08', status: 'planning', nights: 7, image: '/images/rome-colosseum.png' },
]
