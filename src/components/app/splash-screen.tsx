'use client';

import { useEffect, useState, useRef } from 'react';
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
    <div className="min-h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 px-8">
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">Resolvé</h1>
      <p className="text-blue-100 text-center text-base">
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const phoneRef = useRef<HTMLInputElement>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhone(raw);
    // Restore cursor position
    requestAnimationFrame(() => {
      if (phoneRef.current) {
        const pos = Math.min(raw.length, e.target.selectionStart || raw.length);
        phoneRef.current.setSelectionRange(pos, pos);
      }
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: password,
          phone: phone.trim(),
          neighborhood: neighborhood.trim() || undefined,
        }),
      });

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setView('home'); // After onboarding, go to app home
      } else {
        const data = await res.json();
        setError(data.error || 'Error al crear cuenta');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Intentá de nuevo.');
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
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 pt-12 pb-10 rounded-b-[2rem]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">Resolvé</span>
        </div>
        <p className="text-blue-100 text-center text-sm">
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
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tu email *</label>
            <input
              type="email"
              placeholder="Ej: maria@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pr-11 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tu teléfono *</label>
            <input
              ref={phoneRef}
              type="tel"
              placeholder="Ej: 11 1234-5678"
              value={phone}
              onChange={handlePhoneChange}
              inputMode="numeric"
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tu barrio</label>
            <input
              type="text"
              placeholder="Ej: Palermo, Caballito..."
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !phone.trim() || !email.trim() || !password.trim() || isSubmitting}
          className="w-full mt-8 bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {isSubmitting ? 'Creando cuenta...' : 'Creá tu cuenta'}
        </button>

        {error && (
          <p className="text-red-500 text-xs text-center mt-3">{error}</p>
        )}

        <button
          onClick={handleDemoLogin}
          className="w-full mt-3 py-3.5 rounded-xl font-semibold text-sm text-blue-600 hover:bg-blue-50 transition-all"
        >
          Entrar como demo (ver datos de ejemplo)
        </button>
      </div>
    </div>
  );
}
