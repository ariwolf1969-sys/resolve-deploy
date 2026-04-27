'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Check, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

const professions = [
  { id: 'electricista', label: 'Electricista', icon: '⚡' },
  { id: 'plomero', label: 'Plomero', icon: '🔧' },
  { id: 'albañil', label: 'Albañil', icon: '🧱' },
  { id: 'pintor', label: 'Pintor', icon: '🎨' },
  { id: 'gasista', label: 'Gasista', icon: '🔥' },
  { id: 'cerrajero', label: 'Cerrajero', icon: '🔑' },
  { id: 'peluquero', label: 'Peluquero', icon: '✂️' },
  { id: 'chofer', label: 'Chofer', icon: '🚗' },
  { id: 'manicura', label: 'Manicura', icon: '💅' },
  { id: 'apoyo-escolar', label: 'Apoyo escolar', icon: '📚' },
]

const stepLabels = ['Profesión', 'Experiencia', 'Detalles', 'Ubicación', 'Confirmar']

export default function RegisterProScreen() {
  const { user, goBack, setUser, setView } = useAppStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    profession: '',
    bio: '',
    experience: '',
    education: '',
    skills: [] as string[],
    city: '',
    province: '',
    address: '',
    hourlyRate: '',
    certifications: [] as string[],
  })

  const [skillInput, setSkillInput] = useState('')
  const [certInput, setCertInput] = useState('')

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] })
      setSkillInput('')
    }
  }

  const removeSkill = (s: string) => {
    setForm({ ...form, skills: form.skills.filter((sk) => sk !== s) })
  }

  const addCert = () => {
    if (certInput.trim() && !form.certifications.includes(certInput.trim())) {
      setForm({ ...form, certifications: [...form.certifications, certInput.trim()] })
      setCertInput('')
    }
  }

  const removeCert = (c: string) => {
    setForm({ ...form, certifications: form.certifications.filter((ce) => ce !== c) })
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'professional',
          profession: form.profession,
          bio: form.bio || null,
          experience: form.experience || null,
          education: form.education || null,
          skills: form.skills.length > 0 ? form.skills : null,
          city: form.city || null,
          province: form.province || null,
          address: form.address || null,
          hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
          certifications: form.certifications.length > 0 ? form.certifications : null,
          isAvailable: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)
      setUser(data)
      toast.success('¡Perfil profesional creado!')
      setView('pro-profile', { proId: user.id })
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const canNext = () => {
    switch (step) {
      case 0: return !!form.profession
      case 1: return !!form.experience
      case 2: return true
      case 3: return !!form.city
      case 4: return true
      default: return false
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
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Registrarse como profesional</h1>
            <p className="text-xs text-gray-500">Paso {step + 1} de {stepLabels.length}</p>
          </div>
          <span className="text-sm text-blue-600 font-medium">{step + 1}/{stepLabels.length}</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto">
        {/* Step 0: Profession */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">¿Cuál es tu profesión?</h2>
              <p className="text-sm text-gray-500 mt-1">Selecciona la categoría que mejor describe tu trabajo</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {professions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setForm({ ...form, profession: p.id })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.profession === p.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  <p className="text-sm font-medium mt-2">{p.label}</p>
                  {form.profession === p.id && (
                    <Check className="h-4 w-4 text-blue-600 absolute top-2 right-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Experience */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Tu experiencia</h2>
              <p className="text-sm text-gray-500 mt-1">Cuéntanos sobre tu trayectoria</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Años de experiencia</Label>
                <Input
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="Ej: 5 años"
                />
              </div>
              <div className="space-y-2">
                <Label>Educación</Label>
                <Input
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                  placeholder="Ej: Universidad Tecnológica Nacional"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Details & Skills */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Habilidades y detalles</h2>
              <p className="text-sm text-gray-500 mt-1">¿Qué sabes hacer?</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bio profesional</Label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Describe tu trabajo y experiencia..."
                  className="w-full min-h-[100px] rounded-md border border-gray-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Habilidades</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Agregar habilidad"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button variant="outline" onClick={addSkill} size="icon">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1 pr-1">
                      {s}
                      <button onClick={() => removeSkill(s)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Certificaciones</Label>
                <div className="flex gap-2">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="Agregar certificación"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                  />
                  <Button variant="outline" onClick={addCert} size="icon">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.certifications.map((c) => (
                    <Badge key={c} variant="secondary" className="gap-1 pr-1">
                      {c}
                      <button onClick={() => removeCert(c)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tarifa por hora (ARS)</Label>
                <Input
                  type="number"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  placeholder="Ej: 5000"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">¿Dónde trabajas?</h2>
              <p className="text-sm text-gray-500 mt-1">Tu ubicación ayuda a los clientes a encontrarte</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Ciudad</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Ej: Buenos Aires"
                />
              </div>
              <div className="space-y-2">
                <Label>Provincia</Label>
                <Input
                  value={form.province}
                  onChange={(e) => setForm({ ...form, province: e.target.value })}
                  placeholder="Ej: CABA"
                />
              </div>
              <div className="space-y-2">
                <Label>Dirección (opcional)</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Ej: Av. Corrientes 1234"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Confirmar registro</h2>
              <p className="text-sm text-gray-500 mt-1">Revisá los datos antes de enviar</p>
            </div>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Profesión</span>
                  <span className="text-sm font-medium capitalize">
                    {professions.find((p) => p.id === form.profession)?.label || form.profession}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Experiencia</span>
                  <span className="text-sm font-medium">{form.experience}</span>
                </div>
                {form.education && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Educación</span>
                    <span className="text-sm font-medium">{form.education}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Ciudad</span>
                  <span className="text-sm font-medium">{form.city}</span>
                </div>
                {form.hourlyRate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tarifa</span>
                    <span className="text-sm font-medium">${parseInt(form.hourlyRate).toLocaleString('es-AR')}/h</span>
                  </div>
                )}
                {form.skills.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Habilidades</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {form.skills.map((s) => (
                        <Badge key={s} variant="secondary">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Anterior
            </Button>
          )}
          {step < stepLabels.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Completar registro
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
