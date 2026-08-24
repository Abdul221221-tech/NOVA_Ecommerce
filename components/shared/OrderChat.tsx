'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/app/actions/fulfillment'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MessageCircle, Send } from 'lucide-react'

export function OrderChat({ orderId, currentUserId }: { orderId: string, currentUserId: string }) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const supabase = createClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true })
      
      if (data) setMessages(data)
    }
    fetchMessages()

    // 2. Subscribe to new messages
    const channel = supabase
      .channel(`order_chat_${orderId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `order_id=eq.${orderId}`
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, supabase])

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      await sendMessage(orderId, newMessage)
      setNewMessage('')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger 
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-accent-primary hover:bg-accent-primary/90 text-background z-50 transition-transform hover:scale-105 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </SheetTrigger>
      
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col border-l shadow-2xl">
        <div className="p-4 border-b flex items-center gap-2 bg-muted/20">
          <MessageCircle className="w-5 h-5 text-accent-primary" />
          <h3 className="font-bold">Order Messages</h3>
        </div>
        
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Send a message to start chatting.</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 ${
                      isMe ? 'bg-accent-primary text-background rounded-br-none' : 'bg-muted rounded-bl-none'
                    }`}>
                      <p className="text-sm">{msg.body}</p>
                      <span className="text-[10px] opacity-70 mt-1 block">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-muted/10">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={newMessage} 
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1"
            />
            <Button type="submit" disabled={isSending || !newMessage.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
