'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';

export function UserRatingDialog() {
  const { selectedNeed, currentUser, setView } = useAppStore();
  const [showDialog, setShowDialog] = useState(false);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show rating dialog when a need is completed
  useEffect(() => {
    if (selectedNeed?.status === 'completed' && currentUser?.id !== selectedNeed?.authorId) {
      setShowDialog(true);
    } else {
      setShowDialog(false);
    }
  }, [selectedNeed, currentUser]);

  const handleSubmit = async () => {
    if (score === 0 || !currentUser || !selectedNeed) return;
    setIsSubmitting(true);

    try {
      await fetch(`/api/users/${selectedNeed.authorId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score,
          comment: comment.trim() || undefined,
          raterId: currentUser.id,
          needId: selectedNeed.id,
        }),
      });

      setShowDialog(false);
      setScore(0);
      setComment('');
    } catch (err) {
      console.error(err);
    }
    setIsSubmitting(false);
  };

  if (!showDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowDialog(false)} />
      <div className="relative bg-background w-full max-w-lg rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-bold text-center mb-1">¡Trabajo completado!</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Calificá a {selectedNeed?.author?.name} por este trabajo
        </p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setScore(star)}
              className="p-1 transition-transform hover:scale-110 active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-10 w-10 transition-colors ${score >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
              </svg>
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          placeholder="Dejá un comentario (opcional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full p-3 rounded-xl border border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setShowDialog(false)}
            className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 hover:bg-muted transition-colors"
          >
            Después
          </button>
          <button
            onClick={handleSubmit}
            disabled={score === 0 || isSubmitting}
            className="flex-1 bg-orange-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar calificación'}
          </button>
        </div>
      </div>
    </div>
  );
}
