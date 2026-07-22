/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Building, Plus, Edit3, TrendingUp, Calendar, Users, CheckCircle, 
  XCircle, AlertCircle, DollarSign, Clock, Sliders, ShieldAlert, MapPin, 
  Phone, Mail, ArrowRight, Eye, RefreshCw, Star, Info, Folder,
  ChevronLeft, ChevronRight, Lock, Unlock, Check, UserCheck, FileText, LayoutDashboard
} from 'lucide-react';
import { Establishment, Offer, Booking, Review, User as UserType, SenegalDestination } from '../../shared/types';
import { TerangaLogo } from '../../shared/ui/TerangaLogo';

interface HostAppProps {
  currentUser: UserType | null;
  establishments: Establishment[];
  onRefreshData: () => Promise<void>;
  onDirectLogin: (email: string, role: string) => void;
}

export default function HostApp({ 
  currentUser, 
  establishments, 
  onRefreshData,
  onDirectLogin
}: HostAppProps) {
  // Navigation Module Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'offers' | 'dossiers' | 'calendar' | 'bookings' | 'reviews' | 'stats'>('dashboard');
  const [selectedDossierOfferId, setSelectedDossierOfferId] = useState<string | null>(null);

  // Calendar States
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Local States
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  // Form States for modifying establishment
  const [showEditEst, setShowEditEst] = useState(false);
  const [estName, setEstName] = useState('');
  const [estDesc, setEstDesc] = useState('');
  const [estEmail, setEstEmail] = useState('');
  const [estPhone, setEstPhone] = useState('');
  const [estAmenities, setEstAmenities] = useState('');

  // Form States for new offer
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerPromoPrice, setOfferPromoPrice] = useState('');
  const [offerCurrency, setOfferCurrency] = useState('FCFA');
  const [offerLat, setOfferLat] = useState('');
  const [offerLng, setOfferLng] = useState('');
  const [offerStartDate, setOfferStartDate] = useState('');
  const [offerEndDate, setOfferEndDate] = useState('');
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerCapacity, setOfferCapacity] = useState('2');
  const [offerQty, setOfferQty] = useState('2');
  const [offerServices, setOfferServices] = useState('');

  // Form States for registering new establishment
  const [showRegisterEst, setShowRegisterEst] = useState(false);
  const [newEstName, setNewEstName] = useState('');
  const [newEstDesc, setNewEstDesc] = useState('');
  const [newEstLocation, setNewEstLocation] = useState<SenegalDestination>('Dakar');
  const [newEstType, setNewEstType] = useState<'hotel' | 'campement' | 'maison_hotes'>('hotel');
  const [newEstEmail, setNewEstEmail] = useState('');
  const [newEstPhone, setNewEstPhone] = useState('');
  const [newEstAmenities, setNewEstAmenities] = useState('');

  // Find the logged-in user's establishment if any (must be hotel, campement, maison_hotes)
  const myEstablishment = establishments.find(
    e => e.ownerId === currentUser?.id || e.id === currentUser?.establishmentId
  );

  const isHebergeurEst = myEstablishment && ['hotel', 'campement', 'maison_hotes'].includes(myEstablishment.type);

  // Fetch offers & bookings for this establishment
  const fetchMyData = async () => {
    if (!myEstablishment) return;
    setLoading(true);
    try {
      const offersRes = await fetch(`/api/establishments/${myEstablishment.id}/offers`);
      if (offersRes.ok) {
        setOffers(await offersRes.json());
      }
      const bookingsRes = await fetch(`/api/bookings?establishmentId=${myEstablishment.id}&role=professional`);
      if (bookingsRes.ok) {
        setBookings(await bookingsRes.json());
      }
      const reviewsRes = await fetch(`/api/reviews?establishmentId=${myEstablishment.id}`);
      if (reviewsRes.ok) {
        setReviews(await reviewsRes.json());
      }
    } catch (e) {
      console.error('Error fetching host data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myEstablishment) {
      fetchMyData();
      
      setEstName(myEstablishment.name);
      setEstDesc(myEstablishment.description);
      setEstEmail(myEstablishment.contactEmail || '');
      setEstPhone(myEstablishment.contactPhone || '');
      setEstAmenities(myEstablishment.amenities.join(', '));
    } else {
      setOffers([]);
      setBookings([]);
    }
  }, [myEstablishment, currentUser]);

  // Handle Register establishment
  const handleRegisterEst = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const response = await fetch('/api/establishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEstName,
          description: newEstDesc,
          location: newEstLocation,
          type: newEstType,
          ownerId: currentUser.id,
          amenities: newEstAmenities.split(',').map(s => s.trim()).filter(Boolean),
          contactEmail: newEstEmail,
          contactPhone: newEstPhone
        })
      });
      if (response.ok) {
        await onRefreshData();
        setShowRegisterEst(false);
      }
    } catch (err) {
      console.error('Failed to register establishment:', err);
    }
  };

  // Handle Edit establishment
  const handleEditEst = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myEstablishment) return;
    try {
      const response = await fetch(`/api/establishments/${myEstablishment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: estName,
          description: estDesc,
          contactEmail: estEmail,
          contactPhone: estPhone,
          amenities: estAmenities.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (response.ok) {
        await onRefreshData();
        setShowEditEst(false);
        alert("Modifications enregistrées ! Votre profil est en attente de validation par l'administrateur.");
      }
    } catch (err) {
      console.error('Failed to update establishment:', err);
    }
  };

  // Helper to start editing an existing offer
  const startEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferTitle(offer.title);
    setOfferDesc(offer.description);
    setOfferPrice(String(offer.price));
    setOfferPromoPrice(offer.promoPrice ? String(offer.promoPrice) : '');
    setOfferCurrency(offer.currency || 'FCFA');
    setOfferCapacity(String(offer.capacity));
    setOfferQty(String(offer.availableQuantity));
    setOfferServices(offer.services.join(', '));
    setOfferLat(offer.coordinates?.lat ? String(offer.coordinates.lat) : '');
    setOfferLng(offer.coordinates?.lng ? String(offer.coordinates.lng) : '');
    if (offer.availabilityCalendar && offer.availabilityCalendar.length > 0) {
      setOfferStartDate(offer.availabilityCalendar[0].startDate);
      setOfferEndDate(offer.availabilityCalendar[0].endDate);
    } else {
      setOfferStartDate('');
      setOfferEndDate('');
    }
    setShowAddOffer(true);
  };

  const resetOfferForm = () => {
    setOfferTitle('');
    setOfferDesc('');
    setOfferPrice('');
    setOfferPromoPrice('');
    setOfferCurrency('FCFA');
    setOfferLat('');
    setOfferLng('');
    setOfferStartDate('');
    setOfferEndDate('');
    setOfferCapacity('2');
    setOfferQty('2');
    setOfferServices('');
    setEditingOffer(null);
    setShowAddOffer(false);
  };

  // Handle Add offer
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myEstablishment) return;
    try {
      const isPromo = Boolean(offerPromoPrice);
      const payload = {
        title: offerTitle,
        description: offerDesc,
        price: Number(offerPrice),
        promoPrice: isPromo ? Number(offerPromoPrice) : undefined,
        currency: offerCurrency,
        capacity: Number(offerCapacity),
        services: offerServices.split(',').map(s => s.trim()).filter(Boolean),
        availableQuantity: Number(offerQty),
        coordinates: (offerLat && offerLng) ? { lat: Number(offerLat), lng: Number(offerLng) } : undefined,
        availabilityCalendar: (offerStartDate && offerEndDate) ? [{
          startDate: offerStartDate,
          endDate: offerEndDate,
          available: true
        }] : [],
        status: 'pending' as const
      };

      const response = await fetch(`/api/establishments/${myEstablishment.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        resetOfferForm();
        await fetchMyData();
        alert("Offre publiée avec succès ! Elle est en attente de validation par l'administrateur.");
      }
    } catch (err) {
      console.error('Failed to create offer:', err);
    }
  };

  // Handle Edit offer submit
  const handleEditOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      const isPromo = Boolean(offerPromoPrice);
      const payload = {
        title: offerTitle,
        description: offerDesc,
        price: Number(offerPrice),
        promoPrice: isPromo ? Number(offerPromoPrice) : null,
        currency: offerCurrency,
        capacity: Number(offerCapacity),
        services: offerServices.split(',').map(s => s.trim()).filter(Boolean),
        availableQuantity: Number(offerQty),
        coordinates: (offerLat && offerLng) ? { lat: Number(offerLat), lng: Number(offerLng) } : undefined,
        availabilityCalendar: (offerStartDate && offerEndDate) ? [{
          startDate: offerStartDate,
          endDate: offerEndDate,
          available: true
        }] : [],
        status: 'pending' as const
      };

      const response = await fetch(`/api/offers/${editingOffer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        resetOfferForm();
        await fetchMyData();
        alert("Offre corrigée et republiée ! Elle est en attente de validation par l'administrateur.");
      }
    } catch (err) {
      console.error('Failed to update offer:', err);
    }
  };

  // Handle booking status change
  const handleBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await fetchMyData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle Calendar Availability Toggle per offer date
  const toggleDateAvailability = async (offerId: string, dateStr: string, currentStatus: boolean) => {
    try {
      const offer = offers.find(o => o.id === offerId);
      if (!offer) return;

      const existingCalendar = offer.availabilityCalendar || [];
      const updatedCalendar = existingCalendar.filter(c => c.startDate !== dateStr);
      
      updatedCalendar.push({
        startDate: dateStr,
        endDate: dateStr,
        available: !currentStatus
      });

      const res = await fetch(`/api/offers/${offerId}/calendar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityCalendar: updatedCalendar })
      });

      if (res.ok) {
        await fetchMyData();
      }
    } catch (e) {
      console.error('Failed to toggle calendar availability:', e);
    }
  };

  // Categories of offers based on validation
  const pendingOffers = offers.filter(o => (o.status || 'approved') === 'pending');
  const approvedOffers = offers.filter(o => (o.status || 'approved') === 'approved');
  const rejectedOffers = offers.filter(o => (o.status || 'approved') === 'rejected');

  // Stats calculation
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const totalRevenue = approvedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalQty = approvedOffers.reduce((sum, o) => sum + o.availableQuantity, 0);
  const occupancyRate = totalQty > 0 ? Math.round((approvedBookings.length / (totalQty * 10)) * 100) : 0;

  // Selected Dossier Offer
  const currentDossierOffer = offers.find(o => o.id === selectedDossierOfferId) || offers[0];
  const dossierBookings = currentDossierOffer ? bookings.filter(b => b.offerId === currentDossierOffer.id) : [];

  // If user is not logged in as Hébergeur
  if (!currentUser || currentUser.role !== 'professional' || (myEstablishment && !isHebergeurEst)) {
    return (
      <div id="hebergeurs-auth-gate" className="max-w-4xl mx-auto space-y-8 animate-fade-in py-12 flex flex-col items-center">
        <TerangaLogo size={88} showText={true} textPosition="bottom" className="mb-2 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm" />
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full border border-emerald-100 font-sans font-medium text-xs tracking-wider uppercase">
            🏨 Application Web Hébergeurs — Logiciel de Gestion
          </div>
          <h2 className="font-sans font-bold text-3xl text-gray-900 tracking-tight">
            Logiciel de Gestion Hébergements & Hôtels
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Un véritable logiciel de gestion au quotidien pour votre établissement. Gérer vos chambres, suivre vos dossiers clients, planifier votre calendrier de disponibilités et piloter vos réservations sans commission.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg max-w-xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto">
            <Building size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-lg text-gray-900">Connexion requise</h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
              Pour accéder au logiciel de gestion, vous devez être connecté avec un profil professionnel de type **Hébergeur**.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Accès d'évaluation rapide :</p>
            <button
              onClick={() => onDirectLogin('professional@teranga.sn', 'professional')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold py-3 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>🔑 Se connecter en tant que Cheikh Ndiaye (Hébergeur Dakar)</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app-hebergeurs-root" className="space-y-6 animate-fade-in font-sans">
      
      {/* HEADER: GREEN HÔTE THEME */}
      <div className="bg-[#003d29] text-white p-5 md:p-6 rounded-3xl border border-emerald-900/60 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-800/40 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              • ESPACE HÉBERGEMENT & LOGICIEL DE GESTION SÉNÉGAL
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <TerangaLogo size={32} showText={false} className="bg-emerald-950 p-1 rounded-xl border border-emerald-800 shrink-0" />
              Teranga Travel — Portail Hébergeur ({myEstablishment ? myEstablishment.name : 'Mon Établissement'})
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/80 border border-emerald-800/80 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
              <span className="text-emerald-100 font-medium">{currentUser?.name || 'Cheikh Ndiaye'}</span>
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                CN
              </div>
            </div>
            {myEstablishment && (
              <button
                onClick={() => setShowEditEst(!showEditEst)}
                className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={14} /> Modifier Fiche
              </button>
            )}
          </div>
        </div>

        {/* DARK GREEN HERO BANNER WITH 4 STAT CARDS */}
        {myEstablishment && (
          <div className="bg-[#004d34] p-6 rounded-2xl border border-emerald-700/60 space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="bg-emerald-900/80 text-emerald-300 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-700/60 uppercase tracking-wider inline-block mb-2">
                  LOGICIEL DE GESTION HÔTELIÈRE & SÉJOURS
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Espace de Pilotage Métier
                </h2>
                <p className="text-emerald-100 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                  Gérez vos chambres, vos dossiers clients automatiques par offre, planifiez votre calendrier de réservations et gardez le contrôle direct sur vos encaissements (paiement sur place).
                </p>
              </div>

              <span className="bg-emerald-950/80 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-800/80 flex items-center gap-1.5 shrink-0">
                📍 {myEstablishment.location.toUpperCase()}, SÉNÉGAL
              </span>
            </div>

            {/* 4 STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#023b28] p-4 rounded-xl border border-emerald-700/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={12} /> OFFRES / CHAMBRES
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{offers.length}</span>
                  <span className="text-[11px] text-emerald-400 font-medium">({approvedOffers.length} validés)</span>
                </div>
              </div>

              <div className="bg-[#023b28] p-4 rounded-xl border border-emerald-700/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder size={12} /> DOSSIERS REÇUS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{bookings.length}</span>
                  <span className="text-[11px] text-amber-300 font-medium">({bookings.filter(b => b.status === 'pending').length} nouveaux)</span>
                </div>
              </div>

              <div className="bg-[#023b28] p-4 rounded-xl border border-emerald-700/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp size={12} /> SÉJOURS VALIDÉS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{approvedBookings.length}</span>
                  <span className="text-[11px] text-emerald-400 font-medium">programmés</span>
                </div>
              </div>

              <div className="bg-[#023b28] p-4 rounded-xl border border-emerald-700/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={12} /> NOTE AVIS GLOBAUX
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{myEstablishment.rating ? myEstablishment.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-[11px] text-emerald-300 font-medium">({reviews.length} avis)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODULE NAVIGATION BAR FOR HEBERGEURS */}
      {myEstablishment && (
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard size={14} /> Tableau de Bord
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'offers' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sliders size={14} /> Offres & Chambres ({offers.length})
          </button>

          <button
            onClick={() => setActiveTab('dossiers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dossiers' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Folder size={14} /> Dossiers par Offre ({offers.length})
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'calendar' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar size={14} /> Calendrier & Disponibilités
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bookings' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText size={14} /> Réservations ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reviews' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star size={14} /> Avis Clientèle ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stats' ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={14} /> Statistiques
          </button>
        </div>
      )}

      {/* Edit Establishment Info Form Panel */}
      {myEstablishment && showEditEst && (
        <form onSubmit={handleEditEst} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-fade-in max-w-2xl">
          <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
            Modifier les informations de l'établissement
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Nom commercial</label>
              <input
                type="text"
                required
                value={estName}
                onChange={(e) => setEstName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Équipements</label>
              <input
                type="text"
                value={estAmenities}
                onChange={(e) => setEstAmenities(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                placeholder="Wifi, climatisation, piscine..."
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Description immersive</label>
            <textarea
              required
              rows={3}
              value={estDesc}
              onChange={(e) => setEstDesc(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-800"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Email de contact</label>
              <input
                type="email"
                required
                value={estEmail}
                onChange={(e) => setEstEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Téléphone</label>
              <input
                type="text"
                required
                value={estPhone}
                onChange={(e) => setEstPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Publier les corrections
            </button>
            <button
              type="button"
              onClick={() => setShowEditEst(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Add / Edit Offer Form Panel */}
      {myEstablishment && showAddOffer && (
        <form onSubmit={editingOffer ? handleEditOfferSubmit : handleAddOffer} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-fade-in max-w-2xl">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-sans font-bold text-sm text-gray-900">
              {editingOffer ? `Modifier l'Offre : ${editingOffer.title}` : "Créer une nouvelle Offre / Chambre"}
            </h3>
            {editingOffer && (
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded font-bold">
                Mode Correction
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Intitulé de l'offre (chambre / lodge)</label>
              <input
                type="text"
                required
                placeholder="Ex. Suite Royale vue Océan"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Tarif Normal</label>
                <input
                  type="number"
                  required
                  placeholder="Ex. 45000"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Devise</label>
                <select
                  value={offerCurrency}
                  onChange={(e) => setOfferCurrency(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-2 py-2 rounded-xl text-xs text-gray-800"
                >
                  <option value="FCFA">FCFA</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Description de l'offre</label>
            <textarea
              required
              rows={3}
              placeholder="Équipements inclus, superficie, types de lit..."
              value={offerDesc}
              onChange={(e) => setOfferDesc(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Capacité (personnes)</label>
              <input
                type="number"
                required
                value={offerCapacity}
                onChange={(e) => setOfferCapacity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Quantité disponible</label>
              <input
                type="number"
                required
                value={offerQty}
                onChange={(e) => setOfferQty(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800 font-mono"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Services (séparés par virgules)</label>
              <input
                type="text"
                placeholder="Ex. Wi-Fi, Climatisation, Jacuzzi"
                value={offerServices}
                onChange={(e) => setOfferServices(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              {editingOffer ? "Enregistrer les Corrections" : "Envoyer pour validation"}
            </button>
            <button
              type="button"
              onClick={resetOfferForm}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* MODULE TAB 1: DASHBOARD OVERVIEW */}
      {myEstablishment && activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Réservations reçues</span>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xl text-gray-900">{totalBookings}</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                  <Calendar size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Offres Publiées</span>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xl text-gray-900">{offers.length}</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                  <Sliders size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Taux d'occupation</span>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xl text-gray-900">{occupancyRate}%</span>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                  <TrendingUp size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Revenus estimatifs (FCFA)</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-base text-gray-900">{totalRevenue.toLocaleString('fr-FR')}</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                  <DollarSign size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-2">
                    <Sliders className="text-emerald-700" size={16} />
                    Offres récentes ({offers.length})
                  </h3>
                  <button
                    onClick={() => setShowAddOffer(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Ajouter Chambre
                  </button>
                </div>
                {offers.map(offer => (
                  <div key={offer.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-gray-900">{offer.title}</h4>
                      <p className="text-gray-500 text-[11px] font-mono">{offer.price.toLocaleString('fr-FR')} {offer.currency || 'FCFA'}</p>
                    </div>
                    <button
                      onClick={() => { setSelectedDossierOfferId(offer.id); setActiveTab('dossiers'); }}
                      className="bg-emerald-50 text-emerald-800 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Folder size={12} /> Voir Dossier Clients
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Calendar className="text-emerald-700" size={16} />
                  Dernières réservations ({bookings.length})
                </h3>
                {bookings.slice(0, 4).map(book => (
                  <div key={book.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{book.offerTitle}</span>
                      <span className="text-emerald-700 font-mono">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Client : {book.touristName} ({book.touristEmail})</p>
                    <div className="text-[10px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-100 font-semibold">
                      💳 Mode de règlement : <b>Paiement sur place</b> (Wave, Orange Money, Espèces)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE TAB 2: GESTION DES OFFRES & CHAMBRES */}
      {myEstablishment && activeTab === 'offers' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
                <Sliders className="text-emerald-700" size={18} />
                Gestion de vos Chambres, Suites & Offres
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Créez et modifiez les tarifs, capacités et descriptions de vos hébergements.
              </p>
            </div>
            <button
              onClick={() => setShowAddOffer(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Ajouter une Chambre
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map(offer => (
              <div key={offer.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3 relative hover:border-emerald-300 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{offer.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase mt-1 inline-block ${
                      offer.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      offer.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {offer.status === 'approved' ? '✓ Validée' : offer.status === 'rejected' ? '✗ Refusée' : '⏰ En cours d\'examen'}
                    </span>
                  </div>
                  <button
                    onClick={() => startEditOffer(offer)}
                    className="p-2 hover:bg-gray-200/60 rounded-xl text-gray-600 cursor-pointer border border-gray-200"
                    title="Modifier l'offre"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{offer.description}</p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-200/60">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">Tarif nuitée</span>
                    <span className="font-mono font-bold text-emerald-800">{offer.price.toLocaleString('fr-FR')} {offer.currency || 'FCFA'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">Stock disponible</span>
                    <span className="font-mono font-bold text-gray-800">{offer.availableQuantity} hébergements</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => { setSelectedDossierOfferId(offer.id); setActiveTab('dossiers'); }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                  >
                    Accéder au dossier de gestion →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE TAB 3: DOSSIERS AUTOMATIQUES PAR OFFRE */}
      {myEstablishment && activeTab === 'dossiers' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider inline-block mb-2">
              📁 ESPACE CLIENTS & DOSSIERS D'OFFRE
            </span>
            <h3 className="font-sans font-bold text-lg text-gray-900 flex items-center gap-2">
              <Folder className="text-emerald-700" size={20} />
              Dossiers Automatiques par Offre / Chambre
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Chaque offre publiée regroupe automatiquement les dossiers de réservation de vos voyageurs inscrits, leurs coordonnées et leur historique.
            </p>
          </div>

          {/* Offer Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {offers.map(off => {
              const count = bookings.filter(b => b.offerId === off.id).length;
              const isSelected = (currentDossierOffer?.id === off.id);
              return (
                <button
                  key={off.id}
                  onClick={() => setSelectedDossierOfferId(off.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                    isSelected ? 'bg-emerald-900 text-white border-emerald-800 shadow-md' : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-white text-gray-600 border border-gray-200'
                    }`}>
                      DOSSIER OFFRE
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {count} client(s)
                    </span>
                  </div>
                  <h4 className="font-bold text-xs truncate">{off.title}</h4>
                  <p className={`text-[10px] font-mono ${isSelected ? 'text-emerald-200' : 'text-gray-500'}`}>
                    {off.price.toLocaleString('fr-FR')} FCFA / nuit
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Offer Dossier Detail */}
          {currentDossierOffer && (
            <div className="bg-emerald-50/40 border border-emerald-100 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Fiche Dossier Actif</span>
                  <h4 className="text-xl font-bold text-gray-900">{currentDossierOffer.title}</h4>
                  <p className="text-xs text-gray-500">{currentDossierOffer.description}</p>
                </div>
                <div className="bg-emerald-900 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold text-right shrink-0">
                  {currentDossierOffer.price.toLocaleString('fr-FR')} FCFA / nuit
                </div>
              </div>

              {/* Registered Travelers Table / Directory */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-emerald-700" />
                  Liste des Voyageurs Inscrits à cette Offre ({dossierBookings.length})
                </h4>

                {dossierBookings.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center text-xs text-gray-400 border border-gray-200/80">
                    Aucune réservation enregistrée pour ce dossier d'offre pour le moment.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dossierBookings.map(book => (
                      <div key={book.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-gray-100 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 block uppercase">Identité du voyageur</span>
                            <span className="font-bold text-sm text-gray-900">{book.touristName}</span>
                            <span className="text-xs text-gray-500 block">📧 {book.touristEmail}</span>
                          </div>
                          <div className="text-right">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase inline-block ${
                              book.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              book.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {book.status === 'approved' ? '✓ Séjour Confirmé' : book.status === 'rejected' ? '✗ Décliné' : '⏰ En attente'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">Période du séjour</span>
                            <span className="font-mono text-gray-800">{book.checkIn} → {book.checkOut}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">Voyageurs</span>
                            <span className="font-bold text-gray-800">{book.guestsCount} personne(s)</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">Montant Total</span>
                            <span className="font-mono font-bold text-emerald-800">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">Politique Règlement</span>
                            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-extrabold px-2 py-0.5 rounded border border-emerald-200 inline-block">
                              Paiement sur place
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200/60 text-[11px] text-gray-600 flex justify-between items-center">
                          <span><b>Historique :</b> Réservation enregistrée le {book.createdAt || 'Récemment'}</span>
                          {book.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleBookingStatus(book.id, 'rejected')}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-lg border border-rose-200 text-[10px] cursor-pointer"
                              >
                                Décliner
                              </button>
                              <button
                                onClick={() => handleBookingStatus(book.id, 'approved')}
                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer"
                              >
                                Confirmer
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODULE TAB 4: CALENDRIER ET DISPONIBILITÉS */}
      {myEstablishment && activeTab === 'calendar' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
            <div>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 uppercase tracking-wider inline-block mb-2">
                📅 CALENDRIER AVANCÉ DE DISPONIBILITÉS
              </span>
              <h3 className="font-sans font-bold text-lg text-gray-900 flex items-center gap-2">
                <Calendar className="text-emerald-700" size={20} />
                Planning & Ouverture des Dates
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Gérez en temps réel l'ouverture de vos chambres, bloquez les dates complètes ou fermées pour travaux.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Calendar Grid View */}
            <div className="lg:col-span-7 bg-gray-50 p-5 rounded-2xl border border-gray-200/80 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-gray-900">Août 2026</h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-md border border-emerald-200">
                  Planning Ouvert
                </span>
              </div>

              {/* Calendar Days Table */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                  <span key={d} className="font-bold text-gray-400 text-[10px] py-1">{d}</span>
                ))}

                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                  const isSelected = selectedCalendarDate === dateStr;
                  const currentOffer = offers[0];
                  const isCalendarClosed = currentOffer?.availabilityCalendar?.some(c => c.startDate === dateStr && !c.available);

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedCalendarDate(dateStr)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-emerald-700 bg-emerald-900 text-white font-bold' :
                        isCalendarClosed ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold' :
                        'bg-white hover:bg-emerald-50/50 text-gray-800 border-gray-200'
                      }`}
                    >
                      <span className="block text-xs">{dayNum}</span>
                      <span className="text-[8px] block font-mono">
                        {isCalendarClosed ? 'FERMÉ' : 'OUVERT'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Details & Controls */}
            <div className="lg:col-span-5 bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-emerald-700" />
                Action pour le {selectedCalendarDate}
              </h4>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200/80 text-xs">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Offres concernées</span>
                {offers.map(off => {
                  const isClosed = off.availabilityCalendar?.some(c => c.startDate === selectedCalendarDate && !c.available);
                  return (
                    <div key={off.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                      <div>
                        <span className="font-bold text-gray-900 block">{off.title}</span>
                        <span className="text-[10px] text-gray-500 font-mono">Stock : {off.availableQuantity} chambres</span>
                      </div>
                      <button
                        onClick={() => toggleDateAvailability(off.id, selectedCalendarDate, !isClosed)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          isClosed ? 'bg-emerald-700 text-white' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {isClosed ? 'Ouvrir la Date' : 'Fermer la Date'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200/80 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-gray-400 block uppercase">Arrivées & Départs du jour</span>
                {bookings.filter(b => b.checkIn === selectedCalendarDate || b.checkOut === selectedCalendarDate).length === 0 ? (
                  <p className="text-gray-400 italic text-[11px]">Aucun mouvement prévu pour cette date.</p>
                ) : (
                  bookings.filter(b => b.checkIn === selectedCalendarDate || b.checkOut === selectedCalendarDate).map(b => (
                    <div key={b.id} className="p-2 bg-emerald-50 text-emerald-900 rounded-lg text-[11px] font-medium">
                      👤 {b.touristName} — {b.checkIn === selectedCalendarDate ? 'Arrivée' : 'Départ'} ({b.offerTitle})
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE TAB 5: LISTE DES RÉSERVATIONS */}
      {myEstablishment && activeTab === 'bookings' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
              <FileText className="text-emerald-700" size={18} />
              Toutes les Réservations ({bookings.length})
            </h3>
          </div>

          <div className="space-y-3">
            {bookings.map(book => (
              <div key={book.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-gray-900 text-sm">{book.offerTitle}</span>
                  <p className="text-gray-600">Voyageur : <b>{book.touristName}</b> ({book.touristEmail})</p>
                  <span className="text-gray-500 font-mono block">🗓️ Dates : {book.checkIn} → {book.checkOut} ({book.guestsCount} pers.)</span>
                  <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                    💳 Paiement sur place à l'arrivée
                  </span>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="font-mono font-bold text-emerald-800 text-sm">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                    book.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    book.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {book.status === 'approved' ? '✓ Confirmée' : book.status === 'rejected' ? '✗ Déclinée' : '⏰ En attente'}
                  </span>

                  {book.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleBookingStatus(book.id, 'rejected')}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-xl font-bold border border-rose-200 cursor-pointer"
                      >
                        Décliner
                      </button>
                      <button
                        onClick={() => handleBookingStatus(book.id, 'approved')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                      >
                        Accepter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE TAB 6: AVIS ET EVALUATIONS */}
      {myEstablishment && activeTab === 'reviews' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" size={18} />
              Avis Clientèle & Notes ({reviews.length})
            </h3>
            <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
              Note moyenne : {myEstablishment?.rating?.toFixed(1) || '5.0'} / 5.0
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">{rev.touristName || rev.authorName || 'Touriste Teranga'}</span>
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < rev.rating ? 'fill-amber-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 italic">"{rev.comment}"</p>
                <span className="text-[10px] text-gray-400 font-mono block">Publié le {rev.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE TAB 7: STATISTIQUES */}
      {myEstablishment && activeTab === 'stats' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-emerald-700" size={18} />
              Statistiques de Fréquentation & Fréquence
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Réservations Confirmées</span>
              <span className="text-3xl font-black text-emerald-950">{approvedBookings.length}</span>
              <p className="text-[11px] text-emerald-700">Voyageurs accueillis à ce jour</p>
            </div>

            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Taux d'Occupation Stimé</span>
              <span className="text-3xl font-black text-blue-950">{occupancyRate}%</span>
              <p className="text-[11px] text-blue-700">Calculé sur la capacité publiée</p>
            </div>

            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Volume d'Affaires Brut</span>
              <span className="text-2xl font-black text-amber-950 font-mono">{totalRevenue.toLocaleString('fr-FR')} FCFA</span>
              <p className="text-[11px] text-amber-700">Encaissé directement sur place</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
