'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowUp,
  Check,
  Compass,
  File,
  Globe2,
  Image as ImageIcon,
  Menu,
  MessageSquarePlus,
  Paperclip,
  Plane,
  Search,
  Send,
  Sparkles,
  Sun,
  User,
  X,
} from 'lucide-react'
import type { HotelOffer, TravelContext, TravelResponse, TravelResult } from '@/lib/travel/types'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSelector } from '@/components/language-selector'
import { BookingModal } from '@/components/booking-modal'
import { useTranslation } from '@/lib/i18n'

interface AttachedFile {
  file: File
  preview?: string
  id: string
}

interface Message {
  role: 'user' | 'assistant'
  text: string
  result?: TravelResult
  attachments?: AttachedFile[]
}

interface UserData {
  id: number
  name: string
  email: string
  initials: string
}

interface Conversation {
  id: number
  title: string
  updatedAt: string
  messages?: Message[]
  context?: TravelContext
}

const logoUrl =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20and%20Orange%20Simple%20Travel%20Agency%20Logo-IycmdZUw0OtRWItkpg7ao73GHSQsNf.png'

// Removed: fake starter chats - now using real user conversations from database

function getSuggestions(t: (key: string) => string) {
  return [
    { icon: 'plane', title: t('home.suggestions.findFlights'), prompt: t('home.suggestions.findFlightsPrompt') },
    { icon: 'plane', title: 'Book flight to New York', prompt: 'Find flights from Cairo to New York next month' },
    { icon: 'plane', title: 'Search round-trip to Tokyo', prompt: 'Find round-trip flights to Tokyo for 2 passengers' },
    { icon: 'plane', title: 'Find flights to Paris', prompt: 'Search flights from London to Paris tomorrow' },
  ]
}

function Icon({ type }: { type: string }) {
  const props = { 'aria-hidden': true, className: 'size-4' }
  if (type === 'sun') return <Sun {...props} />
  if (type === 'compass') return <Compass {...props} />
  if (type === 'plane') return <Plane {...props} />
  return <Globe2 {...props} />
}

function HotelCard({ offer, onSelect, t }: { offer: HotelOffer; onSelect: (offer: HotelOffer) => void; t: (key: string) => string }) {
  // Check if this is an affiliate hotel (has deepLink from Booking.com)
  const isAffiliateOffer = offer.providerMeta?.deepLink
  
  const handleClick = async () => {
    if (isAffiliateOffer) {
      // Track affiliate click and open Booking.com
      try {
        await fetch('/api/affiliate/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: offer.provider,
            product: 'hotel',
            hotelName: offer.name,
            destination: offer.location,
            price: offer.price.amount,
            currency: offer.price.currency,
          }),
        })
      } catch (error) {
        console.error('Failed to track affiliate click:', error)
      }
      
      // Open Booking.com in new tab
      window.open(offer.providerMeta.deepLink, '_blank')
    } else {
      // Open booking modal for direct bookings (Duffel, Wink, etc)
      onSelect(offer)
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <img src={offer.image} alt={`${offer.name} exterior`} className="h-36 w-full object-cover" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{offer.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {'★'.repeat(offer.stars)} · {offer.location}
            </p>
          </div>
          <span className="rounded-lg bg-secondary px-2 py-1 text-xs font-semibold">{offer.rating}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {offer.roomType} · {offer.amenities.slice(0, 2).join(' · ')}
        </p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-lg font-bold">€{offer.price.amount}</p>
            <p className="text-[11px] text-muted-foreground">
              €{offer.pricePerNight}/night · {offer.cancellation}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClick}
            className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
          >
            {isAffiliateOffer ? 'View on Booking.com' : t('common.viewDetails')}
          </button>
        </div>
      </div>
    </article>
  )
}

function TravelResultCard({ result, onSelect, t }: { result?: TravelResult; onSelect: (offer: HotelOffer) => void; t: (key: string) => string }) {
  if (!result) return null
  if (result.kind === 'hotels')
    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {result.offers.map((offer) => (
          <HotelCard key={offer.id} offer={offer} onSelect={onSelect} t={t} />
        ))}
      </div>
    )
  if (result.kind === 'flights')
    return (
      <div className="mt-4 flex flex-col gap-2">
        {result.offers.map((offer) => (
          <button
            key={offer.id}
            onClick={() => onSelect(offer as any)}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all hover:border-primary hover:shadow-md"
          >
            <div>
              <p className="font-semibold">{offer.airline}</p>
              <p className="text-sm text-muted-foreground">
                {offer.route} · {offer.stops} · {offer.duration}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">€{offer.price.amount}</p>
              <p className="text-xs text-muted-foreground">
                {offer.departure} → {offer.arrival}
              </p>
            </div>
          </button>
        ))}
      </div>
    )
  if (result.kind === 'activities')
    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {result.offers.map((offer) => (
          <article key={offer.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img src={offer.image} alt={offer.name} className="h-32 w-full object-cover" />
            <div className="p-4">
              <h3 className="font-semibold">{offer.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {offer.rating} rating · {offer.duration}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{offer.description}</p>
              <p className="mt-3 font-bold">€{offer.price.amount}</p>
            </div>
          </article>
        ))}
      </div>
    )
  if (result.kind === 'itinerary')
    return (
      <div className="mt-4 flex flex-col gap-2">
        {result.days.map((day) => (
          <div key={day.day} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
              {day.day}
            </div>
            <div>
              <p className="font-semibold">
                {day.city} · {day.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{day.description}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" className="text-xs font-semibold text-primary">
                  Find hotel
                </button>
                <button type="button" className="text-xs font-semibold text-primary">
                  Find activities
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  return null
}

function AttachmentPreview({ attachments, onRemove }: { attachments: AttachedFile[]; onRemove: (id: string) => void }) {
  if (attachments.length === 0) return null
  
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {attachments.map((file) => (
        <div
          key={file.id}
          className="relative flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-3 py-2"
        >
          {file.preview ? (
            <img src={file.preview} alt={file.file.name} className="size-8 rounded object-cover" />
          ) : (
            <File className="size-4 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{file.file.name}</p>
            <p className="text-[10px] text-muted-foreground">
              {(file.file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="rounded-lg p-1 hover:bg-accent"
            aria-label="Remove file"
          >
            <X className="size-3" />
          </button>
        </div>
      ))}
    </div>
  )
}

function MessageAttachments({ attachments }: { attachments?: AttachedFile[] }) {
  if (!attachments || attachments.length === 0) return null
  
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-2 rounded-xl border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-2"
        >
          {file.preview ? (
            <img src={file.preview} alt={file.file.name} className="size-8 rounded object-cover" />
          ) : (
            <File className="size-4" />
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{file.file.name}</p>
            <p className="text-[10px] opacity-80">{(file.file.size / 1024).toFixed(1)} KB</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Page() {
  const { t, locale } = useTranslation()
  const suggestions = getSuggestions(t)
  const isRTL = locale === 'ar'
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [context, setContext] = useState<TravelContext>({})
  const [isThinking, setIsThinking] = useState(false)
  const [selected, setSelected] = useState<HotelOffer | any | null>(null)
  const [bookingConfirmed, setBookingConfirmed] = useState<{ id: number; offer: any } | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [user, setUser] = useState<UserData | null>(null)
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch current user on mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      }
    }
    fetchUser()
  }, [])

  // Fetch user's recent conversations
  useEffect(() => {
    async function fetchConversations() {
      try {
        const response = await fetch('/api/conversations')
        if (response.ok) {
          const data = await response.json()
          setRecentConversations(data.conversations || [])
          
          // If user has an active conversation, load it
          if (data.conversations.length > 0 && messages.length === 0 && !currentConversationId) {
            const latestConversation = data.conversations[0]
            console.log('[Loading conversation]', latestConversation.id, latestConversation.messages.length)
            setCurrentConversationId(latestConversation.id)
            setMessages(latestConversation.messages || [])
            setContext(latestConversation.context || {})
          }
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error)
      }
    }
    if (user) {
      fetchConversations()
    }
  }, [user])

  // Auto-save conversation whenever messages change (debounced)
  useEffect(() => {
    if (!user || messages.length === 0) return

    const timeoutId = setTimeout(async () => {
      try {
        const conversationTitle = currentConversationId
          ? recentConversations.find(c => c.id === currentConversationId)?.title
          : messages[0]?.text?.slice(0, 50) || 'New conversation'
        
        console.log('[Auto-saving conversation]', {
          conversationId: currentConversationId,
          messagesCount: messages.length,
          title: conversationTitle
        })
        
        const saveResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: currentConversationId,
            title: conversationTitle,
            messages: messages,
            context: context
          }),
        })
        
        if (saveResponse.ok) {
          const { conversation } = await saveResponse.json()
          console.log('[Conversation saved]', conversation.id)
          
          if (!currentConversationId) {
            setCurrentConversationId(conversation.id)
            setRecentConversations(prev => [conversation, ...prev])
          } else {
            // Update the conversation in the list
            setRecentConversations(prev => 
              prev.map(c => c.id === conversation.id ? conversation : c)
            )
          }
        } else {
          console.error('[Save failed]', await saveResponse.text())
        }
      } catch (error) {
        console.error('[Auto-save error]', error)
      }
    }, 1000) // Debounce 1 second

    return () => clearTimeout(timeoutId)
  }, [messages, user, currentConversationId, context])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const newFiles: AttachedFile[] = Array.from(files).map((file) => {
      const id = Math.random().toString(36).substring(7)
      const attached: AttachedFile = { file, id }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setAttachedFiles((current) =>
            current.map((f) => (f.id === id ? { ...f, preview: reader.result as string } : f))
          )
        }
        reader.readAsDataURL(file)
      }

      return attached
    })

    setAttachedFiles((current) => [...current, ...newFiles])

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (id: string) => {
    setAttachedFiles((current) => current.filter((f) => f.id !== id))
  }

  const handleAttachClick = () => {
    fileInputRef.current?.click()
  }

  async function sendMessage(value = input) {
    const trimmed = value.trim()
    if ((!trimmed && attachedFiles.length === 0) || isThinking) return

    const userMessage: Message = {
      role: 'user',
      text: trimmed || 'Shared files',
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    }

    setMessages((current) => [...current, userMessage])
    setInput('')
    setAttachedFiles([])
    setIsThinking(true)

    try {
      // Build conversation history for AI context
      const history = messages.map(msg => ({
        role: msg.role,
        content: msg.text
      }))

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: trimmed, 
          context,
          history
        }),
      })
      const data = (await response.json()) as TravelResponse
      setContext(data.context ?? context)
      
      const assistantMessage = {
        role: 'assistant' as const,
        text: data.message,
        result: data.result,
      }
      
      setMessages((current) => [...current, assistantMessage])
    } catch (error) {
      console.error('AI chat error:', error)
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: 'I could not complete that search right now. Let me try another option.',
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <main className={`flex min-h-svh bg-background text-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
      <aside
        className={`fixed inset-y-0 z-20 flex w-[280px] flex-col border-border bg-sidebar px-3 py-4 transition-all duration-200 lg:static lg:translate-x-0 ${
          isRTL ? 'right-0 border-l' : 'left-0 border-r'
        } ${
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        } ${sidebarCollapsed ? (isRTL ? 'lg:mr-[-280px]' : 'lg:-ml-[280px]') : isRTL ? 'lg:mr-0' : 'lg:ml-0'}`}
      >
        <div className="flex items-center justify-between px-2 pb-5">
          <a href="#" className="flex items-center gap-2" aria-label="BEKA home">
            <img
              src={logoUrl}
              alt="BEKA — Your AI Travel Agent"
              className="h-10 w-16 object-contain object-top"
            />
            <span className="font-mono text-sm font-bold tracking-[0.22em]">BEKA</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(false)
            }}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
            aria-label={t('nav.hideNav')}
          >
            <X className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setMessages([])
            setContext({})
            setCurrentConversationId(null)
            setSidebarOpen(false)
          }}
          className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium shadow-sm hover:bg-accent"
        >
          <MessageSquarePlus className="size-4 text-primary" /> {t('nav.newChat')}{' '}
          <span className={`text-xs text-muted-foreground ${isRTL ? 'mr-auto' : 'ml-auto'}`}>⌘ K</span>
        </button>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Main navigation" suppressHydrationWarning>
          <a className="flex items-center gap-3 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium" href="#">
            <Sparkles className="size-4 text-primary" /> {t('nav.askBeka')}
          </a>
          <a
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            href="#explore"
          >
            <Compass className="size-4" /> {t('nav.explore')}
          </a>
          <a
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            href="#trips"
          >
            <Plane className="size-4" /> {t('nav.myTrips')}
          </a>
        </nav>
        <div className="mt-8 flex flex-col gap-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t('nav.recentChats')}
          </p>
          {recentConversations.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground/60">
              {user ? 'No conversations yet' : 'Sign in to see your chats'}
            </p>
          ) : (
            recentConversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                onClick={() => {
                  // Load conversation messages
                  setCurrentConversationId(conv.id)
                  setMessages(conv.messages || [])
                  setContext(conv.context || {})
                  setSidebarOpen(false)
                }}
                className={`truncate rounded-xl px-3 py-2 text-left text-sm hover:bg-accent hover:text-foreground ${
                  currentConversationId === conv.id 
                    ? 'bg-accent text-foreground font-medium' 
                    : 'text-muted-foreground'
                }`}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>
        <div className="mt-auto rounded-2xl border border-border bg-background p-3">
          <p className="text-xs font-semibold">{t('home.tagline')}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {t('home.mockNotice')}
          </p>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-10 bg-foreground/20 lg:hidden"
        />
      )}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className={`flex h-16 items-center border-b border-border px-4 sm:px-6 ${isRTL ? 'flex-row-reverse' : 'justify-between'}`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSidebarOpen(true)
                setSidebarCollapsed(false)
              }}
              className="rounded-lg p-2 hover:bg-accent"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold tracking-[0.18em]">{t('nav.askBeka')}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                {t('home.travelAI')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
              aria-label={t('nav.searchChats')}
            >
              <Search className="size-4" />
            </button>
            <ThemeToggle />
            <LanguageSelector />
            <div className={`relative ${isRTL ? 'mr-2' : 'ml-2'}`} ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                aria-label="Open user menu"
                aria-expanded={profileOpen}
              >
                {user ? user.initials : <User className="size-4" />}
              </button>
              {profileOpen && (
                <div className={`absolute mt-2 w-48 rounded-xl border border-border bg-card shadow-lg z-50 ${
                  isRTL ? 'right-0' : 'right-0'
                }`}>
                  <div className="flex flex-col">
                    {user ? (
                      <>
                        <div className="border-b border-border px-4 py-3">
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Link
                          href="/profile"
                          className="px-4 py-2.5 text-sm font-medium hover:bg-accent flex items-center gap-2 transition-colors border-b border-border"
                          onClick={() => setProfileOpen(false)}
                        >
                          <User className="size-4" />
                          {t('nav.profileSettings')}
                        </Link>
                        <Link
                          href="/profile?tab=bookings"
                          className="px-4 py-2.5 text-sm font-medium hover:bg-accent flex items-center gap-2 transition-colors border-b border-border"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Compass className="size-4" />
                          {t('nav.myBookings')}
                        </Link>
                        <button
                          onClick={async () => {
                            await fetch('/api/auth/logout', { method: 'POST' })
                            setUser(null)
                            setProfileOpen(false)
                            setMessages([])
                            setRecentConversations([])
                          }}
                          className="px-4 py-2.5 text-sm font-medium hover:bg-accent rounded-b-xl text-left text-red-600"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setProfileOpen(false)}
                          className="px-4 py-2.5 text-sm font-medium hover:bg-accent rounded-t-xl text-left border-b border-border block"
                        >
                          Sign In
                        </Link>
                        <Link
                          href="/signup"
                          onClick={() => setProfileOpen(false)}
                          className="px-4 py-2.5 text-sm font-medium hover:bg-accent rounded-b-xl text-left block"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pb-36 pt-10 sm:px-8">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center pb-10 text-center">
                <img src={logoUrl} alt="BEKA" className="mb-5 h-28 w-48 object-contain object-top" />
                <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">{t('home.title')}</h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                  {t('home.subtitle')}
                </p>
                <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2" suppressHydrationWarning>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.title}
                      type="button"
                      onClick={() => sendMessage(suggestion.prompt)}
                      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left hover:border-primary/40 hover:bg-accent"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <Icon type={suggestion.icon} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{suggestion.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{suggestion.prompt}</span>
                      </span>
                      <ArrowUp className={`size-4 rotate-45 text-muted-foreground opacity-0 group-hover:opacity-100 ${
                        isRTL ? 'mr-auto' : 'ml-auto'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex gap-3 ${
                      message.role === 'user' 
                        ? (isRTL ? 'justify-start' : 'justify-end')
                        : (isRTL ? 'justify-end' : 'justify-start')
                    }`}
                  >
                    <div
                      className={`max-w-full ${
                        message.role === 'user'
                          ? `rounded-2xl bg-primary px-4 py-3 text-primary-foreground sm:max-w-[80%] ${
                              isRTL ? 'rounded-bl-md' : 'rounded-br-md'
                            }`
                          : 'flex w-full gap-3'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                          <Sparkles className="size-3.5 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-7">{message.text}</p>
                        <MessageAttachments attachments={message.attachments} />
                        <TravelResultCard result={message.result} onSelect={setSelected} t={t} />
                      </div>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex size-7 items-center justify-center rounded-full bg-secondary">
                      <Sparkles className="size-3.5 text-primary" />
                    </div>
                    <span className="thinking-dots">{t('home.thinking')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div
            className={`fixed inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 pt-10 sm:px-8 ${
              sidebarCollapsed ? 'lg:left-0 lg:right-0' : isRTL ? 'lg:right-[280px] lg:left-0' : 'lg:left-[280px] lg:right-0'
            }`}
          >
            <form onSubmit={(event) => { event.preventDefault(); sendMessage() }} className="mx-auto max-w-4xl">
              <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card shadow-lg shadow-foreground/5 focus-within:border-primary/50">
                <AttachmentPreview attachments={attachedFiles} onRemove={removeFile} />
                <div className="flex items-end gap-2 p-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    className="hidden"
                    aria-label="File upload"
                  />
                  <button
                    type="button"
                    onClick={handleAttachClick}
                    className="mb-0.5 rounded-xl p-2.5 text-muted-foreground hover:bg-accent transition-colors"
                    aria-label={t('home.attachFile')}
                  >
                    <Paperclip className="size-4" />
                  </button>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('home.placeholder')}
                    rows={1}
                    className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                    aria-label={t('home.messageLabel')}
                  />
                  <button
                    type="submit"
                    disabled={(!input.trim() && attachedFiles.length === 0) || isThinking}
                    className="mb-0.5 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity"
                    aria-label={t('home.sendMessage')}
                  >
                    <Send className="size-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {t('home.disclaimer')}
              </p>
            </form>
          </div>
        </div>
      </section>
      {/* Booking Modal */}
      {selected && (
        <BookingModal
          offer={selected}
          onClose={() => setSelected(null)}
          onSuccess={(bookingId) => {
            setBookingConfirmed({ id: bookingId, offer: selected })
            setSelected(null)
          }}
        />
      )}

      {/* Confirmation Modal */}
      {bookingConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <Check className="size-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
            <p className="mt-2 text-muted-foreground">
              Your booking has been successfully processed
            </p>
            <div className="mt-6 rounded-xl bg-secondary p-4 text-left">
              <p className="text-sm font-semibold">Booking Details</p>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                <p>Booking ID: <span className="font-mono">#{bookingConfirmed.id}</span></p>
                <p>Type: {bookingConfirmed.offer.type === 'flight' ? '✈️ Flight' : '🏨 Hotel'}</p>
                <p>Provider: {bookingConfirmed.offer.provider}</p>
                <p>Amount: €{bookingConfirmed.offer.price.amount}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              A confirmation email has been sent to your email address
            </p>
            <button
              onClick={() => setBookingConfirmed(null)}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
