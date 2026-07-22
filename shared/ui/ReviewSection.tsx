/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Star, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { Review } from '../types';

interface ReviewSectionProps {
  establishmentId: string;
  reviews: Review[];
  onAddReview: (newReview: Review) => void;
}

export default function ReviewSection({ establishmentId, reviews, onAddReview }: ReviewSectionProps) {
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setError('Veuillez renseigner votre nom et votre commentaire.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          establishmentId,
          authorName,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Impossible de soumettre votre avis.');
      }

      const newReview = await response.json();
      onAddReview(newReview);
      
      // Reset form
      setAuthorName('');
      setRating(5);
      setComment('');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="review-section-wrapper" className="space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h3 className="font-sans font-bold text-lg text-gray-900 flex items-center gap-2">
          <MessageSquare size={18} className="text-emerald-700" />
          Avis des Voyageurs ({reviews.length})
        </h3>
        
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 text-sm font-semibold bg-amber-50 text-amber-900 px-3 py-1 rounded-full border border-amber-100">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span>
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)} / 5
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Review list */}
        <div className="lg:col-span-7 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <span className="text-2xl">✍️</span>
              <p className="font-sans font-medium text-gray-700 text-sm mt-2">Aucun avis pour le moment</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1">Soyez le premier à partager votre expérience de la Teranga !</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
              {reviews.map((review) => (
                <div key={review.id} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase border border-emerald-100">
                        {review.authorName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-gray-900 text-xs leading-tight">
                          {review.authorName}
                        </h4>
                        <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                          <Calendar size={10} /> {review.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs leading-relaxed pl-10">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add review form */}
        <div className="lg:col-span-5 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
          <h4 className="font-sans font-bold text-sm text-gray-900 mb-4">Laisser un avis</h4>
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Votre Nom</label>
              <input
                type="text"
                required
                placeholder="Ex. Fatou Diop"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800"
              />
            </div>

            {/* Stars rating selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Note globale</label>
              <div className="flex gap-1 pt-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = i + 1;
                  const active = hoverRating ? starVal <= hoverRating : starVal <= rating;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRating(starVal)}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="cursor-pointer focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={20}
                        className={active ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Votre Commentaire</label>
              <textarea
                required
                rows={3}
                placeholder="Racontez-nous votre accueil, les activités, le confort..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-white border border-gray-200 p-3.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Soumission...' : 'Publier mon avis'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
