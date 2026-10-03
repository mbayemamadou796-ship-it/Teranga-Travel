/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, ShieldCheck, X, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { BookingItem, TravelBooking } from '../../shared/types';

interface VerifiedReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: TravelBooking;
  item: BookingItem;
  userId: string;
  onSuccess: () => void;
}

export default function VerifiedReviewModal({
  isOpen,
  onClose,
  booking,
  item,
  userId,
  onSuccess,
}: VerifiedReviewModalProps) {
  if (!isOpen) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Veuillez rédiger un commentaire sur votre expérience.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/travel-bookings/${booking.id}/item/${item.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          rating,
          title: title.trim() || (item.type === 'ACCOMMODATION' ? 'Séjour exceptionnel' : 'Guidage remarquable'),
          comment: comment.trim()
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la soumission de l\'avis.');
      }

      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Impossible d\'enregistrer votre avis vérifié.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <ShieldCheck size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                Certification Teranga Travel
              </span>
              <h3 className="text-base font-bold text-white">
                Déposer un Avis Vérifié
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {submitted ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Avis Vérifié Enregistré !</h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                Votre avis a été certifié conforme avec la mention <strong>✓ Avis vérifié</strong> et rattaché au dossier {booking.reference}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Target Provider info */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">
                    {item.type === 'ACCOMMODATION' ? 'Hébergement évalué' : 'Guide évalué'}
                  </span>
                  <p className="font-bold text-gray-900">{item.providerName}</p>
                  <p className="text-[10px] text-gray-500">{item.offerTitle}</p>
                </div>
                <span className="text-[10px] font-mono bg-white px-2 py-1 rounded-lg border border-emerald-200 text-emerald-800 font-bold">
                  {booking.reference}
                </span>
              </div>

              {/* Verified Rule badge explanation */}
              <div className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Cet avis portera le label <strong>✓ Avis vérifié</strong> car notre système atteste que vous avez effectué et terminé ce séjour ({booking.destination}, {booking.checkOut}).
                </span>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* Star Rating */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Votre Note Globale</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 cursor-pointer focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={24}
                        className={`${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-200'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-gray-700">
                    {rating} sur 5
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Titre de votre avis</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex : Accueil chaleureux et guide passionnant"
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Votre Retour d'Expérience</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Racontez votre expérience, l'accueil reçu, la qualité de la prestation et vos conseils aux futurs voyageurs..."
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      <span>Publier mon avis vérifié</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
