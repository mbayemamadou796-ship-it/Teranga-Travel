/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, Calendar, Users, MapPin, ShieldCheck, CheckCircle2, 
  Clock, AlertCircle, Phone, Mail, Building, Compass, Star, 
  FileText, ArrowRight, Ban, Info, Sparkles
} from 'lucide-react';
import { BookingItem, TravelBooking, User as UserType } from '../../shared/types';
import VerifiedReviewModal from './VerifiedReviewModal';

interface TravelBookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: TravelBooking;
  currentUser: UserType | null;
  onRefresh: () => void;
}

export default function TravelBookingDetailsModal({
  isOpen,
  onClose,
  booking,
  currentUser,
  onRefresh,
}: TravelBookingDetailsModalProps) {
  if (!isOpen) return null;

  const [reviewingItem, setReviewingItem] = useState<BookingItem | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status badge config
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'En attente de confirmation', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'PARTIALLY_CONFIRMED':
        return { label: 'Partiellement confirmé (1/2)', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'CONFIRMED':
        return { label: 'Séjour Confirmé 🎉', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
      case 'IN_PROGRESS':
        return { label: 'Séjour en cours 🇸🇳', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'COMPLETED':
        return { label: 'Séjour Terminé', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'REVIEW_SUBMITTED':
        return { label: 'Avis vérifiés déposés ⭐', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'CANCELLED':
        return { label: 'Séjour Annulé', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'REJECTED':
        return { label: 'Demande Refusée', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: status, bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const statusConfig = getStatusBadge(booking.status);

  // Handle Cancel
  const handleCancelBooking = async () => {
    if (!currentUser) return;
    setCancelling(true);
    setError(null);
    try {
      const response = await fetch(`/api/travel-bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          role: currentUser.role,
          reason: cancelReason || 'Annulation par le voyageur'
        })
      });
      if (!response.ok) throw new Error('Impossible d\'annuler la réservation.');
      onRefresh();
      setShowCancelPrompt(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'annulation');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
        <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Dossier de Voyage Officiel
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {booking.reference}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                  Séjour à {booking.destination} · Du {booking.checkIn} au {booking.checkOut}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Global Status Banner */}
            <div className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${statusConfig.bg}`}>
                  {statusConfig.label}
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {booking.guestsCount} voyageur(s) · {booking.items.length} prestation(s) liée(s)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Montant total dossier :</span>
                <p className="text-base font-black text-emerald-700">{booking.totalPrice.toLocaleString()} FCFA</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* PRESTATIONS BREAKDOWN */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Détail des Prestations du Dossier
              </h4>

              <div className="space-y-3">
                {booking.items.map((item) => {
                  const isCompleted = item.status === 'COMPLETED';
                  const isEligibleForReview = isCompleted && !item.reviewSubmitted;

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{item.type === 'ACCOMMODATION' ? '🏨' : '🥾'}</span>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              {item.type === 'ACCOMMODATION' ? 'Prestation Hébergement' : 'Prestation Guidage Local'}
                            </span>
                            <h5 className="text-sm font-bold text-gray-900">{item.providerName}</h5>
                            <p className="text-xs text-gray-500">{item.offerTitle}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                            item.status === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : item.status === 'COMPLETED'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : item.status === 'IN_PROGRESS'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : item.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                          <span className="text-xs font-bold text-gray-900">
                            {item.price.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>

                      {/* Details & Practical information */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50/60 p-3 rounded-xl">
                        {item.type === 'ACCOMMODATION' && (
                          <>
                            <div>
                              <span className="text-gray-400">Nuits :</span> {item.details.nightsCount} nuits
                            </div>
                            <div>
                              <span className="text-gray-400">Type :</span> {item.details.roomType}
                            </div>
                          </>
                        )}
                        {item.type === 'GUIDE' && (
                          <>
                            <div>
                              <span className="text-gray-400">Durée :</span> {item.details.durationDays} jour(s) de guidage
                            </div>
                            <div>
                              <span className="text-gray-400">Langues :</span> {item.details.languages?.join(', ') || 'Français, Wolof'}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Verified Review Trigger Button if Completed */}
                      {isEligibleForReview && (
                        <div className="pt-1 flex items-center justify-between bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl">
                          <div className="flex items-center gap-2 text-xs text-emerald-900">
                            <Sparkles size={16} className="text-emerald-700 shrink-0" />
                            <span>Séjour terminé ! Vous êtes éligible au dépôt d'un <strong>avis vérifié</strong>.</span>
                          </div>
                          <button
                            onClick={() => setReviewingItem(item)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all shrink-0"
                          >
                            <Star size={13} className="fill-white" />
                            <span>Laisser mon avis vérifié</span>
                          </button>
                        </div>
                      )}

                      {item.reviewSubmitted && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          <span>Avis vérifié déposé et publié pour cette prestation.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Practical information for traveler */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
              <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Info size={15} className="text-emerald-600" />
                <span>Informations pratiques pour votre voyage</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                <div>
                  <strong>Horaires Hébergement :</strong> Arrivée à partir de 14h00 · Départ avant 11h00.
                </div>
                <div>
                  <strong>Point de rendez-vous Guide :</strong> À convenir avec votre guide dès confirmation.
                </div>
                <div>
                  <strong>Monnaie & Règlement :</strong> Franc CFA (XOF) payable sur place ou par Wave/Orange Money.
                </div>
                <div>
                  <strong>Assistance Teranga Travel :</strong> Plateforme ouverte 7j/7 pour votre confort.
                </div>
              </div>
            </div>

            {/* Cancel booking if still pending or confirmed */}
            {['PENDING', 'PARTIALLY_CONFIRMED', 'CONFIRMED'].includes(booking.status) && (
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                {!showCancelPrompt ? (
                  <button
                    onClick={() => setShowCancelPrompt(true)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer underline flex items-center gap-1"
                  >
                    <Ban size={14} />
                    <span>Annuler ce dossier de voyage</span>
                  </button>
                ) : (
                  <div className="space-y-2 w-full bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
                    <p className="text-xs font-bold text-rose-900">Confirmer l'annulation du dossier {booking.reference} ?</p>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Motif de l'annulation (facultatif)..."
                      className="w-full bg-white border border-rose-300 rounded-xl px-3 py-1.5 text-xs text-gray-800 focus:outline-none"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowCancelPrompt(false)}
                        className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
                      >
                        Retour
                      </button>
                      <button
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                      >
                        {cancelling ? 'Annulation...' : 'Confirmer l\'annulation'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors"
            >
              Fermer
            </button>
          </div>

        </div>
      </div>

      {/* Verified Review Modal Popup */}
      {reviewingItem && currentUser && (
        <VerifiedReviewModal
          isOpen={Boolean(reviewingItem)}
          onClose={() => setReviewingItem(null)}
          booking={booking}
          item={reviewingItem}
          userId={currentUser.id}
          onSuccess={() => {
            setReviewingItem(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
