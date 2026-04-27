'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, Clock, ChevronRight, FileText } from 'lucide-react'

interface Quote {
  id: string
  title: string
  description: string | null
  status: string
  price: number | null
  urgency: string
  city: string | null
  province: string | null
  createdAt: string
  sender: { id: string; name: string; avatar: string | null }
  receiver: { id: string; name: string; avatar: string | null; profession: string | null }
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Aceptado', color: 'bg-blue-100 text-blue-700' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
}

const urgencyLabels: Record<string, string> = {
  low: '🟢 Baja',
  medium: '🟡 Media',
  high: '🔴 Alta',
}

export default function QuotesScreen() {
  const { user, goBack, setView } = useAppStore()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'sent' | 'received'>('sent')

  useEffect(() => {
    if (!user) return
    const params = tab === 'sent' ? `senderId=${user.id}` : `receiverId=${user.id}`
    fetch(`/api/quotes?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setQuotes(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, tab])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
    })
  }

  const otherUser = (q: Quote) =>
    tab === 'sent' ? q.receiver : q.sender

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Presupuestos</h1>
        </div>
        <div className="px-4 pb-3 flex gap-2">
          <Button
            variant={tab === 'sent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab('sent')}
            className={tab === 'sent' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Enviados
          </Button>
          {user?.role === 'professional' && (
            <Button
              variant={tab === 'received' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab('received')}
              className={tab === 'received' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Recibidos
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setView('create-quote')}
            className="ml-auto bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuevo
          </Button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : quotes.length === 0 ? (
          <Card className="border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">Sin presupuestos</p>
              <p className="text-sm mt-1">
                {tab === 'sent'
                  ? 'Aún no solicitaste ningún presupuesto'
                  : 'No recibiste solicitudes'}
              </p>
            </CardContent>
          </Card>
        ) : (
          quotes.map((quote) => {
            const other = otherUser(quote)
            const status = statusLabels[quote.status] || statusLabels.pending
            return (
              <Card
                key={quote.id}
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setView('quote-detail', { quoteId: quote.id })}
              >
                <CardContent className="p-3 flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-blue-600">
                      {other.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm text-gray-900 truncate flex-1">
                        {quote.title}
                      </p>
                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {other.name}{other.profession ? ` • ${other.profession}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge className={`${status.color} text-[10px] px-1.5 py-0 border-0`}>
                        {status.label}
                      </Badge>
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(quote.createdAt)}
                      </span>
                    </div>
                    {quote.price && (
                      <p className="text-sm font-bold text-blue-600 mt-1">
                        {formatPrice(quote.price)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </main>
    </div>
  )
}
