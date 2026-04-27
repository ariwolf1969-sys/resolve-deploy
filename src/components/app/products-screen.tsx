'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useAppStore, type AffiliateProduct } from '@/store/app-store';
import {
  Search,
  ArrowLeft,
  Star,
  ExternalLink,
  Filter,
  ShoppingBag,
  ChevronRight,
  Heart,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// ====== Source Configuration ======
const SOURCES = [
  { id: 'all', name: 'Todos', color: '#6B7280', bg: 'bg-gray-500' },
  { id: 'Amazon', name: 'Amazon', color: '#FF9900', bg: 'bg-orange-500' },
  { id: 'eBay', name: 'eBay', color: '#0064D2', bg: 'bg-blue-600' },
  { id: 'MercadoLibre', name: 'MercadoLibre', color: '#FFE600', bg: 'bg-yellow-400' },
  { id: 'AliExpress', name: 'AliExpress', color: '#FF4747', bg: 'bg-red-500' },
  { id: 'Temu', name: 'Temu', color: '#FB6F20', bg: 'bg-purple-600' },
  { id: 'SHEIN', name: 'SHEIN', color: '#E11B1B', bg: 'bg-pink-500' },
];

const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'Electrónica', name: 'Electrónica' },
  { id: 'Hogar', name: 'Hogar' },
  { id: 'Herramientas', name: 'Herramientas' },
  { id: 'Ropa', name: 'Ropa' },
  { id: 'Deportes', name: 'Deportes' },
  { id: 'Tecnología', name: 'Tecnología' },
];

function getSourceConfig(source: string) {
  return SOURCES.find((s) => s.id === source) || SOURCES[0];
}

// ====== Demo Products ======
const DEMO_PRODUCTS: AffiliateProduct[] = [
  {
    id: 'prod-1',
    title: 'Auriculares Bluetooth Inalámbricos con Cancelación de Ruido Pro',
    description: 'Auriculares over-ear premium con ANC, 40hs de batería y sonido Hi-Res',
    price: 85900,
    originalPrice: 129900,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://amazon.com',
    source: 'Amazon',
    category: 'Electrónica',
    brand: 'Sony',
    rating: 4.7,
    reviewCount: 2340,
    commission: 5,
    active: true,
    featured: true,
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'prod-2',
    title: 'Taladro Percutor Inalámbrico 20V con Kit de Accesorios',
    description: 'Taladro compacto con 2 baterías de litio, maletín y 50 accesorios incluidos',
    price: 125000,
    originalPrice: 178000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://mercadolibre.com.ar',
    source: 'MercadoLibre',
    category: 'Herramientas',
    brand: 'Bosch',
    rating: 4.5,
    reviewCount: 876,
    commission: 4,
    active: true,
    featured: true,
    createdAt: '2025-01-08T10:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z',
  },
  {
    id: 'prod-3',
    title: 'Smart TV 55" 4K UHD con WebOS y Chromecast Integrado',
    description: 'Television LED 55 pulgadas con resolución 4K, HDR10 y WiFi integrado',
    price: 398000,
    originalPrice: 520000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://ebay.com',
    source: 'eBay',
    category: 'Tecnología',
    brand: 'LG',
    rating: 4.3,
    reviewCount: 1520,
    commission: 3,
    active: true,
    featured: false,
    createdAt: '2025-01-05T10:00:00Z',
    updatedAt: '2025-01-12T10:00:00Z',
  },
  {
    id: 'prod-4',
    title: 'Zapatillas Running Ultralivianas para Entrenamiento Diario',
    description: 'Zapatillas deportivas con suela gel, transpirables y amortiguación superior',
    price: 48900,
    originalPrice: 68500,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://aliexpress.com',
    source: 'AliExpress',
    category: 'Deportes',
    brand: 'Nike',
    rating: 4.1,
    reviewCount: 3200,
    commission: 6,
    active: true,
    featured: false,
    createdAt: '2025-01-06T10:00:00Z',
    updatedAt: '2025-01-11T10:00:00Z',
  },
  {
    id: 'prod-5',
    title: 'Set de Sábanas Algodón Premium 300 Hilos King Size',
    description: 'Juego completo de sábanas con 2 fundas, tejido satén, anti-ácaros',
    price: 35600,
    originalPrice: undefined,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://temu.com',
    source: 'Temu',
    category: 'Hogar',
    brand: 'HomeStyle',
    rating: 4.4,
    reviewCount: 680,
    commission: 7,
    active: true,
    featured: false,
    createdAt: '2025-01-09T10:00:00Z',
    updatedAt: '2025-01-13T10:00:00Z',
  },
  {
    id: 'prod-6',
    title: 'Buzo Oversize Canguro Algodón Unisex - Colección Otoño',
    description: 'Buzón de algodón peinado, corte oversize, capucha con cordones',
    price: 18500,
    originalPrice: 28000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://shein.com',
    source: 'SHEIN',
    category: 'Ropa',
    brand: 'SHEIN',
    rating: 3.9,
    reviewCount: 5400,
    commission: 8,
    active: true,
    featured: true,
    createdAt: '2025-01-07T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: 'prod-7',
    title: 'Cargador Inalámbrico Rápido 15W para iPhone y Android',
    description: 'Base de carga Qi con indicador LED, compatible con todos los dispositivos',
    price: 12800,
    originalPrice: 19500,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://amazon.com',
    source: 'Amazon',
    category: 'Tecnología',
    brand: 'Anker',
    rating: 4.6,
    reviewCount: 4120,
    commission: 5,
    active: true,
    featured: false,
    createdAt: '2025-01-04T10:00:00Z',
    updatedAt: '2025-01-09T10:00:00Z',
  },
  {
    id: 'prod-8',
    title: 'Robot Aspiradora con Mapeo Láser y Estación de Vaciado',
    description: 'Aspiradora inteligente con navegación LiDAR, succión 4000Pa y app WiFi',
    price: 285000,
    originalPrice: 380000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://mercadolibre.com.ar',
    source: 'MercadoLibre',
    category: 'Hogar',
    brand: 'Roborock',
    rating: 4.8,
    reviewCount: 320,
    commission: 4,
    active: true,
    featured: true,
    createdAt: '2025-01-03T10:00:00Z',
    updatedAt: '2025-01-08T10:00:00Z',
  },
  {
    id: 'prod-9',
    title: 'Kit de Herramientas Mecánico 218 Piezas en Maletín',
    description: 'Juego completo de llaves, destornilladores, alicates y accesorios profesionales',
    price: 67800,
    originalPrice: undefined,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://ebay.com',
    source: 'eBay',
    category: 'Herramientas',
    brand: 'Stanley',
    rating: 4.5,
    reviewCount: 910,
    commission: 3,
    active: true,
    featured: false,
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-07T10:00:00Z',
  },
  {
    id: 'prod-10',
    title: 'Monitor Gaming Curvo 27" 165Hz QHD 1ms Response Time',
    description: 'Monitor para gamers con panel VA, FreeSync Premium, HDR400 y speakers',
    price: 245000,
    originalPrice: 310000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://aliexpress.com',
    source: 'AliExpress',
    category: 'Tecnología',
    brand: 'Samsung',
    rating: 4.6,
    reviewCount: 1870,
    commission: 6,
    active: true,
    featured: false,
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-06T10:00:00Z',
  },
  {
    id: 'prod-11',
    title: 'Campera Puffer Impermeable con Capucha - Invierno 2025',
    description: 'Abrigo con relleno de plumón sintético, resistente al agua y viento',
    price: 42500,
    originalPrice: 65000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://shein.com',
    source: 'SHEIN',
    category: 'Ropa',
    brand: 'SHEIN',
    rating: 4.0,
    reviewCount: 2300,
    commission: 8,
    active: true,
    featured: false,
    createdAt: '2025-01-11T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'prod-12',
    title: 'Mancuernas Ajustables 24kg par con Set de Discos',
    description: 'Par de mancuernas ajustables rápidas, incluye soporte de almacenamiento',
    price: 95000,
    originalPrice: 135000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://temu.com',
    source: 'Temu',
    category: 'Deportes',
    brand: 'Bowflex',
    rating: 4.4,
    reviewCount: 440,
    commission: 7,
    active: true,
    featured: true,
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z',
  },
  {
    id: 'prod-13',
    title: 'Teclado Mecánico RGB Gaming Switches Azules 60% Layout',
    description: 'Teclado compacto hot-swap, iluminación por tecla, cable USB-C desmontable',
    price: 52000,
    originalPrice: 78000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://amazon.com',
    source: 'Amazon',
    category: 'Tecnología',
    brand: 'Keychron',
    rating: 4.8,
    reviewCount: 1280,
    commission: 5,
    active: true,
    featured: false,
    createdAt: '2025-01-09T10:00:00Z',
    updatedAt: '2025-01-13T10:00:00Z',
  },
  {
    id: 'prod-14',
    title: 'Lámpara LED de Escritorio con Puerto USB y Regulador Táctil',
    description: 'Luz de escritorio 5 modos de brillo, brazo flexible, carga USB integrada',
    price: 15900,
    originalPrice: 22000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://mercadolibre.com.ar',
    source: 'MercadoLibre',
    category: 'Hogar',
    brand: 'Philips',
    rating: 4.2,
    reviewCount: 560,
    commission: 4,
    active: true,
    featured: false,
    createdAt: '2025-01-08T10:00:00Z',
    updatedAt: '2025-01-12T10:00:00Z',
  },
  {
    id: 'prod-15',
    title: 'Power Bank 20000mAh Carga Rápida PD 65W USB-C',
    description: 'Batería externa con carga rápida, puede cargar notebooks y celulares',
    price: 42000,
    originalPrice: 58000,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://ebay.com',
    source: 'eBay',
    category: 'Electrónica',
    brand: 'Xiaomi',
    rating: 4.7,
    reviewCount: 2890,
    commission: 3,
    active: true,
    featured: false,
    createdAt: '2025-01-07T10:00:00Z',
    updatedAt: '2025-01-11T10:00:00Z',
  },
  {
    id: 'prod-16',
    title: 'Flexómetro Profesional 5 Metros Magnético con Bloqueo',
    description: 'Cinta métrica robusta con imán, superficie de lectura bidireccional',
    price: 8900,
    originalPrice: undefined,
    currency: 'ARS',
    imageUrl: '',
    sourceUrl: 'https://aliexpress.com',
    source: 'AliExpress',
    category: 'Herramientas',
    brand: 'Makita',
    rating: 4.3,
    reviewCount: 1560,
    commission: 6,
    active: true,
    featured: false,
    createdAt: '2025-01-06T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
];

// ====== Helper Functions ======
function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDiscountPercent(price: number, originalPrice?: number): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function getSourceBadgeStyles(source: string): string {
  switch (source) {
    case 'Amazon':
      return 'bg-orange-500/10 text-orange-700 border-orange-200';
    case 'eBay':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'MercadoLibre':
      return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    case 'AliExpress':
      return 'bg-red-500/10 text-red-700 border-red-200';
    case 'Temu':
      return 'bg-purple-500/10 text-purple-700 border-purple-200';
    case 'SHEIN':
      return 'bg-pink-500/10 text-pink-700 border-pink-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}

function getSourceDotColor(source: string): string {
  switch (source) {
    case 'Amazon':
      return 'bg-orange-500';
    case 'eBay':
      return 'bg-blue-600';
    case 'MercadoLibre':
      return 'bg-yellow-500';
    case 'AliExpress':
      return 'bg-red-500';
    case 'Temu':
      return 'bg-purple-600';
    case 'SHEIN':
      return 'bg-pink-500';
    default:
      return 'bg-gray-500';
  }
}

function getSourceIconChar(source: string): string {
  switch (source) {
    case 'Amazon':
      return 'A';
    case 'eBay':
      return 'e';
    case 'MercadoLibre':
      return 'M';
    case 'AliExpress':
      return '🛒';
    case 'Temu':
      return 'T';
    case 'SHEIN':
      return 'S';
    default:
      return '📦';
  }
}

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <Star
          key={i}
          className="h-3 w-3 fill-yellow-400 text-yellow-400"
        />
      );
    } else if (i - 0.5 <= rating) {
      stars.push(
        <Star
          key={i}
          className="h-3 w-3 fill-yellow-400/50 text-yellow-400"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          className="h-3 w-3 text-gray-200"
        />
      );
    }
  }
  return stars;
}

// ====== Sub-Components ======

function LoadingSkeleton() {
  return (
    <div className="space-y-4 px-4 pb-6">
      {/* Source tabs skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
        ))}
      </div>
      {/* Category pills skeleton */}
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-16 shrink-0 rounded-full" />
        ))}
      </div>
      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
            <Skeleton className="w-full aspect-square rounded-none" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-5 w-1/2 rounded" />
              <div className="flex gap-1">
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
        <ShoppingBag className="h-10 w-10 text-gray-300" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1.5">
        {hasFilters ? 'Sin resultados' : 'No hay productos'}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {hasFilters
          ? 'Probá con otros filtros o términos de búsqueda para encontrar lo que buscás.'
          : 'No encontramos productos disponibles en este momento. Volvé más tarde.'}
      </p>
    </div>
  );
}

function ProductCard({
  product,
  onClick,
}: {
  product: AffiliateProduct;
  onClick: (product: AffiliateProduct) => void;
}) {
  const [liked, setLiked] = useState(false);
  const discount = getDiscountPercent(product.price, product.originalPrice);
  const sourceConfig = getSourceConfig(product.source);

  return (
    <div className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      {/* Image placeholder */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {/* Store icon placeholder */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
            style={{ backgroundColor: sourceConfig.color === '#FFE600' ? '#D4A800' : sourceConfig.color }}
          >
            {getSourceIconChar(product.source)}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">{product.brand || product.source}</span>
        </div>

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            -{discount}%
          </div>
        )}

        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          aria-label={liked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <Heart
            className={`h-3.5 w-3.5 transition-colors ${
              liked ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Source badge */}
        <div className="flex items-center gap-1 mb-1.5">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getSourceBadgeStyles(product.source)}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${getSourceDotColor(product.source)}`} />
            {product.source}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 mb-2 min-h-[2rem]">
          {product.title}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-px">
              {renderStars(product.rating)}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {product.rating}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({product.reviewCount > 999
                ? `${(product.reviewCount / 1000).toFixed(1)}k`
                : product.reviewCount})
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="mt-auto">
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-[11px] text-muted-foreground line-through block">
              {formatPrice(product.originalPrice)}
            </span>
          )}
          <p className="text-base font-bold text-foreground">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onClick(product)}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          Ver oferta
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ====== Main Component ======
export function ProductsScreen() {
  const {
    setView,
    setSelectedProduct,
    selectedProductSource,
    setSelectedProductSource,
    selectedProductCategory,
    setSelectedProductCategory,
    productSearchQuery,
    setProductSearchQuery,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sourcesScrollRef = useRef<HTMLDivElement>(null);

  // Simulate initial loading
  useMemo(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let products = DEMO_PRODUCTS;

    // Filter by search query
    if (productSearchQuery.trim()) {
      const query = productSearchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query)
      );
    }

    // Filter by source
    if (selectedProductSource !== 'all') {
      products = products.filter((p) => p.source === selectedProductSource);
    }

    // Filter by category
    if (selectedProductCategory !== 'all') {
      products = products.filter((p) => p.category === selectedProductCategory);
    }

    return products;
  }, [productSearchQuery, selectedProductSource, selectedProductCategory]);

  const hasActiveFilters =
    selectedProductSource !== 'all' || selectedProductCategory !== 'all' || productSearchQuery.trim() !== '';

  const handleSearchChange = useCallback(
    (value: string) => {
      setProductSearchQuery(value);
    },
    [setProductSearchQuery]
  );

  const handleClearSearch = useCallback(() => {
    setProductSearchQuery('');
    searchInputRef.current?.focus();
  }, [setProductSearchQuery]);

  const handleSourceChange = useCallback(
    (sourceId: string) => {
      setSelectedProductSource(sourceId);
    },
    [setSelectedProductSource]
  );

  const handleCategoryChange = useCallback(
    (catId: string) => {
      setSelectedProductCategory(catId);
    },
    [setSelectedProductCategory]
  );

  const handleProductClick = useCallback(
    (product: AffiliateProduct) => {
      setSelectedProduct(product);
      setView('product-detail');
    },
    [setSelectedProduct, setView]
  );

  const handleClearAllFilters = useCallback(() => {
    setProductSearchQuery('');
    setSelectedProductSource('all');
    setSelectedProductCategory('all');
  }, [setProductSearchQuery, setSelectedProductSource, setSelectedProductCategory]);

  if (isLoading) {
    return (
      <div className="min-h-full bg-gray-50/50">
        {/* Sticky header skeleton */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 pt-10 pb-3 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      {/* ====== Sticky Header with Search ====== */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        {/* Top bar */}
        <div className="px-4 pt-10 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setView('home')}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h1 className="text-lg font-bold text-foreground flex-1">
              Productos
            </h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                showFilters
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Filtros"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={productSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar productos, marcas..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-gray-100 border-none text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:bg-white transition-all"
            />
            {productSearchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 hover:bg-gray-400 rounded-full flex items-center justify-center transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <span className="text-white text-xs leading-none font-bold">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Source filter tabs */}
        <div className="border-b border-gray-100">
          <div
            ref={sourcesScrollRef}
            className="flex gap-1.5 overflow-x-auto px-4 py-2.5 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {SOURCES.map((source) => (
              <button
                key={source.id}
                onClick={() => handleSourceChange(source.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedProductSource === source.id
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={
                  selectedProductSource === source.id
                    ? { backgroundColor: source.color === '#FFE600' ? '#D4A800' : source.color }
                    : undefined
                }
              >
                {source.id !== 'all' && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${getSourceDotColor(source.id)}`}
                  />
                )}
                {source.name}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter pills */}
        {showFilters && (
          <div className="px-4 py-2.5 border-b border-gray-100">
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedProductCategory === cat.id
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ====== Results info bar ====== */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-50">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{filteredProducts.length}</span>{' '}
            {filteredProducts.length === 1 ? 'resultado' : 'resultados'}
          </p>
          <button
            onClick={handleClearAllFilters}
            className="flex items-center gap-1 text-xs text-orange-500 font-semibold hover:text-orange-600 transition-colors"
          >
            Limpiar filtros
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* ====== Product Grid ====== */}
      {filteredProducts.length > 0 ? (
        <div className="px-3 py-4 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={handleProductClick}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState hasFilters={hasActiveFilters} />
      )}
    </div>
  );
}
