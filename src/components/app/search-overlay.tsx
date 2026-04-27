'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  ArrowLeft,
  X,
  MapPin,
  Star,
  Clock,
  Filter,
} from 'lucide-react'

interface Professional {
  id: string
  name: string
  avatar: string | null
  profession: string | null
  bio: string | null
  city: string | null
  province: string | null
  hourlyRate: number | null
  rating: number
  reviewCount: number
  isVerified: boolean
}

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

export default function SearchOverlay({
  initialProfession,
}: {
  initialProfession?: string
}) {
  const { goBack, setView } = useAppStore()
  const [query, setQuery] = useState('')
  const [profession, setProfession] = useState(initialProfession || '')
  const [results, setResults] = useState<Professional[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Auto-search on initial profession
  useEffect(() => {
    if (initialProfession) {
      doSearch('', initialProfession)
    }
  }, [initialProfession])

  const doSearch = async (q: string = query, prof: string = profession) => {
    setLoading(true)
    setSearched(true)
    try {
      let url = '/api/professionals?limit=20'
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      if (prof) params.set('profession', prof)
      if (params.toString()) url += '&' + params.toString()

      const res = await fetch(url)
      const data = await res.json()
      setResults(Array.isArray(data) ? data : [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch()
  }

  const selectProfession = (profId: string) => {
    if (profession === profId) {
      setProfession('')
    } else {
      setProfession(profId)
    }
  }

  const clearFilters = () => {
    setQuery('')
    setProfession('')
    setResults([])
    setSearched(false)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)

  const hasFilters = query || profession

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Buscar</h1>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="px-4 pb-3">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, profesión..."
                className="pl-10"
              />
            </div>
            {hasFilters && (
              <Button type="button" variant="ghost" size="icon" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </header>

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Profession filters */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-2">
            {professions.map((p) => (
              <Button
                key={p.id}
                variant={profession === p.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => selectProfession(p.id)}
                className={`shrink-0 ${
                  profession === p.id ? 'bg-blue-600 hover:bg-blue-700' : ''
                }`}
              >
                {p.icon} {p.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : searched && results.length === 0 ? (
          <Card className="border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Search className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">Sin resultados</p>
              <p className="text-sm mt-1">Intentá con otros filtros</p>
            </CardContent>
          </Card>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{results.length} profesionales encontrados</p>
            {results.map((pro) => (
              <Card
                key={pro.id}
                className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
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
                    {pro.bio && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{pro.bio}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-gray-700">
                          {pro.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">({pro.reviewCount})</span>
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
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !searched ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Search className="h-12 w-12 mb-3" />
            <p className="text-lg font-medium">Buscá profesionales</p>
            <p className="text-sm mt-1">
              Escribí un nombre o seleccioná una profesión
            </p>
          </div>
        ) : null}
      </main>

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
