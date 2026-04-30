'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type AdminStats, type Quote } from '@/store/app-store';
import {
  ArrowLeft,
  Users,
  UserCheck,
  FileText,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  Shield,
  Clock,
  Star,
  Search,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { formatBudget } from './home-screen';

function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AdminDashboardScreen() {
  const { goBack, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'quotes' | 'disputes'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  const [openDisputes, setOpenDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/users?limit=100&search=${userSearch}`),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.data.stats);
        setRecentQuotes(data.data.recentQuotes || []);
        setOpenDisputes(data.data.openDisputes || []);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [userSearch]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch(`/api/admin/users?limit=100&search=${userSearch}`),
        ]);
        if (!mounted) return;
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data.data.stats);
          setRecentQuotes(data.data.recentQuotes || []);
          setOpenDisputes(data.data.openDisputes || []);
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.data || []);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [userSearch]);

  const handleVerifyUser = async (userId: string) => {
    setActionLoading(userId);
    try {
      await fetch('/api/admin/resolve-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_user', userId }),
      });
      // Trigger re-fetch by toggling userSearch
      setUserSearch((s) => s);
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleResolveDispute = async (disputeId: string) => {
    setActionLoading(disputeId);
    try {
      await fetch('/api/admin/resolve-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_dispute',
          disputeId,
          resolution: 'Disputa resuelta por el administrador de Resolvé.',
        }),
      });
      setUserSearch((s) => s);
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleToggleVerified = async (userId: string) => {
    setActionLoading(userId);
    try {
      await fetch('/api/admin/resolve-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_verified', userId }),
      });
      setUserSearch((s) => s);
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  if (!currentUser) return null;

  // Check admin access
  const isAdmin = currentUser.phone?.includes('admin') || currentUser.email?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="min-h-full bg-gray-50">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={goBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Admin</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-20 px-8">
          <Shield className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-bold text-gray-500 mb-2">Acceso restringido</h2>
          <p className="text-sm text-gray-400 text-center">Solo los administradores pueden acceder a este panel.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview' as const, label: 'Resumen', icon: Eye },
    { key: 'users' as const, label: 'Usuarios', icon: Users },
    { key: 'quotes' as const, label: 'Presup.', icon: FileText },
    { key: 'disputes' as const, label: 'Disputas', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Panel de Admin</h1>
            <p className="text-[11px] text-gray-400 -mt-0.5">Gestión de plataforma</p>
          </div>
          <button
            onClick={() => { setLoading(true); setUserSearch(''); }}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {tab.key === 'disputes' && stats?.openDisputes ? (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    isActive ? 'bg-white/20' : 'bg-red-100 text-red-600'
                  }`}>
                    {stats.openDisputes}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading && !stats ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse shadow-sm">
                <div className="h-20 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* ====== OVERVIEW TAB ====== */}
            {activeTab === 'overview' && stats && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={Users}
                    label="Total usuarios"
                    value={stats.totalUsers.toString()}
                    color="bg-blue-50 text-blue-600"
                  />
                  <StatCard
                    icon={UserCheck}
                    label="Profesionales"
                    value={stats.totalProfessionals.toString()}
                    color="bg-emerald-50 text-emerald-600"
                  />
                  <StatCard
                    icon={FileText}
                    label="Presup. activos"
                    value={stats.activeQuotes.toString()}
                    color="bg-purple-50 text-purple-600"
                  />
                  <StatCard
                    icon={CheckCircle}
                    label="Trabajos completados"
                    value={stats.completedJobs.toString()}
                    color="bg-green-50 text-green-600"
                  />
                  <StatCard
                    icon={DollarSign}
                    label="Ingresos totales"
                    value={formatARS(stats.totalRevenue)}
                    color="bg-amber-50 text-amber-600"
                  />
                  <StatCard
                    icon={AlertTriangle}
                    label="Disputas abiertas"
                    value={stats.openDisputes.toString()}
                    color="bg-red-50 text-red-600"
                  />
                </div>

                {/* Pending verifications */}
                {stats.pendingVerifications > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-semibold text-amber-700">
                          {stats.pendingVerifications} verificaciones pendientes
                        </p>
                        <p className="text-xs text-amber-600">
                          Profesionales esperando verificación de identidad
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="mt-3 w-full bg-amber-500 text-white py-2 rounded-xl text-xs font-semibold hover:bg-amber-600"
                    >
                      Revisar verificaciones
                    </button>
                  </div>
                )}

                {/* Quick actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Acciones rápidas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                    >
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">Verificar usuario</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('disputes')}
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-colors text-left"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-xs font-semibold text-red-700">Resolver disputa</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ====== USERS TAB ====== */}
            {activeTab === 'users' && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No se encontraron usuarios</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-bold text-blue-600">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h4>
                              {user.dniVerified && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[9px] font-semibold">
                                  <Shield className="h-2.5 w-2.5" />
                                  Verif.
                                </span>
                              )}
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                                user.profession
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {user.profession ? 'Pro' : 'Cliente'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{user.email || user.phone}</p>
                            {user.profession && (
                              <p className="text-[10px] text-blue-500">{user.profession}</p>
                            )}
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-amber-400" />
                                {user.ratingAvg} ({user.ratingCount})
                              </span>
                              <span>{user.completedJobs} trabajos</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDate(user.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                          <button
                            onClick={() => handleToggleVerified(user.id)}
                            disabled={actionLoading === user.id}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                              user.verified
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}
                          >
                            {actionLoading === user.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Shield className="h-3 w-3" />
                            )}
                            {user.verified ? 'Desverificar' : 'Verificar'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {/* ====== QUOTES TAB ====== */}
            {activeTab === 'quotes' && (
              <div className="space-y-2">
                {recentQuotes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No hay presupuestos recientes</p>
                  </div>
                ) : (
                  recentQuotes.map((q: any) => (
                    <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{q.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {q.client?.name} → {q.provider?.name}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                          q.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
                          q.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                          q.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {q.status === 'accepted' ? 'Aceptado' :
                           q.status === 'pending' ? 'Pendiente' :
                           q.status === 'completed' ? 'Completado' :
                           q.status === 'rejected' ? 'Rechazado' : q.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatARS(q.amount)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(q.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ====== DISPUTES TAB ====== */}
            {activeTab === 'disputes' && (
              <div className="space-y-2">
                {openDisputes.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-10 w-10 text-emerald-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">¡No hay disputas abiertas!</p>
                    <p className="text-xs text-gray-400 mt-1">Todo tranquilo por ahora</p>
                  </div>
                ) : (
                  openDisputes.map((d: any) => (
                    <div key={d.id} className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">{d.reason}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{d.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="font-medium">Presupuesto:</span>
                          <span>{d.quote?.title} · {formatARS(d.quote?.amount || 0)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="font-medium">Reportado por:</span>
                          <span>{d.filedBy?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-500">
                          <span className="font-medium">Contra:</span>
                          <span>{d.against?.name}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleResolveDispute(d.id)}
                        disabled={actionLoading === d.id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      >
                        {actionLoading === d.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Resolver disputa
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className={`w-8 h-8 rounded-lg ${color.split(' ')[0]} flex items-center justify-center mb-2`}>
        <Icon className={`h-4 w-4 ${color.split(' ')[1]}`} />
      </div>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
      <p className="text-base font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
