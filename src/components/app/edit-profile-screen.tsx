'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function EditProfileScreen() {
  const { user, token, setUser, goBack } = useAppStore()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(
    user?.phone ? user.phone.replace('+54', '') : ''
  )
  const [bio, setBio] = useState(user?.bio || '')
  const [city, setCity] = useState(user?.city || '')
  const [province, setProvince] = useState(user?.province || '')
  const [address, setAddress] = useState(user?.address || '')

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Nombre requerido')

    if (phone) {
      const digits = phone.replace(/\D/g, '')
      if (digits.length < 8 || digits.length > 11) {
        return toast.error('El teléfono debe tener entre 8 y 11 dígitos')
      }
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone || null,
          bio: bio || null,
          city: city || null,
          province: province || null,
          address: address || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)

      setUser(data)
      toast.success('Perfil actualizado')
      goBack()
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Editar perfil</h1>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Información personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Nombre</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Email</Label>
              <Input value={user?.email || ''} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-400">El email no se puede cambiar</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Teléfono</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center h-10 px-3 bg-gray-100 border border-gray-200 rounded-l-md text-sm font-medium text-gray-600 shrink-0">
                  +54
                </div>
                <Input
                  type="tel"
                  inputMode="numeric"
                  placeholder="1155976414"
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '')
                    if (cleaned.length <= 11) setPhone(cleaned)
                  }}
                  className="rounded-l-none border-l-0"
                />
              </div>
              <p className="text-xs text-gray-400">
                Código de área + número (sin 0 ni 15)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ciudad</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Buenos Aires"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Provincia</Label>
              <Input
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="CABA"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Dirección</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Av. Corrientes 1234"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Acerca de mí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bio</Label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                className="w-full min-h-[100px] rounded-md border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex gap-3">
          <Button variant="outline" onClick={goBack} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </main>
    </div>
  )
}
