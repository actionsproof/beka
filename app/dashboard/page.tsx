'use client'

import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin, Plane } from 'lucide-react'
import Link from 'next/link'
import { mockUser, mockTrips, mockActivities } from '@/lib/user/context'

export default function DashboardPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="size-4" />
            Back to BEKA
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{mockUser.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{mockUser.email}</p>
            </div>
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              {mockUser.initials}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Upcoming Trips Section */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Your Upcoming Trips</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockTrips.filter(t => t.status !== 'completed').map(trip => (
              <article key={trip.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
                <img src={trip.image} alt={trip.destination} className="h-40 w-full object-cover" />
                <div className="flex flex-col gap-4 p-4">
                  <div>
                    <h3 className="text-lg font-bold">{trip.destination}</h3>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="size-4" />
                      {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      {trip.nights} nights
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trip.status === 'booked' && (
                      <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-600">
                        <CheckCircle className="size-3" />
                        Booked
                      </span>
                    )}
                    {trip.status === 'planning' && (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Planning
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Recent Activity Section */}
        <section>
          <h2 className="mb-6 text-2xl font-bold">Recent Activity</h2>
          <div className="space-y-3">
            {mockActivities.map(activity => {
              const trip = mockTrips.find(t => t.id === activity.tripId)
              const activityDate = new Date(activity.timestamp)
              const timeAgo = getTimeAgo(activityDate)

              let icon = <Plane className="size-4 text-primary" />
              if (activity.type === 'hotel_booked') icon = <MapPin className="size-4 text-primary" />
              if (activity.type === 'itinerary_created') icon = <Calendar className="size-4 text-primary" />

              return (
                <div key={activity.id} className="flex gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        {trip && (
                          <p className="mt-1 text-xs text-primary font-medium">{trip.destination} trip</p>
                        )}
                      </div>
                      <p className="whitespace-nowrap text-xs text-muted-foreground">{timeAgo}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
