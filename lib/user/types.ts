export interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  initials: string
  bio?: string
  preferences: UserPreferences
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  currency: 'USD' | 'EUR' | 'GBP' | 'EGP'
  language: 'en' | 'ar' | 'fr' | 'de' | 'it' | 'ru' | 'pl'
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  travelPreferences: {
    budget: 'economy' | 'standard' | 'premium' | 'luxury'
    accommodation: string[]
    activities: string[]
  }
}

export interface Booking {
  id: string
  type: 'flight' | 'hotel' | 'activity' | 'package'
  title: string
  description: string
  destination: string
  startDate: string
  endDate: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalAmount: number
  currency: string
  image: string
  confirmationCode?: string
  createdAt: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  currency: string
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  date: string
  description: string
  cardLast4?: string
}

export interface UserActivity {
  id: string
  type: 'booking_created' | 'booking_confirmed' | 'payment_completed' | 'profile_updated' | 'review_posted'
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}
