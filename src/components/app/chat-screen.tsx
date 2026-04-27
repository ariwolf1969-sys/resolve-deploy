'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  type: string
  senderId: string
  createdAt: string
  sender: { id: string; name: string; avatar: string | null }
}

export default function ChatScreen({ threadId }: { threadId: string }) {
  const { user, goBack } = useAppStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/chat/${threadId}/messages`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [threadId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!user || !input.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/chat/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: input.trim(),
          senderId: user.id,
          type: 'text',
        }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      setMessages([...messages, data])
      setInput('')
    } catch {
      toast.error('Error al enviar mensaje')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  const isMe = (msg: Message) => msg.senderId === user?.id

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shrink-0">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">Iniciá la conversación</p>
          </div>
        ) : (
          messages.map((msg) => {
            const mine = isMe(msg)
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                    mine
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-900 shadow-sm rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      mine ? 'text-blue-200' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-3 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí un mensaje..."
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={sending || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 shrink-0"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
