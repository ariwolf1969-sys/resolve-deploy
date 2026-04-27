'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ShoppingBag, ExternalLink } from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string | null
  price: number
  originalPrice: number | null
  imageUrl: string | null
  sourceUrl: string | null
  source: string | null
  category: string | null
}

export default function ProductsScreen() {
  const { goBack } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'featured' | 'popular'>('all')

  useEffect(() => {
    fetch('/api/products/real')
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredProducts = products.filter((p) => {
    if (filter === 'featured') return p.isFeatured
    if (filter === 'popular') return p.isPopular
    return true
  })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Productos</h1>
        </div>
        <div className="px-4 pb-3 flex gap-2">
          {(['all', 'featured', 'popular'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className={
                filter === f
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : ''
              }
            >
              {f === 'all' ? 'Todos' : f === 'featured' ? '🔥 Ofertas' : '⭐ Populares'}
            </Button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ShoppingBag className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">No hay productos</p>
              <p className="text-sm mt-1">Los productos aparecerán aquí cuando estén disponibles</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-blue-300" />
                </div>
                <CardContent className="p-3 space-y-1.5">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight">
                    {product.title}
                  </p>
                  {product.source && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {product.source}
                    </Badge>
                  )}
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <div>
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                        <span className="text-[10px] text-green-600 ml-1 font-medium">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {product.sourceUrl && (
                    <a
                      href={product.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 mt-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver en tienda
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
