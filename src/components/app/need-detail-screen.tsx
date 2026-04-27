'use client';

import { useState } from 'react';
import { useAppStore, type Need } from '@/store/app-store';
import { getCategoryName, getCategoryColor, getCategoryIcon, formatBudget, timeAgo } from './home-screen';

export function NeedDetailScreen() {
  const {
    selectedNeed, currentUser, goBack, setView,
    setSelectedNeed, setIsLoading,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'details' | 'responses'>('details');
  const [responseMessage, setResponseMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [chatCreated, setChatCreated] = useState(false);

  if (!selectedNeed) {
    goBack();
    return null;
  }

  const isOwner = currentUser?.id === selectedNeed.authorId;

  const handleRespond = async () => {
    if (!responseMessage.trim() || !currentUser) return;
    setIsSending(true);

    try {
      // Create response
      await fetch(`/api/needs/${selectedNeed.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: responseMessage.trim(),
          userId: currentUser.id,
        }),
      });

      // Create chat thread
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1Id: currentUser.id,
          participant2Id: selectedNeed.authorId,
          needId: selectedNeed.id,
        }),
      });

      setChatCreated(true);
      setResponseMessage('');
      setShowResponseInput(false);

      // Refresh need
      const res = await fetch(`/api/needs/${selectedNeed.id}`);
      if (res.ok) {
        const updated = await res.json();
        setSelectedNeed(updated);
      }
    } catch (err) {
      console.error(err);
    }
    setIsSending(false);
  };

  const handleOpenChat = async () => {
    if (!currentUser) return;

    try {
      // Create or get chat thread
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1Id: currentUser.id,
          participant2Id: selectedNeed.authorId,
          needId: selectedNeed.id,
        }),
      });

      if (res.ok) {
        const thread = await res.json();
        useAppStore.getState().setSelectedThread(thread);
        setView('chat');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que querés eliminar esta publicación?')) return;
    try {
      await fetch(`/api/needs/${selectedNeed.id}`, { method: 'DELETE' });
      goBack();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async () => {
    try {
      await fetch(`/api/needs/${selectedNeed.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      const res = await fetch(`/api/needs/${selectedNeed.id}`);
      if (res.ok) {
        const updated = await res.json();
        setSelectedNeed(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const catColor = getCategoryColor(selectedNeed.category);

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
          <h1 className="text-lg font-semibold flex-1 truncate">Detalle</h1>
          {isOwner && (
            <div className="flex items-center gap-1">
              {selectedNeed.status === 'active' && (
                <button onClick={handleComplete} className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors">
                  Completada
                </button>
              )}
              <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Status Badge */}
        {selectedNeed.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-xl text-sm font-medium mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Publicación completada
          </div>
        )}

        {/* Category & Urgent */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide"
            style={{ backgroundColor: catColor + '18', color: catColor }}
          >
            {getCategoryIcon(selectedNeed.category)}
            <span className="ml-1">{getCategoryName(selectedNeed.category)}</span>
          </span>
          {selectedNeed.urgent && (
            <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-600 text-xs font-semibold uppercase tracking-wide flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Urgente
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-2">{selectedNeed.title}</h2>

        {/* Description */}
        {selectedNeed.description && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{selectedNeed.description}</p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {selectedNeed.budget && (
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wide text-blue-500 font-semibold mb-0.5">Presupuesto</p>
              <p className="text-lg font-bold text-blue-600">{formatBudget(selectedNeed.budget)}</p>
            </div>
          )}
          {selectedNeed.neighborhood && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">Ubicación</p>
              <p className="text-sm font-semibold">{selectedNeed.neighborhood}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">Publicado</p>
            <p className="text-sm font-semibold">{timeAgo(selectedNeed.createdAt)}</p>
          </div>
          {selectedNeed.distanceKm !== undefined && selectedNeed.distanceKm !== null && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">Distancia</p>
              <p className="text-sm font-semibold">{selectedNeed.distanceKm} km</p>
            </div>
          )}
        </div>

        {/* Author */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
              <span className="text-lg font-bold text-white">{selectedNeed.author.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-sm">{selectedNeed.author.name}</p>
                {selectedNeed.author.verified && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {selectedNeed.author.ratingCount > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-muted-foreground">{selectedNeed.author.ratingAvg} ({selectedNeed.author.ratingCount} reseñas)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Responses Tab */}
        {selectedNeed.responses && selectedNeed.responses.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {selectedNeed.responses.length} respuestas
            </h3>
            <div className="space-y-2">
              {selectedNeed.responses.map((response) => (
                <div key={response.id} className="bg-white border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{response.user.name.charAt(0)}</span>
                    </div>
                    <span className="text-xs font-semibold">{response.user.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(response.createdAt)}</span>
                    {response.status === 'accepted' && (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">Aceptada</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{response.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isOwner && selectedNeed.status === 'active' && (
          <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-4 px-4 border-t">
            {chatCreated ? (
              <button
                onClick={handleOpenChat}
                className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Ir al chat
              </button>
            ) : (
              <>
                {!showResponseInput ? (
                  <button
                    onClick={() => setShowResponseInput(true)}
                    className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Quiero ayudar
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Contale brevemente cómo podés ayudar..."
                      value={responseMessage}
                      onChange={(e) => setResponseMessage(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowResponseInput(false); setResponseMessage(''); }}
                        className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-muted transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRespond}
                        disabled={!responseMessage.trim() || isSending}
                        className="flex-1 bg-blue-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 transition-all"
                      >
                        {isSending ? 'Enviando...' : 'Enviar respuesta'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Owner view */}
        {isOwner && selectedNeed.status === 'active' && (
          <div className="sticky bottom-0 bg-background pt-4 pb-2 -mx-4 px-4 border-t">
            <button
              onClick={handleOpenChat}
              className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Ver mensajes ({selectedNeed.responses?.length || 0})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
