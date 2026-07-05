/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Calendar, Users, X, CheckCircle, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { Offer, Establishment, Booking } from '../types';

interface BookingModalProps {
  offer: Offer;
  establishment: Establishment;
  touristId: string;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export default function BookingModal({ offer, establishment, touristId, onClose, onSuccess }: BookingModalProps) {
  // Set default dates: check-in tomorrow, check-out in 3 days
  const getFormattedDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const [checkIn, setCheckIn] = useState(getFormattedDate(1));
  const [checkOut, setCheckOut] = useState(getFormattedDate(4));
  const [guestsCount, setGuestsCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<Booking | null>(null);

  // Dynamic calculations
  const [days, setDays] = useState(1);
  const [totalPrice, setTotalPrice] = useState(offer.price);

  const isAgency = establishment.type === 'agence';
  const isGuide = establishment.type === 'guide';
  const isAccommodation = !isAgency && !isGuide;

  useEffect(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        setDays(diffDays);
        
        if (isAgency) {
          // Agency: Price is per traveler
          setTotalPrice(offer.price * guestsCount);
          setError(null);
        } else if (isGuide) {
          // Guide: Price is per day of guide
          setTotalPrice(offer.price * diffDays);
          setError(null);
        } else {
          // Accommodation: Price is per night (requires end > start)
          if (end.getTime() === start.getTime()) {
            setDays(0);
            setTotalPrice(0);
            setError('Pour un hébergement, la date de départ doit être au moins le lendemain de l\'arrivée.');
          } else {
            setTotalPrice(offer.price * diffDays);
            setError(null);
          }
        }
      } else {
        setDays(0);
        setTotalPrice(0);
        setError('La date de départ/fin doit être après ou égale à la date d\'arrivée/début.');
      }
    } else {
      setDays(0);
      setTotalPrice(0);
      setError('Sélectionnez des dates valides.');
    }
  }, [checkIn, checkOut, offer.price, guestsCount, isAgency, isGuide, isAccommodation]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAccommodation && days <= 0) {
      setError('Sélectionnez un intervalle de dates valide (au moins 1 nuit).');
      return;
    }
    if (guestsCount > offer.capacity) {
      setError(`La capacité maximale pour cette offre est de ${offer.capacity} personnes.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer.id,
          checkIn,
          checkOut,
          guestsCount,
          touristId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réservation.');
      }

      setBookingSuccess(data);
      setTimeout(() => {
        onSuccess(data);
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="booking-modal-backdrop" className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-radial from-emerald-700 to-emerald-800 text-white flex justify-between items-center">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">Teranga Réservations</span>
            <h3 className="font-sans font-bold text-lg leading-tight">Réserver votre séjour</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-600/30 text-white hover:text-emerald-100 rounded-full transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {bookingSuccess ? (
          /* Success Screen */
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border-2 border-emerald-100 animate-bounce">
              <CheckCircle size={32} />
            </div>
            <h4 className="font-sans font-bold text-gray-900 text-lg">Demande de réservation envoyée !</h4>
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-xs text-gray-700 max-w-sm space-y-2 text-left">
              <p><b>Acteur :</b> {establishment.name}</p>
              <p><b>Offre :</b> {offer.title}</p>
              <p><b>Dates :</b> {checkIn} au {checkOut} {isAccommodation ? `(${days} nuits)` : `(${days} jours)`}</p>
              <p><b>Montant total estimé :</b> {totalPrice.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <p className="text-xs text-gray-500 italic">
              L'établissement ou le professionnel va examiner vos dates sous peu. Vous pouvez suivre le statut dans votre Espace Voyageur.
            </p>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleBook} className="p-6 space-y-5 overflow-y-auto flex-1">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Offer Summary Card */}
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex gap-3 items-center">
              {offer.images?.[0] && (
                <img
                  src={offer.images[0]}
                  alt={offer.title}
                  className="w-14 h-14 object-cover rounded-xl shrink-0"
                />
              )}
              <div className="space-y-0.5">
                <h4 className="font-sans font-bold text-xs text-gray-900">{offer.title}</h4>
                <p className="text-[10px] text-gray-500 font-medium">{establishment.name}</p>
                <p className="text-[11px] font-bold text-emerald-700 font-mono mt-0.5">
                  {offer.price.toLocaleString('fr-FR')} FCFA <span className="text-[9px] text-gray-400 font-normal">{isAgency ? '/ voyageur' : isGuide ? '/ jour' : '/ nuit'}</span>
                </p>
              </div>
            </div>

            {/* Check-In Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" /> {isAccommodation ? "Date d'Arrivée" : "Date de Début / Départ"}
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800"
              />
            </div>

            {/* Check-Out Date */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={13} className="text-gray-400" /> {isAccommodation ? "Date de Départ" : "Date de Fin / Retour"}
              </label>
              <input
                type="date"
                required
                min={checkIn}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800"
              />
            </div>

            {/* Guests Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <Users size={13} className="text-gray-400" /> Nombre de Voyageurs
                </label>
                <span className="text-[10px] text-gray-400">Max : {offer.capacity} personnes</span>
              </div>
              <input
                type="number"
                required
                min={1}
                max={offer.capacity}
                value={guestsCount}
                onChange={(e) => setGuestsCount(Number(e.target.value))}
                className="w-full bg-white border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-gray-800"
              />
            </div>

            {/* Price Calculations */}
            {days > 0 && (
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-2">
                <div className="flex justify-between text-xs text-amber-900">
                  {isAgency ? (
                    <span>Calcul : {offer.price.toLocaleString('fr-FR')} FCFA × {guestsCount} voyageur(s)</span>
                  ) : isGuide ? (
                    <span>Calcul : {offer.price.toLocaleString('fr-FR')} FCFA × {days} jour(s)</span>
                  ) : (
                    <span>Calcul : {offer.price.toLocaleString('fr-FR')} FCFA × {days} nuit(s)</span>
                  )}
                  <span className="font-mono font-medium">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="border-t border-amber-200 pt-2 flex justify-between text-sm font-bold text-amber-950">
                  <span>Montant Total</span>
                  <span className="font-mono">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </div>
            )}

            {/* Secure Booking Notice */}
            <div className="flex gap-2 text-[10px] text-gray-500 bg-gray-50 px-3 py-2.5 rounded-xl">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={14} />
              <span>
                {isAccommodation 
                  ? "Paiement direct à l'établissement lors de votre arrivée. Aucun frais de réservation n'est prélevé à l'avance."
                  : "Réservation sans prépaiement obligatoire. Le règlement s'effectue en direct avec l'agence ou le guide."
                }
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || (isAccommodation && days <= 0)}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-3 px-6 rounded-2xl text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {loading ? 'Réservation en cours...' : 'Confirmer la Réservation'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
