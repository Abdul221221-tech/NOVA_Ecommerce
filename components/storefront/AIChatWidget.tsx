'use client'

import { useChat, Message } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface AIChatWidgetProps {
  isOpen: boolean
  onClose: () => void
}

export function AIChatWidget({ isOpen, onClose }: AIChatWidgetProps) {
  const { messages, append, isLoading, error } = useChat({
    api: '/api/chat',
  })

  const [localInput, setLocalInput] = useState('')

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!localInput.trim() || isLoading) return
    append({ role: 'user', content: localInput })
    setLocalInput('')
  }

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[100px] right-6 z-50 w-[90vw] max-w-[400px] sm:w-[400px] h-[calc(100dvh-120px)] sm:h-[600px] max-h-[85dvh] bg-white dark:bg-zinc-950 border border-border/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-accent-primary/10 border-b border-accent-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">NOVA Assistant</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 dark:bg-zinc-900/20">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-accent-primary" />
                </div>
                <p className="max-w-[200px] text-sm">
                  Hi! I'm your NOVA AI assistant. How can I help you today?
                </p>
              </div>
            ) : (
              messages.map((m: Message) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
                >
                  {m.role === 'assistant' && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary mt-auto">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-foreground text-background rounded-br-sm'
                        : 'bg-white dark:bg-zinc-900 border border-border shadow-sm text-foreground rounded-bl-sm'
                    }`}
                  >
                    {m.content}
                    {m.toolInvocations && m.toolInvocations.length > 0 && (
                      <div className="mt-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg text-xs opacity-80 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Searching product catalog...
                      </div>
                    )}
                  </div>
                  
                  {m.role === 'user' && (
                    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 mt-auto">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-accent-primary mt-auto">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white dark:bg-zinc-900 border border-border shadow-sm text-foreground rounded-bl-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                Something went wrong. Please try again.
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-zinc-950 border-t border-border/60">
            <form
              onSubmit={handleFormSubmit}
              className="flex items-center gap-2 relative"
            >
              <input
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-transparent focus:border-accent-primary/50 focus:bg-white dark:focus:bg-zinc-950 focus:ring-4 focus:ring-accent-primary/10 transition-all text-sm outline-none disabled:opacity-50 text-foreground"
              />
              <button
                type="submit"
                disabled={isLoading || !localInput.trim()}
                className="absolute right-2 w-8 h-8 rounded-lg bg-accent-primary text-slate-950 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
