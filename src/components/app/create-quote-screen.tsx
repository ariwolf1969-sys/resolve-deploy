'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateQuoteScreen() {
  const { user, goBack, setView } = useAppStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    urgency: 'medium',
    city: '',
    province: '',
    receiverId: '',
  })

  const handleSubmit = async () => {
    if (!user) return
    if (!form.title.trim()) return toast.error('Título requerido')
    if (!form.receiverId) return toast.error('Seleccioná un profesional')

    setLoading(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description || null,
          senderId: user.id,
          receiverId: form.receiverId,
          price: form.price ? parseFloat(form.price) : null,
          urgency: form.urgency,
          city: form.city || null,
          province: form.province || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      toast.success('Presupuesto enviado')
      setView('quote-detail', { quoteId: data.id })
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  // Simple professional search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; profession: string | null }[]>([])
  const [searching, setSearching] = useState(false)

  const searchProfessionals = async (q: string) => {
    setSearchQuery(q)
    if (q.length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(`/api/professionals?search=${encodeURIComponent(q)}&limit=5`)
      const data = await res.json()
      setSearchResults(Array.isArray(data) ? data : [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectProfessional = (pro: { id: string; name: string; profession: string | null }) => {
    setForm({ ...form, receiverId: pro.id })
    setSearchResults([])
    setSearchQuery(pro.name)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Solicitar presupuesto</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Datos del presupuesto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profesional</Label>
              <div className="relative">
                <Input
                  value={searchQuery}
                  onChange={(e) => searchProfessionals(e.target.value)}
                  placeholder="Buscar profesional..."
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {searchResults.map((pro) => (
                      <button
                        key={pro.id}
                        onClick={() => selectProfessional(pro)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <span className="font-medium">{pro.name}</span>
                        {pro.profession && (
                          <span className="text-xs text-gray-400 capitalize">• {pro.profession}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {form.receiverId && (
                <p className="text-xs text-green-600">✓ Profesional seleccionado</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej: Instalación eléctrica"
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describí lo que necesitás..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Precio estimado (opcional)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ej: 25000"
              />
            </div>

            <div className="space-y-2">
              <Label>Urgencia</Label>
              <div className="flex gap-2">
                {[
                  { value: 'low', label: '🟢 Baja' },
                  { value: 'medium', label: '🟡 Media' },
                  { value: 'high', label: '🔴 Alta' },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={form.urgency === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setForm({ ...form, urgency: opt.value })}
                    className={
                      form.urgency === opt.value
                        ? 'flex-1 bg-blue-600 hover:bg-blue-700'
                        : 'flex-1'
                    }
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label>Provincia</Label>
                <Input
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  placeholder="Provincia"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Send className="h-4 w-4 mr-2" />
          Enviar solicitud
        </Button>
      </main>
    </div>
  )
}
