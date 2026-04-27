'use client';

import { useState } from 'react';
import { useAppStore, type Transaction } from '@/store/app-store';
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

type TabFilter = 'all' | 'held' | 'released' | 'refunded';

const demoTransactions: (Transaction & { quoteTitle: string; counterparty: string })[] = [
  {
    id: 'txn_001',
    quoteId: 'q_001',
    amount: 85000,
    currency: 'ARS',
    platformFee: 6800,
    status: 'held',
    paymentMethod: 'credit_card',
    paymentRef: 'VISA-****4242',
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T10:30:00Z',
    quoteTitle: 'Reparación de cañería en cocina',
    counterparty: 'Carlos Méndez',
  },
  {
    id: 'txn_002',
    quoteId: 'q_002',
    amount: 120000,
    currency: 'ARS',
    platformFee: 9600,
    status: 'released',
    paymentMethod: 'transfer',
    paymentRef: 'TRF-2025-001',
    releasedAt: '2025-01-18T14:00:00Z',
    createdAt: '2025-01-16T09:00:00Z',
    updatedAt: '2025-01-18T14:00:00Z',
    quoteTitle: 'Pintura completa del departamento',
    counterparty: 'María García',
  },
  {
    id: 'txn_003',
    quoteId: 'q_003',
    amount: 45000,
    currency: 'ARS',
    platformFee: 3600,
    status: 'refunded',
    paymentMethod: 'credit_card',
    paymentRef: 'MC-****8888',
    refundedAt: '2025-01-20T11:00:00Z',
    createdAt: '2025-01-17T16:00:00Z',
    updatedAt: '2025-01-20T11:00:00Z',
    quoteTitle: 'Instalación de aire acondicionado',
    counterparty: 'Roberto López',
  },
  {
    id: 'txn_004',
    quoteId: 'q_004',
    amount: 200000,
    currency: 'ARS',
    platformFee: 16000,
    status: 'held',
    paymentMethod: 'debit_card',
    paymentRef: 'VISA-****1234',
    createdAt: '2025-01-19T08:15:00Z',
    updatedAt: '2025-01-19T08:15:00Z',
    quoteTitle: 'Mudanza completa + embalaje',
    counterparty: 'Laura Fernández',
  },
  {
    id: 'txn_005',
    quoteId: 'q_005',
    amount: 67000,
    currency: 'ARS',
    platformFee: 5360,
    status: 'released',
    paymentMethod: 'wallet',
    paymentRef: 'WLT-2025-003',
    releasedAt: '2025-01-22T17:30:00Z',
    createdAt: '2025-01-21T11:00:00Z',
    updatedAt: '2025-01-22T17:30:00Z',
    quoteTitle: 'Reparación de puerta y cerradura',
    counterparty: 'Jorge Ramírez',
  },
  {
    id: 'txn_006',
    quoteId: 'q_006',
    amount: 35000,
    currency: 'ARS',
    platformFee: 2800,
    status: 'disputed',
    paymentMethod: 'transfer',
    paymentRef: 'TRF-2025-004',
    createdAt: '2025-01-22T13:45:00Z',
    updatedAt: '2025-01-23T09:00:00Z',
    quoteTitle: 'Limpieza profunda de hogar',
    counterparty: 'Ana Martínez',
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'held':
      return {
        label: 'Retenido',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-700',
        icon: Lock,
      };
    case 'released':
      return {
        label: 'Liberado',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: CheckCircle,
      };
    case 'refunded':
      return {
        label: 'Reembolsado',
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        icon: RotateCcw,
      };
    case 'disputed':
      return {
        label: 'En disputa',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: AlertTriangle,
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        icon: Clock,
      };
  }
}

function getPaymentMethodBadge(method: string) {
  switch (method) {
    case 'credit_card':
      return { label: 'Tarjeta de crédito', icon: CreditCard, color: 'text-blue-600 bg-blue-50' };
    case 'debit_card':
      return { label: 'Tarjeta de débito', icon: CreditCard, color: 'text-purple-600 bg-purple-50' };
    case 'transfer':
      return { label: 'Transferencia', icon: Banknote, color: 'text-green-600 bg-green-50' };
    case 'wallet':
      return { label: 'Billetera virtual', icon: Smartphone, color: 'text-blue-600 bg-blue-50' };
    default:
      return { label: method, icon: CreditCard, color: 'text-gray-600 bg-gray-50' };
  }
}

export function PaymentsScreen() {
  const { goBack } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null);

  const filtered = demoTransactions.filter((t) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'held') return t.status === 'held';
    if (activeTab === 'released') return t.status === 'released';
    if (activeTab === 'refunded') return t.status === 'refunded';
    return true;
  });

  const totalHeld = demoTransactions
    .filter((t) => t.status === 'held' || t.status === 'disputed')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalReleased = demoTransactions
    .filter((t) => t.status === 'released')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalRefunded = demoTransactions
    .filter((t) => t.status === 'refunded')
    .reduce((acc, t) => acc + t.amount, 0);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'held', label: 'Retenidos' },
    { key: 'released', label: 'Liberados' },
    { key: 'refunded', label: 'Reembolsados' },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={goBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Mis Pagos</h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">Historial de transacciones</p>
          </div>
          <div className="p-2 rounded-xl bg-blue-50">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg bg-yellow-50 flex items-center justify-center">
                <Lock className="h-3.5 w-3.5 text-yellow-600" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Retenido</p>
            <p className="text-base font-bold text-yellow-700 mt-0.5">{formatCurrency(totalHeld)}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Liberado</p>
            <p className="text-base font-bold text-green-700 mt-0.5">{formatCurrency(totalReleased)}</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                <RotateCcw className="h-3.5 w-3.5 text-red-500" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Reembolso</p>
            <p className="text-base font-bold text-red-600 mt-0.5">{formatCurrency(totalRefunded)}</p>
          </div>
        </div>

        {/* Escrow Info Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-3.5 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Pago protegido con Escrow</p>
              <p className="text-xs text-blue-600/80 mt-0.5 leading-relaxed">
                Tu dinero se retiene de forma segura hasta que confirmes que el trabajo fue realizado correctamente.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1.5 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Eye className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No hay pagos</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'all'
                ? 'Aún no realizaste ninguna transacción'
                : `No hay pagos ${tabs.find((t) => t.key === activeTab)?.label.toLowerCase() || ''} por el momento`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((txn) => {
              const statusCfg = getStatusConfig(txn.status);
              const methodCfg = getPaymentMethodBadge(txn.paymentMethod);
              const StatusIcon = statusCfg.icon;
              const MethodIcon = methodCfg.icon;
              const isExpanded = selectedTxn === txn.id;

              return (
                <button
                  key={txn.id}
                  onClick={() => setSelectedTxn(isExpanded ? null : txn.id)}
                  className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left transition-all hover:shadow-md active:scale-[0.99]"
                >
                  <div className="p-4">
                    {/* Top row: status + amount */}
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(txn.amount)}</p>
                    </div>

                    {/* Quote title */}
                    <p className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                      {txn.quoteTitle}
                    </p>

                    {/* Counterparty */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">
                          {txn.counterparty.charAt(0)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{txn.counterparty}</p>
                    </div>

                    {/* Bottom row: date + payment method + fee */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span className="text-[11px]">{formatDate(txn.createdAt)}</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${methodCfg.color}`}
                      >
                        <MethodIcon className="h-3 w-3" />
                        {methodCfg.label}
                      </span>
                    </div>

                    {/* Expand hint */}
                    <div className="flex items-center justify-center mt-3 pt-2 border-t border-gray-50">
                      <span className="text-[11px] text-gray-400">
                        {isExpanded ? 'Tocá para cerrar' : 'Tocá para ver detalle'}
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 text-gray-400 ml-0.5 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                      <div className="pt-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Monto total</span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(txn.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Comisión plataforma (8%)</span>
                          <span className="text-sm font-semibold text-blue-600">
                            - {formatCurrency(txn.platformFee)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Neto profesional</span>
                          <span className="text-sm font-semibold text-gray-700">
                            {formatCurrency(txn.amount - txn.platformFee)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Referencia</span>
                          <span className="text-xs font-mono text-gray-500">{txn.paymentRef}</span>
                        </div>
                        {txn.releasedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Fecha liberación</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(txn.releasedAt)}
                            </span>
                          </div>
                        )}
                        {txn.refundedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Fecha reembolso</span>
                            <span className="text-xs text-gray-500">
                              {formatDate(txn.refundedAt)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 pt-1">
                          <Shield className="h-3 w-3 text-blue-400" />
                          <span className="text-[10px] text-blue-500 font-medium">
                            Transacción protegida por escrow
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom info */}
        <div className="text-center py-2">
          <p className="text-[10px] text-gray-400">
            Todas las transacciones están protegidas con nuestro sistema de escrow
          </p>
        </div>
      </div>
    </div>
  );
}
