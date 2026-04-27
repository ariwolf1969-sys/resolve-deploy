'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/app-store';

export function SplashScreen() {
  const { setView } = useAppStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      setView('web-landing');
    }, 2000);
    return () => clearTimeout(timer);
  }, [setView]);

  return (
    <div className="min-h-full flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 px-8">
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">Resolvé</h1>
      <p className="text-orange-100 text-center text-base">
        Lo que necesitás, cuando lo necesitás.
      </p>
      <div className="mt-8 flex gap-1">
        <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const { setView, setCurrentUser } = useAppStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          neighborhood: neighborhood.trim() || undefined,
          lat: -34.6037 + (Math.random() - 0.5) * 0.05,
          lng: -58.3816 + (Math.random() - 0.5) * 0.05,
        }),
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setView('home'); // After onboarding, go to app home
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  const handleDemoLogin = async () => {
    // Login as first demo user
    try {
      const res = await fetch('/api/users');
      const users = await res.json();
      if (users.length > 0) {
        setCurrentUser(users[0]);
        setView('home'); // Demo login goes to app home
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 pt-12 pb-10 rounded-b-[2rem]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">Resolvé</span>
        </div>
        <p className="text-orange-100 text-center text-sm">
          Conectamos personas que necesitan con personas que pueden ayudar.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-8">
        <h2 className="text-xl font-bold mb-1">Creá tu perfil</h2>
        <p className="text-muted-foreground text-sm mb-6">Solo toma 30 segundos</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tu nombre *</label>
            <input
              type="text"
              placeholder="Ej: Maria Garcia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tu teléfono *</label>
            <input
              type="tel"
              placeholder="Ej: +54 11 1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tu barrio</label>
            <input
              type="text"
              placeholder="Ej: Palermo, Caballito..."
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !phone.trim() || isSubmitting}
          className="w-full mt-8 bg-orange-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isSubmitting ? 'Creando perfil...' : 'Comenzar'}
        </button>

        <button
          onClick={handleDemoLogin}
          className="w-full mt-3 py-3.5 rounded-xl font-semibold text-sm text-orange-600 hover:bg-orange-50 transition-all"
        >
          Entrar como demo (ver datos de ejemplo)
        </button>
      </div>
    </div>
  );
}
