'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface QuoteData {
  id: string
  title: string
  description: string | null
  status: string
  price: number | null
  urgency: string
  city: string | null
  province: string | null
  createdAt: string
  expiresAt: string | null
  sender: { id: string; name: string; phone: string | null; avatar: string | null }
  receiver: { id: string; name: string; avatar: string | null; profession: string | null; rating: number }
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

export default function QuoteDetailScreen({ quoteId }: { quoteId: string }) {
  const { user, goBack } = useAppStore()
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/quotes/${quoteId}`)
      .then((r) => r.json())
      .then((data) => {
        setQuote(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [quoteId])

  const updateStatus = async (status: string) => {
    if (!quote) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      setQuote({ ...quote, status })
      toast.success(`Estado actualizado: ${statusLabels[status]?.label}`)
    } catch {
      toast.error('Error de conexión')
    } finally {
      setUpdating(false)
    }
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(price)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-6 w-40" />
          </div>
        </header>
        <div className="p-4 space-y-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Presupuesto no encontrado</p>
      </div>
    )
  }

  const isReceiver = user?.id === quote.receiver.id
  const status = statusLabels[quote.status] || statusLabels.pending

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Detalle del presupuesto</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Status card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Badge className={`${status.color} text-xs px-2 py-1 border-0`}>
                {status.label}
              </Badge>
              <span className="text-xs text-gray-400">{urgencyLabels[quote.urgency]}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{quote.title}</h2>
            {quote.description && (
              <p className="text-sm text-gray-600 mt-1">{quote.description}</p>
            )}
            {quote.price && (
              <p className="text-2xl font-bold text-blue-600 mt-3">{formatPrice(quote.price)}</p>
            )}
          </CardContent>
        </Card>

        {/* People involved */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">{isReceiver ? 'Solicitante' : 'Profesional'}</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {(isReceiver ? quote.sender.name : quote.receiver.name)?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{isReceiver ? quote.sender.name : quote.receiver.name}</p>
                  {isReceiver ? (
                    quote.sender.phone && (
                      <p className="text-xs text-gray-500">{quote.sender.phone}</p>
                    )
                  ) : (
                    quote.receiver.profession && (
                      <p className="text-xs text-gray-500 capitalize">{quote.receiver.profession}</p>
                    )
                  )}
                </div>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs text-gray-500 mb-1">{isReceiver ? 'Profesional' : 'Solicitante'}</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {(isReceiver ? quote.receiver.name : quote.sender.name)?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium">{isReceiver ? quote.receiver.name : quote.sender.name}</p>
                  {isReceiver && quote.receiver.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-gray-500">{quote.receiver.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Creado:</span>
              <span className="font-medium">{formatDate(quote.createdAt)}</span>
            </div>
            {quote.expiresAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Expira:</span>
                <span className="font-medium">{formatDate(quote.expiresAt)}</span>
              </div>
            )}
            {(quote.city || quote.province) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="font-medium">
                  {quote.city}{quote.province ? `, ${quote.province}` : ''}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {isReceiver && quote.status === 'pending' && (
          <div className="space-y-2">
            <Button
              onClick={() => updateStatus('accepted')}
              disabled={updating}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceptar presupuesto
            </Button>
            <Button
              onClick={() => updateStatus('rejected')}
              disabled={updating}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              size="lg"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </div>
        )}

        {!isReceiver && quote.status === 'accepted' && (
          <Button
            onClick={() => updateStatus('completed')}
            disabled={updating}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar como completado
          </Button>
        )}

        {quote.status === 'completed' && (
          <Card className="border-0 bg-green-50">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-700">Presupuesto completado</p>
                <p className="text-sm text-green-600">Gracias por usar Resolvé</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
