'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bell,
  Calendar,
  Camera,
  Check,
  CreditCard,
  Globe,
  Mail,
  MapPin,
  Phone,
  Settings,
  User,
  Wallet,
  X,
} from 'lucide-react'
import { mockUser, mockBookings, mockPayments, mockActivities } from '@/lib/user/mockData'
import type { UserProfile } from '@/lib/user/types'

type TabType = 'profile' | 'bookings' | 'payments' | 'settings'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    bio: user.bio || '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setUser({ ...user, avatar: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    setUser({
      ...user,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone,
      bio: editForm.bio,
      initials: editForm.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      bio: user.bio || '',
    })
    setIsEditing(false)
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'bookings' as const, label: 'Bookings', icon: Calendar },
    { id: 'payments' as const, label: 'Payments', icon: Wallet },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-500/10 text-green-600'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600'
      case 'cancelled':
      case 'failed':
        return 'bg-red-500/10 text-red-600'
      default:
        return 'bg-gray-500/10 text-gray-600'
    }
  }

  return (
    <main className="min-h-svh bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="size-4" />
            Back to BEKA
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-20 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground ring-2 ring-border">
                    {user.initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90"
                  aria-label="Change profile picture"
                >
                  <Camera className="size-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <nav className="mx-auto flex max-w-6xl gap-6 px-4 sm:px-6" aria-label="Profile sections">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
                      <User className="size-4 text-muted-foreground" />
                      <span>{user.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                      placeholder="+20 123 456 7890"
                    />
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <span>{user.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Preferred Currency</label>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <span>{user.preferences.currency}</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <div className="rounded-lg border border-border bg-background px-4 py-2">
                      <span>{user.bio || 'No bio provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Travel Preferences */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-bold">Travel Preferences</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-sm font-medium text-muted-foreground">Budget Level</label>
                  <div className="flex gap-2">
                    {['economy', 'standard', 'premium', 'luxury'].map((level) => (
                      <button
                        key={level}
                        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                          user.preferences.travelPreferences.budget === level
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-background hover:bg-accent'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-muted-foreground">Preferred Activities</label>
                  <div className="flex flex-wrap gap-2">
                    {user.preferences.travelPreferences.activities.map((activity) => (
                      <span
                        key={activity}
                        className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium capitalize"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-bold">Recent Activity</h2>
              <div className="space-y-3">
                {mockActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Check className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Bookings</h2>
              <select className="rounded-lg border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary">
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockBookings.map((booking) => (
                <article
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <img src={booking.image} alt={booking.title} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold">{booking.title}</h3>
                        <p className="text-xs text-muted-foreground">{booking.description}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-4" />
                        <span>{booking.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>
                          {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                          {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <p className="text-lg font-bold">
                          €{booking.totalAmount.toLocaleString()}
                        </p>
                        {booking.confirmationCode && (
                          <p className="text-xs text-muted-foreground">Code: {booking.confirmationCode}</p>
                        )}
                      </div>
                      <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Payment History</h2>
              <button className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent">
                Download Statement
              </button>
            </div>

            <div className="space-y-3">
              {mockPayments.map((payment) => {
                const booking = mockBookings.find((b) => b.id === payment.bookingId)
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-secondary">
                        <CreditCard className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{payment.description}</p>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                          {payment.cardLast4 && <span>••••{payment.cardLast4}</span>}
                          <span>
                            {new Date(payment.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        €{payment.amount.toLocaleString()}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold capitalize ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Payment Summary */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                <p className="mt-2 text-3xl font-bold">
                  €{mockPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                <p className="mt-2 text-3xl font-bold">
                  €{mockPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="mt-2 text-3xl font-bold">{mockBookings.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-bold">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive booking confirmations and updates via email</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUser({
                      ...user,
                      preferences: {
                        ...user.preferences,
                        notifications: {
                          ...user.preferences.notifications,
                          email: !user.preferences.notifications.email
                        }
                      }
                    })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      user.preferences.notifications.email ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        user.preferences.notifications.email ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">Get real-time alerts on your device</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUser({
                      ...user,
                      preferences: {
                        ...user.preferences,
                        notifications: {
                          ...user.preferences.notifications,
                          push: !user.preferences.notifications.push
                        }
                      }
                    })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      user.preferences.notifications.push ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        user.preferences.notifications.push ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="size-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">SMS Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUser({
                      ...user,
                      preferences: {
                        ...user.preferences,
                        notifications: {
                          ...user.preferences.notifications,
                          sms: !user.preferences.notifications.sms
                        }
                      }
                    })}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      user.preferences.notifications.sms ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        user.preferences.notifications.sms ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-6 text-xl font-bold">Account Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Language</label>
                  <select 
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
                    value={user.preferences.language}
                    onChange={(e) => setUser({
                      ...user,
                      preferences: {
                        ...user.preferences,
                        language: e.target.value as 'en' | 'ar' | 'fr' | 'de' | 'it' | 'ru' | 'pl'
                      }
                    })}
                  >
                    <option value="en">English</option>
                    <option value="ar">العربية (Arabic)</option>
                    <option value="fr">Français (French)</option>
                    <option value="de">Deutsch (German)</option>
                    <option value="it">Italiano (Italian)</option>
                    <option value="ru">Русский (Russian)</option>
                    <option value="pl">Polski (Polish)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">Currency</label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 outline-none focus:border-primary"
                    value={user.preferences.currency}
                    onChange={(e) => setUser({
                      ...user,
                      preferences: {
                        ...user.preferences,
                        currency: e.target.value as 'USD' | 'EUR' | 'GBP' | 'EGP'
                      }
                    })}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EGP">EGP - Egyptian Pound</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-card p-6">
              <h2 className="mb-4 text-xl font-bold text-red-600">Danger Zone</h2>
              <div className="space-y-3">
                <button className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-accent">
                  Change Password
                </button>
                <button className="w-full rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-500/20">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
