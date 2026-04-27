'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  MessageCircle,
  FileText,
  ShoppingBag,
  Star,
  MapPin,
  ChevronRight,
  Briefcase,
} from 'lucide-react'

interface Profession {
  id: string
  label: string
  icon: string
  color: string
}

const professions: Profession[] = [
  { id: 'electricista', label: 'Electricista', icon: '⚡', color: '#EAB308' },
  { id: 'plomero', label: 'Plomero', icon: '🔧', color: '#3B82F6' },
  { id: 'albañil', label: 'Albañil', icon: '🧱', color: '#EF4444' },
  { id: 'pintor', label: 'Pintor', icon: '🎨', color: '#8B5CF6' },
  { id: 'gasista', label: 'Gasista', icon: '🔥', color: '#F97316' },
  { id: 'cerrajero', label: 'Cerrajero', icon: '🔑', color: '#6B7280' },
  { id: 'peluquero', label: 'Peluquero', icon: '✂️', color: '#EC4899' },
  { id: 'chofer', label: 'Chofer', icon: '🚗', color: '#6366F1' },
  { id: 'manicura', label: 'Manicura', icon: '💅', color: '#F472B6' },
  { id: 'apoyo-escolar', label: 'Apoyo escolar', icon: '📚', color: '#8B5CF6' },
]

interface Professional {
  id: string
  name: string
  avatar: string | null
  profession: string | null
  bio: string | null
  city: string | null
  hourlyRate: number | null
  rating: number
  reviewCount: number
  isVerified: boolean
}

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  originalPrice: number | null
  imageUrl: string | null
  source: string | null
  isFeatured: boolean
  isPopular: boolean
}

export default function HomeScreen() {
  const { user, setView, token } = useAppStore()
  const [topPros, setTopPros] = useState<Professional[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loadingPros, setLoadingPros] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const scrollRef1 = useRef<HTMLDivElement>(null)
  const scrollRef2 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/professionals?limit=5')
      .then((r) => r.json())
      .then((data) => {
        setTopPros(Array.isArray(data) ? data : [])
        setLoadingPros(false)
      })
      .catch(() => setLoadingPros(false))

    fetch('/api/products/real')
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : [])
        setLoadingProducts(false)
      })
      .catch(() => setLoadingProducts(false))
  }, [])

  const featuredProducts = products.filter((p) => p.isFeatured)
  const popularProducts = products.filter((p) => p.isPopular)

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={() => setView('home')}
          >
            Resolvé
          </h1>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView('chat-list')}
                  className="relative"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setView('profile')}
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setView('splash')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                size="sm"
              >
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setView('search')}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-sm hover:bg-gray-100 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Buscar profesionales, servicios...</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-4 space-y-6 pb-24">
        {/* Professions Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Categorías</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('search')}
              className="text-blue-600 text-xs"
            >
              Ver todas <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <div className="grid grid-cols-5 gap-3 min-w-max">
              {professions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setView('search', { profession: p.id })}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white transition-colors"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm"
                    style={{ backgroundColor: p.color + '20' }}
                  >
                    {p.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Carousel */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">🔥 Ofertas del día</h2>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => scroll(scrollRef1, 'left')}
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => scroll(scrollRef1, 'right')}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {loadingProducts ? (
            <div className="flex gap-3 overflow-x-auto">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-40 h-52 shrink-0 rounded-xl" />
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <Card className="border-dashed border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-8 text-gray-400">
                <ShoppingBag className="h-8 w-8 mb-2" />
                <p className="text-sm">No hay ofertas disponibles</p>
              </CardContent>
            </Card>
          ) : (
            <div
              ref={scrollRef1}
              className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2"
            >
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="w-40 shrink-0 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setView('products')}
                >
                  <div className="h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-t-xl flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-blue-300" />
                  </div>
                  <CardContent className="p-2.5 space-y-1">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                      {product.title}
                    </p>
                    {product.source && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {product.source}
                      </Badge>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    {product.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Popular Products Carousel */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">⭐ Populares</h2>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => scroll(scrollRef2, 'left')}
              >
                <ChevronRight className="h-3 w-3 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => scroll(scrollRef2, 'right')}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
          {loadingProducts ? (
            <div className="flex gap-3 overflow-x-auto">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-40 h-52 shrink-0 rounded-xl" />
              ))}
            </div>
          ) : popularProducts.length === 0 ? (
            <Card className="border-dashed border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-8 text-gray-400">
                <ShoppingBag className="h-8 w-8 mb-2" />
                <p className="text-sm">No hay productos populares</p>
              </CardContent>
            </Card>
          ) : (
            <div
              ref={scrollRef2}
              className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2"
            >
              {popularProducts.map((product) => (
                <Card
                  key={product.id}
                  className="w-40 shrink-0 border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setView('products')}
                >
                  <div className="h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-t-xl flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-green-300" />
                  </div>
                  <CardContent className="p-2.5 space-y-1">
                    <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                      {product.title}
                    </p>
                    {product.source && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {product.source}
                      </Badge>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-green-600">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    {product.originalPrice && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Top Professionals */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Top profesionales</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('search')}
              className="text-blue-600 text-xs"
            >
              Ver todos <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {loadingPros ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : topPros.length === 0 ? (
            <Card className="border-dashed border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Briefcase className="h-8 w-8 mb-2" />
                <p className="text-sm">Aún no hay profesionales registrados</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {topPros.slice(0, 5).map((pro) => (
                <Card
                  key={pro.id}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setView('pro-profile', { proId: pro.id })}
                >
                  <CardContent className="p-3 flex gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      {pro.avatar ? (
                        <img
                          src={pro.avatar}
                          alt={pro.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-blue-600">
                          {pro.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {pro.name}
                        </p>
                        {pro.isVerified && (
                          <span className="text-blue-500 text-xs">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 capitalize">
                        {pro.profession}
                        {pro.city && (
                          <>
                            {' '}
                            <span className="text-gray-400">•</span> {pro.city}
                          </>
                        )}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-medium text-gray-700">
                            {pro.rating.toFixed(1)}
                          </span>
                        </div>
                        {pro.hourlyRate && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0"
                          >
                            {formatPrice(pro.hourlyRate)}/h
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300 self-center" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        {user && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setView('create-quote')}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Solicitar presupuesto</span>
                </CardContent>
              </Card>
              <Card
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setView('quotes')}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Mis presupuestos</span>
                </CardContent>
              </Card>
              <Card
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setView('products')}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Productos</span>
                </CardContent>
              </Card>
              <Card
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setView('payments')}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Pagos</span>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Register as Pro CTA */}
        {user && user.role === 'user' && (
          <Card className="border-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">¿Eres profesional?</h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  Regístrate y consigue más clientes
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setView('register-pro')}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium"
              >
                Registrarme
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom Navigation */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="max-w-md mx-auto flex items-center justify-around py-2">
            <button
              onClick={() => setView('home')}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Briefcase className="h-5 w-5 text-blue-600" />
              <span className="text-[10px] font-medium text-blue-600">Inicio</span>
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
              <span className="text-[10px] text-gray-400">Perfil</span>
            </button>
          </div>
        </nav>
      )}

      {/* Hidden scrollbar styles */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
