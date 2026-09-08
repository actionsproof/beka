'use client'

import { useState } from 'react'
import {
  ArrowUp,
  Compass,
  Globe2,
  Menu,
  MessageSquarePlus,
  Paperclip,
  Plane,
  Plus,
  Search,
  Send,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Black%20and%20Orange%20Simple%20Travel%20Agency%20Logo-IycmdZUw0OtRWItkpg7ao73GHSQsNf.png'

const suggestions = [
  { icon: 'sun', title: 'Plan a beach escape', prompt: 'Plan a warm beach escape for 5 days in November' },
  { icon: 'compass', title: 'Find hidden gems', prompt: 'Find me a less touristy European city for a long weekend' },
  { icon: 'plane', title: 'Build an itinerary', prompt: 'Build a 7-day itinerary for Japan with food and culture' },
  { icon: 'globe', title: 'Compare destinations', prompt: 'Compare Lisbon, Athens, and Palermo for a summer trip' },
]

const starterChats = [
  'Summer in Italy',
  'Japan food tour',
  'Weekend in Marrakech',
]

function SuggestionIcon({ type }: { type: string }) {
  const props = { 'aria-hidden': true, className: 'size-4' }
  if (type === 'sun') return <Sun {...props} />
  if (type === 'compass') return <Compass {...props} />
  if (type === 'plane') return <Plane {...props} />
  return <Globe2 {...props} />
}

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([])
  const [isThinking, setIsThinking] = useState(false)

  function sendMessage(value = input) {
    const trimmed = value.trim()
    if (!trimmed || isThinking) return
    setMessages((current) => [...current, { role: 'user', text: trimmed }])
    setInput('')
    setIsThinking(true)
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: `I\'ll help you shape that trip. For “${trimmed}”, I\'d start by balancing the season, your travel pace, and the kind of moments you want to remember. Tell me your dates, budget, and who\'s coming along, and I\'ll turn it into a considered itinerary.`,
        },
      ])
      setIsThinking(false)
    }, 700)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <main className="flex min-h-svh bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-20 flex w-[280px] flex-col border-r border-border bg-sidebar px-3 py-4 transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2 pb-5">
          <a href="#" className="flex items-center gap-2" aria-label="BEKA home">
            <img src={logoUrl} alt="BEKA — Your AI Travel Agent" className="h-10 w-16 object-contain object-top" />
            <span className="font-mono text-sm font-bold tracking-[0.22em]">BEKA</span>
          </a>
          <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden" aria-label="Close navigation"><X className="size-4" /></button>
        </div>
        <button type="button" onClick={() => { setMessages([]); setSidebarOpen(false) }} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-medium shadow-sm hover:bg-accent">
          <MessageSquarePlus className="size-4 text-primary" /> New chat <span className="ml-auto text-xs text-muted-foreground">⌘ K</span>
        </button>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Main navigation">
          <a className="flex items-center gap-3 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium" href="#"><Sparkles className="size-4 text-primary" /> Ask BEKA</a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" href="#"><Compass className="size-4" /> Explore</a>
          <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" href="#"><Plane className="size-4" /> My trips</a>
        </nav>
        <div className="mt-8 flex flex-col gap-2">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recent chats</p>
          {starterChats.map((chat) => <button key={chat} type="button" onClick={() => setInput(`Continue planning ${chat}`)} className="truncate rounded-xl px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground">{chat}</button>)}
        </div>
        <div className="mt-auto rounded-2xl border border-border bg-background p-3">
          <p className="text-xs font-semibold">Travel, thoughtfully planned.</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">BEKA helps you move from a blank page to a trip that feels like yours.</p>
        </div>
      </aside>

      {sidebarOpen && <button type="button" aria-label="Close navigation overlay" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-10 bg-foreground/20 lg:hidden" />}

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-accent lg:hidden" aria-label="Open navigation"><Menu className="size-5" /></button>
            <div className="flex items-center gap-2"><span className="font-mono text-sm font-bold tracking-[0.18em]">Ask BEKA</span><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Travel AI</span></div>
          </div>
          <div className="flex items-center gap-1"><button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Search chats"><Search className="size-4" /></button><button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Toggle theme"><Sun className="size-4" /></button><div className="ml-2 flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">A</div></div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-36 pt-10 sm:px-8">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center pb-10 text-center">
                <img src={logoUrl} alt="BEKA" className="mb-5 h-28 w-48 object-contain object-top" />
                <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">Where will you go?</h1>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Your AI travel agent for ideas, itineraries, and the little details that make a trip yours.</p>
                <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                  {suggestions.map((suggestion) => <button key={suggestion.title} type="button" onClick={() => sendMessage(suggestion.prompt)} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-colors hover:border-primary/40 hover:bg-accent"><span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><SuggestionIcon type={suggestion.icon} /></span><span className="min-w-0"><span className="block text-sm font-medium">{suggestion.title}</span><span className="block truncate text-xs text-muted-foreground">{suggestion.prompt}</span></span><ArrowUp className="ml-auto size-4 rotate-45 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></button>)}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] ${message.role === 'user' ? 'rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground' : 'flex gap-3'}`}>{message.role === 'assistant' && <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary"><Sparkles className="size-3.5 text-primary" /></div>}<p className={`text-sm leading-7 ${message.role === 'assistant' ? 'max-w-2xl' : ''}`}>{message.text}</p></div></div>)}
                {isThinking && <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="flex size-7 items-center justify-center rounded-full bg-secondary"><Sparkles className="size-3.5 text-primary" /></div><span className="thinking-dots">BEKA is thinking</span></div>}
              </div>
            )}
          </div>
          <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 pt-10 sm:px-8 lg:left-[280px]"><form onSubmit={(event) => { event.preventDefault(); sendMessage() }} className="mx-auto max-w-3xl"><div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-foreground/5 focus-within:border-primary/50"><button type="button" className="mb-0.5 rounded-xl p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Attach a file"><Paperclip className="size-4" /></button><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Ask BEKA anything about your next trip..." rows={1} className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-1 py-2.5 text-sm outline-none placeholder:text-muted-foreground" aria-label="Message BEKA" /><button type="submit" disabled={!input.trim() || isThinking} className="mb-0.5 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Send message"><Send className="size-4" /></button></div><p className="mt-2 text-center text-[11px] text-muted-foreground">BEKA can make mistakes. Check important travel details before booking.</p></form></div>
        </div>
      </section>
    </main>
  )
}
