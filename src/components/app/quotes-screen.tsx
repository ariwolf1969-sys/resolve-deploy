'use client';

import { useState, useMemo } from 'react';
import { useAppStore, type Quote } from '@/store/app-store';
import {
  FileText,
  Clock,
  DollarSign,
  ChevronRight,
  Plus,
  User,
  Calendar,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// ====== Demo Data ======
const DEMO_QUOTES: Quote[] = [
  {
    id: 'q-001',
    title: 'Reparación de cañería en cocina',
    description: 'Fuga de agua en la cañería principal de la cocina. Se necesita reemplazar un tramo de tubería de PVC de aproximadamente 2 metros y verificar las uniones.',
    amount: 45000,
    currency: 'ARS',
    status: 'pending',
    providerId: 'pro-1',
    clientId: 'cli-1',
    validityHours: 48,
    includesMaterials: true,
    estimatedHours: 3,
    providerMessage: 'Hola, puedo ir mañana temprano. El precio incluye materiales.',
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'pro-1',
      name: 'Carlos Méndez',
      profession: 'Plomero',
      ratingAvg: 4.8,
      ratingCount: 42,
      dniVerified: true,
    },
    client: {
      id: 'cli-1',
      name: 'María García',
      ratingAvg: 4.5,
      ratingCount: 8,
    },
  },
  {
    id: 'q-002',
    title: 'Instalación de aire acondicionado split',
    description: 'Instalación completa de aire acondicionado split 12000 BTU en habitación de 3x4m. Incluye la colocación del equipo interior, tubería de cobre, drenaje y conexión eléctrica.',
    amount: 85000,
    currency: 'ARS',
    status: 'accepted',
    providerId: 'pro-1',
    clientId: 'cli-2',
    validityHours: 72,
    includesMaterials: false,
    estimatedHours: 5,
    providerMessage: 'Presupuesto sin materiales. El cliente ya tiene el equipo.',
    acceptedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'pro-1',
      name: 'Carlos Méndez',
      profession: 'Plomero',
      ratingAvg: 4.8,
      ratingCount: 42,
      dniVerified: true,
    },
    client: {
      id: 'cli-2',
      name: 'Juan Pérez',
      ratingAvg: 4.2,
      ratingCount: 5,
    },
  },
  {
    id: 'q-003',
    title: 'Pintura de dormitorio completo',
    description: 'Pintar las paredes y techo de un dormitorio de 4x5m con dos manos de látex premium de color a elección. Preparación previa de paredes con masilla y lija.',
    amount: 120000,
    currency: 'ARS',
    status: 'rejected',
    providerId: 'pro-2',
    clientId: 'cli-1',
    validityHours: 24,
    includesMaterials: true,
    estimatedHours: 8,
    providerMessage: 'El precio incluye pintura y materiales de preparación.',
    rejectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'pro-2',
      name: 'Lucía Torres',
      profession: 'Pintora',
      ratingAvg: 4.6,
      ratingCount: 28,
      dniVerified: true,
    },
    client: {
      id: 'cli-1',
      name: 'María García',
      ratingAvg: 4.5,
      ratingCount: 8,
    },
  },
  {
    id: 'q-004',
    title: 'Cambio de cerradura de puerta principal',
    description: 'Reemplazo de cerradura de puerta principal de entrada por una cerradura de seguridad con cilindro europeo. Incluye la cerradura y la instalación completa.',
    amount: 35000,
    currency: 'ARS',
    status: 'completed',
    providerId: 'pro-3',
    clientId: 'cli-1',
    validityHours: 48,
    includesMaterials: true,
    estimatedHours: 2,
    providerMessage: 'Cerradura de alta seguridad con 5 llaves incluidas.',
    acceptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'pro-3',
      name: 'Roberto Sánchez',
      profession: 'Cerrajero',
      ratingAvg: 4.9,
      ratingCount: 67,
      dniVerified: true,
    },
    client: {
      id: 'cli-1',
      name: 'María García',
      ratingAvg: 4.5,
      ratingCount: 8,
    },
  },
  {
    id: 'q-005',
    title: 'Mudanza de departamento 2 ambientes',
    description: 'Servicio completo de mudanza de un depto de 2 ambientes con mobiliario estándar. Incluye embalaje de objetos frágiles, transporte y descarga en nuevo domicilio.',
    amount: 180000,
    currency: 'ARS',
    status: 'cancelled',
    providerId: 'pro-4',
    clientId: 'cli-1',
    validityHours: 72,
    includesMaterials: true,
    estimatedHours: 6,
    providerMessage: 'Servicio completo con camión y 2 ayudantes.',
    expiresAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'pro-4',
      name: 'Diego Ramírez',
      profession: 'Mudanzas',
      ratingAvg: 4.3,
      ratingCount: 15,
      dniVerified: false,
    },
    client: {
      id: 'cli-1',
      name: 'María García',
      ratingAvg: 4.5,
      ratingCount: 8,
    },
  },
  {
    id: 'q-006',
    title: 'Reparación de electrodoméstico - Heladera',
    description: 'La heladera no enfría correctamente. Se sospecha de un problema con el termostato o el gas refrigerante. Diagnóstico y reparación completa.',
    amount: 55000,
    currency: 'ARS',
    status: 'pending',
    providerId: 'pro-1',
    clientId: 'cli-3',
    validityHours: 24,
    includesMaterials: false,
    estimatedHours: 2,
    providerMessage: 'Diagnóstico gratuito. El costo de reparación depende de la falla detectada.',
    expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    provider: {
      id: 'pro-1',
      name: 'Carlos Méndez',
      profession: 'Técnico en refrigeración',
      ratingAvg: 4.8,
      ratingCount: 42,
      dniVerified: true,
    },
    client: {
      id: 'cli-3',
      name: 'Ana López',
      ratingAvg: 4.0,
      ratingCount: 3,
    },
  },
];

// ====== Helpers ======
const CURRENT_USER_ID = 'cli-1'; // Demo: current user is María García

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Ahora mismo';
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours}h`;
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
  });
}

function getExpiryCountdown(expiresAt: string, status: string): string | null {
  if (status !== 'pending') return null;
  const remaining = new Date(expiresAt).getTime() - Date.now();
  if (remaining <= 0) return 'Vencido';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return `Vence en ${days}d ${remainHours}h`;
  }
  if (hours > 0) return `Vence en ${hours}h ${minutes}min`;
  return `Vence en ${minutes}min`;
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pendiente',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'accepted':
      return {
        label: 'Aceptado',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'rejected':
      return {
        label: 'Rechazado',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-500',
      };
    case 'completed':
      return {
        label: 'Completado',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'cancelled':
      return {
        label: 'Cancelado',
        bg: 'bg-gray-50',
        text: 'text-gray-500',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
      };
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ====== Sub-Components ======

function StatusBadge({ status }: { status: string }) {
  const config = getStatusConfig(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function QuoteCard({ quote, otherUserLabel, onClick }: { quote: Quote; otherUserLabel: string; onClick: () => void }) {
  const expiryCountdown = getExpiryCountdown(quote.expiresAt, quote.status);
  const avatarColor =
    quote.status === 'completed'
      ? 'bg-blue-500'
      : quote.status === 'accepted'
      ? 'bg-emerald-500'
      : quote.status === 'rejected'
      ? 'bg-red-500'
      : quote.status === 'cancelled'
      ? 'bg-gray-400'
      : 'bg-orange-500';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all duration-200 active:scale-[0.99] group"
    >
      {/* Top row: status + amount */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={quote.status} />
        <span className="text-lg font-bold text-foreground">{formatARS(quote.amount)}</span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2">
        {quote.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
        {quote.description}
      </p>

      {/* Other user info */}
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar className="h-7 w-7">
          <AvatarFallback className={`text-[10px] font-bold text-white ${avatarColor}`}>
            {getInitials(quote.provider.id === CURRENT_USER_ID ? quote.client.name : quote.provider.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">
            {quote.provider.id === CURRENT_USER_ID ? quote.client.name : quote.provider.name}
          </p>
          <p className="text-[10px] text-muted-foreground">{otherUserLabel}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-400 transition-colors shrink-0" />
      </div>

      {/* Bottom row: date + expiry */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{getRelativeTime(quote.createdAt)}</span>
        </div>
        {expiryCountdown && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
            <Clock className="h-3 w-3" />
            <span>{expiryCountdown}</span>
          </div>
        )}
        {quote.status === 'completed' && (
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <CheckIcon className="h-3 w-3" />
            <span>Finalizado</span>
          </div>
        )}
      </div>
    </button>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
        <FileText className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">No hay presupuestos</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        Aún no tenés presupuestos en esta sección. Los presupuestos que enviés o recibas aparecerán aquí.
      </p>
    </div>
  );
}

// ====== Main Component ======
export function QuotesScreen() {
  const { setView, setSelectedQuote } = useAppStore();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const receivedQuotes = useMemo(
    () => DEMO_QUOTES.filter((q) => q.clientId === CURRENT_USER_ID),
    []
  );

  const sentQuotes = useMemo(
    () => DEMO_QUOTES.filter((q) => q.providerId === CURRENT_USER_ID),
    []
  );

  const currentQuotes = activeTab === 'received' ? receivedQuotes : sentQuotes;

  const handleQuoteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setView('quote-detail');
  };

  const handleCreateQuote = () => {
    setView('create-quote');
  };

  return (
    <div className="min-h-full bg-gray-50/50 relative">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 pt-10 pb-3">
          <h1 className="text-xl font-bold text-foreground">Presupuestos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gestiona tus presupuestos enviados y recibidos
          </p>
        </div>

        {/* Tab bar */}
        <div className="px-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'received'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Recibidos
              {receivedQuotes.length > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === 'received'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {receivedQuotes.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'sent'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Enviados
              {sentQuotes.length > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === 'sent'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {sentQuotes.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quote list */}
      <div className="p-4 space-y-3 pb-24">
        {currentQuotes.length > 0 ? (
          currentQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              otherUserLabel={
                activeTab === 'received' ? 'Profesional' : 'Cliente'
              }
              onClick={() => handleQuoteClick(quote)}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleCreateQuote}
        className="fixed bottom-24 right-4 w-14 h-14 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center transition-all active:scale-95 z-20 sm:right-[calc(50%-14rem)]"
        aria-label="Crear nuevo presupuesto"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
