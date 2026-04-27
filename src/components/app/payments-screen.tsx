'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, CreditCard, Filter } from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  description: string | null
  createdAt: string
}

const typeLabels: Record<string, { label: string; color: string; icon: typeof ArrowUpRight }> = {
  payment: { label: 'Pago', color: 'text-red-600', icon: ArrowUpRight },
  earning: { label: 'Ganancia', color: 'text-green-600', icon: ArrowDownLeft },
  refund: { label: 'Reembolso', color: 'text-blue-600', icon: ArrowDownLeft },
  withdrawal: { label: 'Retiro', color: 'text-amber-600', icon: ArrowUpRight },
}

const formatPrice = (amount: number, prefix: string = '') =>
  `${prefix}${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(Math.abs(amount))}`

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })

export default function PaymentsScreen() {
  const { user, goBack } = useAppStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'payment' | 'earning'>('all')

  useEffect(() => {
    if (!user) return
    fetch(`/api/transactions?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setTransactions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter)

  const totalEarnings = transactions
    .filter((t) => t.type === 'earning')
    .reduce((acc, t) => acc + t.amount, 0)
  const totalPayments = transactions
    .filter((t) => t.type === 'payment')
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Pagos</h1>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Ganancias</p>
              <p className="text-lg font-bold text-green-600">
                {formatPrice(totalEarnings)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Pagos realizados</p>
              <p className="text-lg font-bold text-red-600">
                {formatPrice(totalPayments)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Todos
          </Button>
          <Button
            variant={filter === 'payment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('payment')}
            className={filter === 'payment' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Pagos
          </Button>
          <Button
            variant={filter === 'earning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('earning')}
            className={filter === 'earning' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Ganancias
          </Button>
        </div>

        {/* Transaction list */}
        {loading ? (
          [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : filtered.length === 0 ? (
          <Card className="border-dashed border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-gray-400">
              <CreditCard className="h-12 w-12 mb-3" />
              <p className="text-lg font-medium">Sin transacciones</p>
              <p className="text-sm mt-1">Las transacciones aparecerán aquí</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((tx) => {
              const typeInfo = typeLabels[tx.type] || typeLabels.payment
              const Icon = typeInfo.icon
              const isPositive = tx.type === 'earning' || tx.type === 'refund'
              return (
                <Card key={tx.id} className="border-0 shadow-sm">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
                      <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tx.description || typeInfo.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{formatDate(tx.createdAt)}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {typeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${typeInfo.color}`}>
                      {formatPrice(tx.amount, isPositive ? '+' : '-')}
                    </span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
