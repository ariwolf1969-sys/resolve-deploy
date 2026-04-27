'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, MessageCircle, Search } from 'lucide-react'

interface ChatThread {
  id: string
  otherUser: {
    id: string
    name: string
    avatar: string | null
  } | null
  lastMessage: {
    content: string
    createdAt: string
    sender: { id: string; name: string } | null
  } | null
  updatedAt: string
}

export default function ChatListScreen() {
  const { user, goBack, setView } = useAppStore()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetch(`/api/chat?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setThreads(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  const formatTime = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `${diffMins}m`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h`
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Chats</h1>
        </div>
      </header>

      <main className="px-4 py-4">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl mb-3" />)
        ) : threads.length === 0 ? (
          <Card className="border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
              <MessageCircle className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">Sin conversaciones</p>
              <p className="text-sm mt-1">Los chats aparecerán aquí cuando contactes a un profesional</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {threads.map((thread) => (
              <Card
                key={thread.id}
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setView('chat', { threadId: thread.id })}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-blue-600">
                      {thread.otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">
                      {thread.otherUser?.name || 'Usuario'}
                    </p>
                    {thread.lastMessage && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {thread.lastMessage.content}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {thread.lastMessage ? formatTime(thread.lastMessage.createdAt) : ''}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
