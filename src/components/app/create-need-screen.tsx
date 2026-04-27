'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/app-store';

const CATEGORIES = [
  { id: 'trabajo', name: 'Trabajo inmediato', icon: 'briefcase', emoji: '💼' },
  { id: 'servicios', name: 'Servicios', icon: 'wrench', emoji: '🔧' },
  { id: 'mandados', name: 'Mandados / Envíos', icon: 'package', emoji: '📦' },
  { id: 'ayuda', name: 'Ayuda puntual', icon: 'hand', emoji: '🤝' },
  { id: 'ofertas', name: 'Ofertas de trabajo', icon: 'megaphone', emoji: '📢' },
];

export function CreateNeedScreen() {
  const { currentUser, goBack, setView, setIsLoading, setSelectedNeed } = useAppStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [neighborhood, setNeighborhood] = useState(currentUser?.neighborhood || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !category) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/needs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          budget: budget ? parseFloat(budget) : undefined,
          urgent,
          neighborhood: neighborhood.trim() || undefined,
          lat: currentUser?.lat,
          lng: currentUser?.lng,
          authorId: currentUser?.id,
        }),
      });

      if (res.ok) {
        const need = await res.json();
        setSelectedNeed(need);
        setView('need-detail');
      }
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={goBack} className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Publicar necesidad</h1>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* Category Selection */}
        <div>
          <label className="text-sm font-semibold mb-2.5 block">¿Qué necesitás?</label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  category === cat.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <span className="text-xl mb-1 block">{cat.emoji}</span>
                <span className={`text-xs font-semibold ${category === cat.id ? 'text-orange-600' : 'text-foreground'}`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-semibold mb-1.5 block">Título de tu publicación *</label>
          <input
            type="text"
            placeholder="Ej: Necesito un plomero urgente"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{title.length}/100 caracteres</p>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold mb-1.5 block">Descripción (opcional)</label>
          <textarea
            placeholder="Agregá detalles para que te entiendan mejor..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{description.length}/500 caracteres</p>
        </div>

        {/* Budget & Urgent */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold mb-1.5 block">Presupuesto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
              <input
                type="number"
                placeholder="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full pl-7 pr-3 p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1.5 block">¿Es urgente?</label>
            <button
              onClick={() => setUrgent(!urgent)}
              className={`w-full p-3.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                urgent
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-200 text-muted-foreground hover:border-gray-300'
              }`}
            >
              {urgent ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Urgente
                </>
              ) : (
                'Normal'
              )}
            </button>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-semibold mb-1.5 block">¿Dónde?</label>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
            </svg>
            <input
              type="text"
              placeholder="Tu barrio o zona"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="w-full pl-9 pr-3 p-3.5 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Urgency explanation */}
        {urgent && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <p className="text-xs text-red-700 leading-relaxed">
              Las publicaciones urgentes se destacan y reciben más respuestas. Usala solo si necesitás ayuda inmediata.
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !category || isSubmitting}
          className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20"
        >
          {isSubmitting ? 'Publicando...' : 'Publicar necesidad'}
        </button>

        <p className="text-center text-[10px] text-muted-foreground">
          Al publicar aceptás nuestros términos de uso. Tu publicación será visible para otros usuarios.
        </p>
      </div>
    </div>
  );
}
