'use client';

import { useState, useRef, useMemo } from 'react';
import { useAppStore } from '@/store/app-store';
import { SplashScreen, OnboardingScreen } from '@/components/app/splash-screen';
import { HomeScreen } from '@/components/app/home-screen';
import { NeedDetailScreen } from '@/components/app/need-detail-screen';
import { CreateNeedScreen } from '@/components/app/create-need-screen';
import { ChatListScreen, ChatScreen } from '@/components/app/chat-list-screen';
import { ProfileScreen } from '@/components/app/profile-screen';
import { ProfessionalProfileScreen } from '@/components/app/pro-profile-screen';
import { RegisterProfessionalScreen } from '@/components/app/register-pro-screen';
import { BottomNav } from '@/components/app/bottom-nav';
import { SearchOverlay } from '@/components/app/search-overlay';
import { UserRatingDialog } from '@/components/app/user-rating-dialog';
import { WebLandingScreen } from '@/components/app/web-landing-screen';
import { QuotesScreen } from '@/components/app/quotes-screen';
import { CreateQuoteScreen } from '@/components/app/create-quote-screen';
import { QuoteDetailScreen } from '@/components/app/quote-detail-screen';
import { PaymentsScreen } from '@/components/app/payments-screen';
import { CheckInScreen } from '@/components/app/check-in-screen';
import { DisputeScreen } from '@/components/app/dispute-screen';
import { AnimatePresence, motion } from 'framer-motion';
import { ARGENTINA_PROVINCES, getCitiesByProvince, isCaba } from '@/lib/argentina-locations';

// Helper: format ARS price
function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price);
}

// Helper: compress image before upload
async function compressImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('No canvas context')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to compress image'));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// Views that show the full-page layout (web landing, no max-width constraint)
const fullWidthViews = ['web-landing'];

// Views that show the bottom navigation
const navViews = ['home', 'chat-list', 'profile', 'search', 'quotes', 'payments'];

export default function AppContainer() {
  const { currentView } = useAppStore();
  const isFullWidth = fullWidthViews.includes(currentView);
  const showNav = navViews.includes(currentView);

  return (
    <div className={`flex flex-col ${isFullWidth ? 'min-h-screen' : 'h-[100dvh]'} ${isFullWidth ? '' : 'max-w-lg mx-auto'} bg-background relative overflow-hidden`}>
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={isFullWidth ? {} : pageVariants}
            initial={isFullWidth ? undefined : 'initial'}
            animate={isFullWidth ? undefined : 'animate'}
            exit={isFullWidth ? undefined : 'exit'}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={isFullWidth ? '' : 'absolute inset-0 overflow-y-auto'}
          >
            {currentView === 'splash' && <SplashScreen />}
            {currentView === 'onboarding' && <OnboardingScreen />}
            {currentView === 'web-landing' && <WebLandingScreen />}
            {currentView === 'home' && <HomeScreen />}
            {currentView === 'need-detail' && <NeedDetailScreen />}
            {currentView === 'create-need' && <CreateNeedScreen />}
            {currentView === 'chat-list' && <ChatListScreen />}
            {currentView === 'chat' && <ChatScreen />}
            {currentView === 'profile' && <ProfileScreen />}
            {currentView === 'edit-profile' && <EditProfileScreen />}
            {currentView === 'search' && <SearchOverlay />}
            {currentView === 'pro-profile' && <ProfessionalProfileScreen />}
            {currentView === 'register-pro' && <RegisterProfessionalScreen />}
            {currentView === 'quotes' && <QuotesScreen />}
            {currentView === 'create-quote' && <CreateQuoteScreen />}
            {currentView === 'quote-detail' && <QuoteDetailScreen />}
            {currentView === 'payments' && <PaymentsScreen />}
            {currentView === 'check-in' && <CheckInScreen />}
            {currentView === 'dispute' && <DisputeScreen />}
          </motion.div>
        </AnimatePresence>
      </div>

      {showNav && (
        <div className="border-t bg-background pb-[env(safe-area-inset-bottom)]">
          <BottomNav />
        </div>
      )}

      <UserRatingDialog />
    </div>
  );
}

function EditProfileScreen() {
  const { setView, currentUser, setCurrentUser } = useAppStore();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone ? currentUser.phone.replace('+54', '') : '');
  const [province, setProvince] = useState(currentUser?.province || '');
  const [city, setCity] = useState(currentUser?.city || '');
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || '');
  const [neighborhoodQuery, setNeighborhoodQuery] = useState(currentUser?.neighborhood || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false);
  const neighborhoodRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => getCitiesByProvince(province), [province]);
  const neighborhoods = useMemo(() => {
    if (!city || !province) return [];
    const q = neighborhoodQuery.toLowerCase();
    if (!q) return getCitiesByProvince(province);
    return getCitiesByProvince(province).filter(c => c.toLowerCase().includes(q));
  }, [city, province, neighborhoodQuery]);
  const showNeighborhoodField = province && city && !isCaba(province);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const phoneDigits = phone.replace(/\D/g, '');
      const updates: Record<string, unknown> = {
        name: name.trim(),
        province: province.trim() || null,
        city: city.trim() || null,
        neighborhood: neighborhood.trim() || null,
        bio: bio.trim() || null,
      };
      if (phoneDigits.length >= 8) {
        updates.phone = '+54' + phoneDigits;
      }
      const res = await fetch(`/api/users/${currentUser?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser({ ...currentUser!, ...updatedUser });
        setSaved(true);
        setTimeout(() => setView('profile'), 800);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handlePhotoClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }
      setUploadingPhoto(true);
      try {
        // Compress image before upload (max 400x400, JPEG 0.8 quality)
        const compressed = await compressImage(file, 400, 400, 0.8);
        const formData = new FormData();
        formData.append('avatar', new File([compressed], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
        const res = await fetch(`/api/users/${currentUser?.id}/avatar`, {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser({ ...currentUser!, avatar: data.avatarUrl });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(errData.error || 'Error al subir la imagen. Intentá de nuevo.');
        }
      } catch (err) {
        console.error('Photo upload error:', err);
        alert('Error de conexión al subir la imagen.');
      }
      setUploadingPhoto(false);
    };
    input.click();
  };

  return (
    <div className="min-h-full p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setView('profile')} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Editar perfil</h1>
      </div>

      {/* Avatar upload */}
      <div className="flex items-center gap-4 mb-6">
        {currentUser?.avatar ? (
          <div className="w-20 h-20 rounded-2xl overflow-hidden relative">
            <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
            {uploadingPhoto && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center relative">
            <span className="text-3xl font-bold text-blue-500">{currentUser?.name?.charAt(0)}</span>
            {uploadingPhoto && <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>}
          </div>
        )}
        <div>
          <button
            onClick={handlePhotoClick}
            disabled={uploadingPhoto}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}
          </button>
          <p className="text-[10px] text-muted-foreground mt-1">JPG o PNG, máximo 5MB</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Nombre</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 rounded-lg border bg-background text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Teléfono</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">+54</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                if (digits.length <= 11) setPhone(digits);
              }}
              className="flex-1 p-3 rounded-lg border bg-background text-sm"
              placeholder="11 12345678"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Código de área + número (sin 0 ni 15)</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1 block">Provincia</label>
          <select
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setCity('');
              setNeighborhood('');
              setNeighborhoodQuery('');
            }}
            className="w-full p-3 rounded-lg border bg-background text-sm"
          >
            <option value="">Seleccioná tu provincia</option>
            {ARGENTINA_PROVINCES.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {province && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">{isCaba(province) ? 'Barrio *' : 'Ciudad *'}</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (isCaba(province)) {
                  setNeighborhood(e.target.value);
                } else {
                  setNeighborhood('');
                  setNeighborhoodQuery('');
                }
              }}
              className="w-full p-3 rounded-lg border bg-background text-sm"
            >
              <option value="">{isCaba(province) ? 'Seleccioná tu barrio' : 'Seleccioná tu ciudad'}</option>
              {cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
        {showNeighborhoodField && (
          <div ref={neighborhoodRef} className="relative">
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Barrio</label>
            <input
              type="text"
              placeholder="Buscá o seleccioná tu barrio..."
              value={neighborhoodQuery}
              onChange={(e) => {
                setNeighborhoodQuery(e.target.value);
                setNeighborhood(e.target.value);
                setShowNeighborhoodDropdown(true);
              }}
              onFocus={() => setShowNeighborhoodDropdown(true)}
              onBlur={() => setTimeout(() => setShowNeighborhoodDropdown(false), 200)}
              className="w-full p-3 rounded-lg border bg-background text-sm"
            />
            {showNeighborhoodDropdown && neighborhoods.length > 0 && (
              <div className="absolute z-20 top-full mt-1 w-full max-h-48 overflow-y-auto rounded-lg border bg-white shadow-lg">
                {neighborhoods.filter(n => n.toLowerCase() !== neighborhoodQuery.toLowerCase()).slice(0, 10).map(n => (
                  <button
                    key={n}
                    type="button"
                    onMouseDown={() => {
                      setNeighborhood(n);
                      setNeighborhoodQuery(n);
                      setShowNeighborhoodDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {currentUser?.profession && (
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">Sobre mí</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 rounded-lg border bg-background text-sm min-h-[100px]" rows={3} placeholder="Contá sobre tu experiencia..." />
          </div>
        )}
      </div>

      {saved && (
        <p className="text-green-600 text-sm text-center mt-4 font-medium">Cambios guardados correctamente</p>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full mt-6 bg-blue-500 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </div>
  );
}


