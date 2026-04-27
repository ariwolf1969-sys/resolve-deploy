'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/app-store'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SplashScreen() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { setUser, setToken, setView } = useAppStore()

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPhone, setLoginPhone] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')

  const handleRegister = async () => {
    if (!regName.trim()) return toast.error('Nombre requerido')
    if (!regEmail.trim()) return toast.error('Email requerido')
    if (!regPhone.trim()) {
      return toast.error('Teléfono requerido')
    }
    const digits = regPhone.replace(/\D/g, '')
    if (digits.length < 8 || digits.length > 11) {
      return toast.error('El teléfono debe tener entre 8 y 11 dígitos')
    }
    if (regPassword.length < 6) return toast.error('Contraseña de al menos 6 caracteres')
    if (regPassword !== regConfirm) return toast.error('Las contraseñas no coinciden')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          password: regPassword,
          role: 'user',
        }),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)

      // Auto login after register
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), password: regPassword }),
      })
      const loginData = await loginRes.json()
      if (loginData.token) {
        setUser(loginData.user)
        setToken(loginData.token)
        toast.success('¡Cuenta creada exitosamente!')
        setView('home')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!loginPassword) return toast.error('Contraseña requerida')

    if (loginMethod === 'email' && !loginEmail.trim()) {
      return toast.error('Email requerido')
    }

    if (loginMethod === 'phone' && !loginPhone.trim()) {
      return toast.error('Teléfono requerido')
    }

    if (loginMethod === 'phone') {
      const digits = loginPhone.replace(/\D/g, '')
      if (digits.length < 8 || digits.length > 11) {
        return toast.error('El teléfono debe tener entre 8 y 11 dígitos')
      }
    }

    setLoading(true)
    try {
      const body =
        loginMethod === 'email'
          ? { email: loginEmail.trim(), password: loginPassword }
          : { phone: loginPhone.trim(), password: loginPassword }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.error)

      setUser(data.user)
      setToken(data.token)
      toast.success('¡Bienvenido' + (data.user.name ? ', ' + data.user.name : '') + '!')
      setView('home')
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const PhoneInput = ({
    value,
    onChange,
  }: {
    value: string
    onChange: (val: string) => void
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Teléfono</Label>
      <div className="flex items-center gap-2">
        <div className="flex items-center h-10 px-3 bg-gray-100 border border-gray-200 rounded-l-md text-sm font-medium text-gray-600 shrink-0">
          +54
        </div>
        <Input
          type="tel"
          inputMode="numeric"
          placeholder="1155976414"
          value={value}
          onChange={(e) => {
            // Allow only digits
            const cleaned = e.target.value.replace(/\D/g, '')
            if (cleaned.length <= 11) {
              onChange(cleaned)
            }
          }}
          className="rounded-l-none border-l-0"
        />
      </div>
      <p className="text-xs text-gray-400">
        Ingrese código de área + número (sin 0 ni 15)
      </p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">Resolvé</h1>
          <p className="text-blue-100 mt-2 text-sm">
            Encuentra profesionales de confianza en Argentina
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-2 px-6 pt-6">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as 'login' | 'register')}
            >
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                <TabsTrigger value="register">Crear cuenta</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={loginMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLoginMethod('email')}
                    className={
                      loginMethod === 'email'
                        ? 'flex-1 bg-blue-600 hover:bg-blue-700'
                        : 'flex-1'
                    }
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button
                    type="button"
                    variant={loginMethod === 'phone' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLoginMethod('phone')}
                    className={
                      loginMethod === 'phone'
                        ? 'flex-1 bg-blue-600 hover:bg-blue-700'
                        : 'flex-1'
                    }
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Teléfono
                  </Button>
                </div>

                {loginMethod === 'email' ? (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                ) : (
                  <PhoneInput value={loginPhone} onChange={setLoginPhone} />
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Iniciar sesión
                </Button>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Tu nombre"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="tu@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <PhoneInput value={regPhone} onChange={setRegPhone} />

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repetir contraseña"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Crear cuenta
                </Button>
              </TabsContent>
            </Tabs>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-center text-xs text-gray-400 mt-4">
              Al continuar, aceptas nuestros Términos y Condiciones
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
