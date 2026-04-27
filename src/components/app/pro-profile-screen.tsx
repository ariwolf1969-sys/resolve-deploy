'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface ProData {
  id: string
  name: string
  email: string
  phone: string | null
  avatar: string | null
  profession: string | null
  bio: string | null
  city: string | null
  province: string | null
  hourlyRate: number | null
  rating: number
  reviewCount: number
  isVerified: boolean
  skills: string[] | null
  experience: string | null
  education: string | null
  certifications: string[] | null
  isAvailable: boolean
}

export default function ProProfileScreen({ proId }: { proId: string }) {
  const { user, token, goBack, setView } = useAppStore()
  const [pro, setPro] = useState<ProData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingQuote, setSendingQuote] = useState(false)

  useEffect(() => {
    fetch(`/api/users/${proId}`)
      .then((r) => r.json())
      .then((data) => {
        setPro(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [proId])

  const handleRequestQuote = async () => {
    if (!user || !pro) return
    setSendingQuote(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Presupuesto para ${pro.profession || 'servicio'}`,
          description: `Solicitud de presupuesto a ${pro.name}`,
          senderId: user.id,
          receiverId: pro.id,
          urgency: 'medium',
          city: user.city,
          province: user.province,
        }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      toast.success('Presupuesto solicitado')
      setView('quote-detail', { quoteId: data.id })
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSendingQuote(false)
    }
  }

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
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Profesional no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Perfil profesional</h1>
        </div>

        <div className="px-4 pb-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
              {pro.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold truncate">{pro.name}</h2>
                {pro.isVerified && (
                  <CheckCircle className="h-5 w-5 text-blue-200" />
                )}
              </div>
              <p className="text-blue-100 capitalize">{pro.profession}</p>
              {pro.city && (
                <p className="text-blue-200 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {pro.city}{pro.province ? `, ${pro.province}` : ''}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                  <span className="text-sm font-medium">{pro.rating.toFixed(1)}</span>
                  <span className="text-xs text-blue-200">({pro.reviewCount})</span>
                </div>
                {pro.isAvailable && (
                  <Badge className="bg-green-500/20 text-green-100 text-xs border-0">
                    Disponible
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* About */}
        {pro.bio && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Sobre mí</h3>
              <p className="text-sm text-gray-600">{pro.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {pro.skills && pro.skills.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Habilidades</h3>
              <div className="flex flex-wrap gap-2">
                {pro.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience & Education */}
        {(pro.experience || pro.education) && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              {pro.experience && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Experiencia</p>
                    <p className="text-sm text-gray-700">{pro.experience}</p>
                  </div>
                </div>
              )}
              {pro.education && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Educación</p>
                    <p className="text-sm text-gray-700">{pro.education}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            {pro.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{pro.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">{pro.email}</span>
            </div>
            {pro.hourlyRate && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <Badge className="bg-green-50 text-green-700 border-0">
                  ${pro.hourlyRate.toLocaleString('es-AR')}/hora
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Fixed bottom action */}
      {user && user.id !== pro.id && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
          <div className="max-w-md mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Create chat thread then navigate
                toast.info('Función de chat próximamente')
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chatear
            </Button>
            <Button
              onClick={handleRequestQuote}
              disabled={sendingQuote}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {sendingQuote ? (
                <span className="animate-pulse">Enviando...</span>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Solicitar presupuesto
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
