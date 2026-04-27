'use client'

import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Edit,
  Star,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Settings,
  LogOut,
  ShoppingBag,
  FileText,
  MessageCircle,
  CreditCard,
} from 'lucide-react'
import { toast } from 'sonner'

const professionLabels: Record<string, string> = {
  electricista: 'Electricista',
  plomero: 'Plomero',
  albañil: 'Albañil',
  pintor: 'Pintor',
  gasista: 'Gasista',
  cerrajero: 'Cerrajero',
  peluquero: 'Peluquero',
  chofer: 'Chofer',
  manicura: 'Manicura',
  'apoyo-escolar': 'Apoyo escolar',
}

export default function ProfileScreen() {
  const { user, logout, setView } = useAppStore()

  if (!user) return null

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
  }

  const menuItems = [
    {
      icon: FileText,
      label: 'Mis presupuestos',
      onClick: () => setView('quotes'),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: ShoppingBag,
      label: 'Productos',
      onClick: () => setView('products'),
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: MessageCircle,
      label: 'Chats',
      onClick: () => setView('chat-list'),
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: CreditCard,
      label: 'Pagos',
      onClick: () => setView('payments'),
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  if (user.role === 'professional') {
    menuItems.unshift({
      icon: Star,
      label: 'Mi perfil profesional',
      onClick: () => setView('pro-profile', { proId: user.id }),
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('home')} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Mi perfil</h1>
        </div>

        {/* Profile info */}
        <div className="px-4 pb-6 pt-2">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{user.name || 'Usuario'}</h2>
              {user.profession && (
                <p className="text-blue-100 text-sm capitalize">
                  {professionLabels[user.profession] || user.profession}
                </p>
              )}
              {user.city && (
                <p className="text-blue-200 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {user.city}{user.province ? `, ${user.province}` : ''}
                </p>
              )}
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setView('edit-profile')}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4">
            <div className="text-center">
              <p className="text-lg font-bold">{user.rating.toFixed(1)}</p>
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-amber-300 fill-amber-300" />
                <span className="text-xs text-blue-200">Rating</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{user.reviewCount}</p>
              <span className="text-xs text-blue-200">Reseñas</span>
            </div>
            {user.hourlyRate && (
              <div className="text-center">
                <p className="text-lg font-bold">${user.hourlyRate.toLocaleString('es-AR')}</p>
                <span className="text-xs text-blue-200">/hora</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Contact info */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">{user.phone}</span>
              </div>
            )}
            {user.bio && (
              <p className="text-sm text-gray-600 mt-2">{user.bio}</p>
            )}
          </CardContent>
        </Card>

        {/* Menu items */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={item.label}>
                <button
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className={`h-9 w-9 rounded-xl ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 flex-1 text-left">
                    {item.label}
                  </span>
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Professional registration CTA */}
        {user.role === 'user' && (
          <Card className="border-0 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Ser profesional</p>
                  <p className="text-xs text-gray-500">Consigue más clientes</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => setView('register-pro')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Registrarme
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          <button
            onClick={() => setView('home')}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <Briefcase className="h-5 w-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">Inicio</span>
          </button>
          <button
            onClick={() => setView('search')}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <Search className="h-5 w-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">Buscar</span>
          </button>
          <button
            onClick={() => setView('chat-list')}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <MessageCircle className="h-5 w-5 text-gray-400" />
            <span className="text-[10px] text-gray-400">Chats</span>
          </button>
          <button
            onClick={() => setView('profile')}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-[10px] font-medium text-blue-600">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-[10px] font-medium text-blue-600">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

function Search({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}
