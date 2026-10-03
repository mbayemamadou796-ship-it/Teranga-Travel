/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, X, CheckCircle2, ShieldCheck, AlertCircle, Compass, 
  Building, UserCheck, Star, Sparkles, MapPin, ArrowRight, ArrowLeft, 
  Clock, Check, Info, FileText, Luggage
} from 'lucide-react';
import { Establishment, Offer, SenegalDestination, TravelBooking, User as UserType } from '../../shared/types';
import { INITIAL_DESTINATIONS } from '../../backend/data';

interface CombinedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  establishments: Establishment[];
  initialAccommodation?: Establishment | null;
  initialOffer?: Offer | null;
  initialGuide?: Establishment | null;
  initialDestination?: SenegalDestination | null;
  onSuccess: (booking: TravelBooking) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export default function CombinedBookingModal({
  isOpen,
  onClose,
  currentUser,
  establishments,
  initialAccommodation,
  initialOffer,
  initialGuide,
  initialDestination,
  onSuccess,
  onOpenAuth,
}: CombinedBookingModalProps) {
  if (!isOpen) return null;

  // Set default dates: check-in in 7 days, check-out in 12 days (5 days / 5 nights)
  const getFormattedDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().split('T')[0];
  };

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [destination, setDestination] = useState<SenegalDestination>(
    initialDestination || initialAccommodation?.location || initialGuide?.location || 'Casamance'
  );

  // Selected items
  const [selectedAccEst, setSelectedAccEst] = useState<Establishment | null>(
    initialAccommodation || null
  );
  const [selectedAccOffer, setSelectedAccOffer] = useState<Offer | null>(
    initialOffer || null
  );
  const [selectedGuideEst, setSelectedGuideEst] = useState<Establishment | null>(
    initialGuide || null
  );
  const [selectedGuideOffer, setSelectedGuideOffer] = useState<Offer | null>(null);

  // Offers cache for selected accommodation and guide
  const [accOffers, setAccOffers] = useState<Offer[]>([]);
  const [guideOffers, setGuideOffers] = useState<Offer[]>([]);

  // Dates & Travelers
  const [checkIn, setCheckIn] = useState(getFormattedDate(7));
  const [checkOut, setCheckOut] = useState(getFormattedDate(12));
  const [guestsCount, setGuestsCount] = useState(2);
  const [message, setMessage] = useState('Nous souhaitons découvrir les villages traditionnels, les artisans et la culture locale.');
  const [travelerName, setTravelerName] = useState(currentUser?.name || '');
  const [travelerEmail, setTravelerEmail] = useState(currentUser?.email || '');
  const [travelerPhone, setTravelerPhone] = useState(currentUser?.phone || '+221 77 123 45 67');

  // Availability check states
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
    accommodation?: any;
    guide?: any;
    nights?: number;
    days?: number;
    totalPrice?: number;
  } | null>(null);

  // Submitting states
  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<TravelBooking | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter approved accommodations & guides by selected destination
  const availableAccommodations = establishments.filter(e => 
    e.status === 'approved' && 
    ['hotel', 'campement', 'maison_hotes'].includes(e.type) &&
    e.location === destination
  );

  const availableGuides = establishments.filter(e => 
    e.status === 'approved' && 
    ['guide', 'agence'].includes(e.type) &&
    e.location === destination
  );

  // Auto-select first accommodation if none selected for this destination
  useEffect(() => {
    if (!selectedAccEst || selectedAccEst.location !== destination) {
      if (availableAccommodations.length > 0) {
        setSelectedAccEst(availableAccommodations[0]);
      } else {
        setSelectedAccEst(null);
        setSelectedAccOffer(null);
      }
    }

    if (!selectedGuideEst || selectedGuideEst.location !== destination) {
      if (availableGuides.length > 0) {
        setSelectedGuideEst(availableGuides[0]);
      } else {
        setSelectedGuideEst(null);
        setSelectedGuideOffer(null);
      }
    }
  }, [destination]);

  // Fetch offers when selectedAccEst changes
  useEffect(() => {
    if (selectedAccEst) {
      fetch(`/api/establishments/${selectedAccEst.id}/offers`)
        .then(res => res.json())
        .then(data => {
          const approved = (data || []).filter((o: Offer) => o.status === 'approved');
          setAccOffers(approved);
          if (initialOffer && initialOffer.establishmentId === selectedAccEst.id) {
            setSelectedAccOffer(initialOffer);
          } else if (approved.length > 0) {
            setSelectedAccOffer(approved[0]);
          }
        })
        .catch(err => console.error(err));
    } else {
      setAccOffers([]);
      setSelectedAccOffer(null);
    }
  }, [selectedAccEst]);

  // Fetch offers when selectedGuideEst changes
  useEffect(() => {
    if (selectedGuideEst) {
      fetch(`/api/establishments/${selectedGuideEst.id}/offers`)
        .then(res => res.json())
        .then(data => {
          const approved = (data || []).filter((o: Offer) => o.status === 'approved');
          setGuideOffers(approved);
          if (approved.length > 0) {
            setSelectedGuideOffer(approved[0]);
          } else {
            // Virtual guide offer if none created yet
            setSelectedGuideOffer({
              id: `virtual_guide_${selectedGuideEst.id}`,
              establishmentId: selectedGuideEst.id,
              title: `Journée d'accompagnement & guidage à ${destination}`,
              description: 'Visite guidée immersive, anecdotes historiques et culturelles.',
              price: 25000,
              capacity: 6,
              services: ['Guidage privé', 'Traduction Wolof/Français', 'Itinéraire personnalisé'],
              images: selectedGuideEst.images,
              status: 'approved'
            });
          }
        })
        .catch(err => console.error(err));
    } else {
      setGuideOffers([]);
      setSelectedGuideOffer(null);
    }
  }, [selectedGuideEst, destination]);

  // Dynamic calculations
  const calculateDurations = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return { nights: 0, days: 0, valid: false };
    }
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return { nights, days: nights, valid: true };
  };

  const { nights, days, valid } = calculateDurations();
  const accTotal = (selectedAccOffer?.price || 0) * nights;
  const guideTotal = (selectedGuideOffer?.price || 0) * days;
  const grandTotal = accTotal + guideTotal;

  // Run backend availability verification (Section 11 & 29)
  const handleCheckAvailability = async () => {
    if (!valid) {
      setError('Veuillez renseigner des dates valides (départ après arrivée).');
      return;
    }
    setCheckingAvailability(true);
    setError(null);

    try {
      const response = await fetch('/api/availability/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accommodationOfferId: selectedAccOffer?.id,
          accommodationEstablishmentId: selectedAccEst?.id,
          guideOfferId: selectedGuideOffer?.id,
          guideEstablishmentId: selectedGuideEst?.id,
          checkIn,
          checkOut,
          guestsCount
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la vérification');
      }

      setAvailabilityResult({
        checked: true,
        available: data.available,
        message: data.message,
        accommodation: data.accommodation,
        guide: data.guide,
        nights: data.nights,
        days: data.days,
        totalPrice: data.totalPrice
      });
    } catch (err: any) {
      setError(err.message || 'Impossible de vérifier les disponibilités.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Submit Combined Booking
  const handleSubmitBooking = async () => {
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }

    if (!selectedAccOffer && !selectedGuideOffer) {
      setError('Veuillez sélectionner au moins un hébergement ou un guide.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/travel-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          destination,
          checkIn,
          checkOut,
          guestsCount,
          message,
          accommodationOfferId: selectedAccOffer?.id,
          accommodationEstablishmentId: selectedAccEst?.id,
          guideOfferId: selectedGuideOffer?.id,
          guideEstablishmentId: selectedGuideEst?.id,
          travelerName: travelerName || currentUser.name,
          travelerEmail: travelerEmail || currentUser.email,
          travelerPhone
        })
      });

      const newBooking = await response.json();
      if (!response.ok) {
        throw new Error(newBooking.error || 'Erreur lors de la création du dossier.');
      }

      setCreatedBooking(newBooking);
      onSuccess(newBooking);
    } catch (err: any) {
      setError(err.message || 'Impossible de finaliser la demande de réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Title and Steps */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
              <Luggage size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Parcours critique — Dossier de voyage
                </span>
                <span className="text-xs text-slate-400">Réservation combinée</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                Séjour immersif au Sénégal — Hébergement + Guide
              </h2>
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* SUCCESS SCREEN */}
          {createdBooking ? (
            <div className="space-y-6 py-4 text-center max-w-xl mx-auto animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Demande transmise avec succès
                </span>
                <h3 className="text-2xl font-black text-gray-900 mt-2">
                  Dossier de Voyage créé !
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Votre référence officielle : <strong className="text-emerald-700 text-base font-mono">{createdBooking.reference}</strong>
                </p>
              </div>

              {/* Summary Cards */}
              <div className="bg-slate-50 border border-gray-200/80 rounded-2xl p-5 text-left space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Destination :</span>
                  <span className="font-bold text-gray-900">{createdBooking.destination}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Dates du séjour :</span>
                  <span className="font-bold text-gray-900">Du {createdBooking.checkIn} au {createdBooking.checkOut} ({nights} nuits)</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-500 font-medium">Voyageurs :</span>
                  <span className="font-bold text-gray-900">{createdBooking.guestsCount} personnes</span>
                </div>

                <div className="pt-1 space-y-2">
                  <p className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Prestations incluses dans ce dossier :</p>
                  {createdBooking.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                      <div className="flex items-center gap-2">
                        <span>{item.type === 'ACCOMMODATION' ? '🏨' : '🥾'}</span>
                        <div>
                          <p className="font-bold text-gray-900">{item.providerName}</p>
                          <p className="text-[10px] text-gray-500">{item.offerTitle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center text-sm font-black text-gray-900 border-t border-gray-200">
                  <span>Total séjour combiné :</span>
                  <span className="text-emerald-700 text-base">{createdBooking.totalPrice.toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Critical Journey Explainer Note */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-left text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
                  <span>Prochaines étapes du parcours critique :</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-emerald-800 text-[11px]">
                  <li>L'hébergeur et le guide ont reçu votre demande instantanément.</li>
                  <li>Dès que les deux professionnels ont validé, votre dossier passe en statut <strong>CONFIRMED</strong>.</li>
                  <li>À la fin de votre séjour, vous recevrez une invitation officielle pour déposer un <strong>✓ Avis vérifié</strong>.</li>
                </ul>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Luggage size={15} />
                  <span>Consulter mon dossier dans Mon Espace</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Stepper Navigation */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <button
                    onClick={() => setStep(1)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      step === 1 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>1.</span>
                    <span>Prestations</span>
                  </button>

                  <ArrowRight size={14} className="text-gray-300" />

                  <button
                    onClick={() => setStep(2)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      step === 2 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>2.</span>
                    <span>Dates & Voyageurs</span>
                  </button>

                  <ArrowRight size={14} className="text-gray-300" />

                  <button
                    onClick={() => setStep(3)}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                      step === 3 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>3.</span>
                    <span>Disponibilités & Devis</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                  <MapPin size={14} className="text-emerald-600" />
                  <span>Destination :</span>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value as SenegalDestination)}
                    className="font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs cursor-pointer focus:ring-2 focus:ring-emerald-500"
                  >
                    {INITIAL_DESTINATIONS.map(d => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle size={16} className="shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: SELECT ACCOMMODATION & GUIDE */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Select Destination on mobile */}
                  <div className="sm:hidden space-y-1">
                    <label className="text-xs font-bold text-gray-700">Région du séjour</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value as SenegalDestination)}
                      className="w-full font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs"
                    >
                      {INITIAL_DESTINATIONS.map(d => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Prestation 1: Hébergement */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏨</span>
                        <h3 className="text-sm font-bold text-gray-900">Prestation 1 : Hébergement local</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {availableAccommodations.length} établissement(s) homologué(s) à {destination}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableAccommodations.map(est => {
                        const isSelected = selectedAccEst?.id === est.id;
                        return (
                          <div
                            key={est.id}
                            onClick={() => setSelectedAccEst(est)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 text-left relative ${
                              isSelected 
                                ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <img
                              src={est.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80'}
                              alt={est.name}
                              className="w-20 h-20 rounded-xl object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                                  {est.type.replace('_', ' ')}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                                  <Star size={11} className="fill-amber-400 text-amber-400" />
                                  <span>{est.rating}</span>
                                </div>
                              </div>
                              <h4 className="text-xs font-bold text-gray-900 mt-1 truncate">{est.name}</h4>
                              <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{est.description}</p>
                              <div className="mt-2 text-[10px] font-bold text-emerald-800">
                                Dès {est.type === 'campement' ? '25 000' : '45 000'} FCFA / nuit
                              </div>
                            </div>

                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Room selection if accommodation selected */}
                    {selectedAccEst && accOffers.length > 0 && (
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Building size={14} className="text-emerald-600" />
                          <span>Type de chambre ou d'hébergement choisi :</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {accOffers.map(off => {
                            const isOfferSelected = selectedAccOffer?.id === off.id;
                            return (
                              <div
                                key={off.id}
                                onClick={() => setSelectedAccOffer(off)}
                                className={`p-2.5 rounded-xl border text-xs cursor-pointer flex justify-between items-center transition-all ${
                                  isOfferSelected
                                    ? 'bg-white border-emerald-600 text-gray-900 shadow-2xs font-bold'
                                    : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white'
                                }`}
                              >
                                <div>
                                  <p>{off.title}</p>
                                  <p className="text-[10px] font-normal text-gray-500">Capacité : {off.capacity} personnes</p>
                                </div>
                                <span className="text-emerald-700 font-extrabold">{off.price.toLocaleString()} FCFA / nuit</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Prestation 2: Guide local */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🥾</span>
                        <h3 className="text-sm font-bold text-gray-900">Prestation 2 : Guide touristique agréé</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {availableGuides.length} guide(s) certifié(s) à {destination}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {availableGuides.map(guide => {
                        const isSelected = selectedGuideEst?.id === guide.id;
                        return (
                          <div
                            key={guide.id}
                            onClick={() => setSelectedGuideEst(guide)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer flex gap-3 text-left relative ${
                              isSelected 
                                ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs' 
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <img
                              src={guide.images[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                              alt={guide.name}
                              className="w-18 h-18 rounded-xl object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                                  Guide Officiel
                                </span>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                                  <Star size={11} className="fill-amber-400 text-amber-400" />
                                  <span>{guide.rating}</span>
                                </div>
                              </div>
                              <h4 className="text-xs font-bold text-gray-900 mt-1 truncate">{guide.name}</h4>
                              <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">Langues : Français, Wolof, Diola</p>
                              <div className="mt-2 text-[10px] font-bold text-emerald-800">
                                25 000 FCFA / jour d'accompagnement
                              </div>
                            </div>

                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation footer */}
                  <div className="flex justify-end pt-3">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <span>Continuer vers les dates</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DATES, TRAVELERS & NOTES */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3 text-xs text-slate-700">
                    <Info size={18} className="text-emerald-600 shrink-0" />
                    <span>
                      Vous composez votre séjour à <strong>{destination}</strong> avec <strong>{selectedAccEst?.name}</strong> et <strong>{selectedGuideEst?.name}</strong>.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Check-in */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Calendar size={14} className="text-emerald-600" />
                        <span>Date d'arrivée (Check-in)</span>
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => {
                          setCheckIn(e.target.value);
                          setAvailabilityResult(null);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Check-out */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Calendar size={14} className="text-emerald-600" />
                        <span>Date de départ (Check-out)</span>
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => {
                          setCheckOut(e.target.value);
                          setAvailabilityResult(null);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Guests count */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <Users size={14} className="text-emerald-600" />
                        <span>Nombre de voyageurs</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Traveler Name */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Nom & Prénom</label>
                      <input
                        type="text"
                        value={travelerName}
                        onChange={(e) => setTravelerName(e.target.value)}
                        placeholder="Ex: Awa Diop"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Téléphone de contact</label>
                      <input
                        type="text"
                        value={travelerPhone}
                        onChange={(e) => setTravelerPhone(e.target.value)}
                        placeholder="+221 77 000 00 00"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Message aux professionnels (attentes, centres d'intérêt)</label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Nous souhaitons découvrir les villages et la culture locale..."
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Duration recap pill */}
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-emerald-900 font-bold">Durée calculée automatiquement :</span>
                    <span className="font-extrabold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                      {nights} nuit(s) d'hébergement · {days} jour(s) de guidage
                    </span>
                  </div>

                  {/* Navigation footer */}
                  <div className="flex justify-between pt-3">
                    <button
                      onClick={() => setStep(1)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={15} />
                      <span>Retour</span>
                    </button>

                    <button
                      onClick={() => {
                        setStep(3);
                        handleCheckAvailability();
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <span>Vérifier les disponibilités & Devis</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: AVAILABILITY CHECK & FINAL CONFIRMATION */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Real-time server availability check banner */}
                  <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                    checkingAvailability
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : availabilityResult?.available
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {checkingAvailability ? (
                        <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      ) : availabilityResult?.available ? (
                        <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle size={20} className="text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold">
                          {checkingAvailability 
                            ? 'Vérification des disponibilités en cours côté serveur...' 
                            : availabilityResult?.available 
                              ? 'Disponibilités confirmées par le Backend !'
                              : 'Vérification requise ou prestation indisponible'}
                        </p>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          {availabilityResult?.message || 'Le serveur valide les calendriers de l\'hébergeur et du guide.'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckAvailability}
                      disabled={checkingAvailability}
                      className="text-[11px] font-bold underline cursor-pointer hover:opacity-80 shrink-0"
                    >
                      Re-vérifier
                    </button>
                  </div>

                  {/* Combined Travel Quote Breakdown */}
                  <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-lg">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase">Dossier de Voyage Combiné</span>
                        <h4 className="text-base font-bold text-white mt-0.5">Récapitulatif Financier & Prestations</h4>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                        Réf temporaire : TT-2026-DRAFT
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {/* Accommodation Line */}
                      {selectedAccOffer && (
                        <div className="flex justify-between items-center bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">🏨</span>
                            <div>
                              <p className="font-bold text-white">{selectedAccEst?.name}</p>
                              <p className="text-[11px] text-slate-400">
                                {selectedAccOffer.title} ({nights} nuit{nights > 1 ? 's' : ''} × {selectedAccOffer.price.toLocaleString()} FCFA)
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-400">{accTotal.toLocaleString()} FCFA</span>
                        </div>
                      )}

                      {/* Guide Line */}
                      {selectedGuideOffer && (
                        <div className="flex justify-between items-center bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">🥾</span>
                            <div>
                              <p className="font-bold text-white">{selectedGuideEst?.name}</p>
                              <p className="text-[11px] text-slate-400">
                                Guidage agréé ({days} jour{days > 1 ? 's' : ''} × {selectedGuideOffer.price.toLocaleString()} FCFA)
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-400">{guideTotal.toLocaleString()} FCFA</span>
                        </div>
                      )}
                    </div>

                    {/* Total Combined */}
                    <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-slate-400">Total séjour tout compris :</span>
                        <p className="text-[10px] text-emerald-300">Paiement sur place auprès des prestataires</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl sm:text-2xl font-black text-emerald-400">
                          {grandTotal.toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Authentication Gateway Notice if not logged in */}
                  {!currentUser ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-900">
                      <div className="flex items-center gap-2">
                        <UserCheck size={18} className="text-amber-700 shrink-0" />
                        <span>
                          Une connexion ou création de compte voyageur est requise pour envoyer ce dossier.
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenAuth('login')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-xs"
                      >
                        Se connecter / Créer un compte
                      </button>
                    </div>
                  ) : (
                    <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-600">
                      <span>Demandeur : <strong className="text-gray-900">{currentUser.name}</strong> ({currentUser.email})</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 size={14} /> Connecté
                      </span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex justify-between pt-3">
                    <button
                      onClick={() => setStep(2)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft size={15} />
                      <span>Modifier les dates</span>
                    </button>

                    <button
                      onClick={handleSubmitBooking}
                      disabled={submitting || checkingAvailability}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-7 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Transmission du dossier...</span>
                        </>
                      ) : (
                        <>
                          <Luggage size={16} />
                          <span>Envoyer la demande de réservation combinée</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
