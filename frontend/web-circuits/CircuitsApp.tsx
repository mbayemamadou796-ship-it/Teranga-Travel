/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Compass, Map, Sparkles, CheckCircle, XCircle, AlertCircle, Calendar, 
  Users, DollarSign, Sliders, Info, MapPin, Plus, Edit3, ArrowRight,
  User, Star, BookOpen, Clock, RefreshCw, Layers, Folder, FileText,
  TrendingUp, LayoutDashboard, Lock, Unlock, Check
} from 'lucide-react';
import { Establishment, Offer, Booking, Review, User as UserType, SenegalDestination } from '../../shared/types';
import { TerangaLogo } from '../../shared/ui/TerangaLogo';

interface CircuitsAppProps {
  currentUser: UserType | null;
  establishments: Establishment[];
  onRefreshData: () => Promise<void>;
  onDirectLogin: (email: string, role: string) => void;
}

export default function CircuitsApp({
  currentUser,
  establishments,
  onRefreshData,
  onDirectLogin
}: CircuitsAppProps) {
  // Navigation Module Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'circuits' | 'dossiers' | 'calendar' | 'bookings' | 'reviews' | 'stats'>('dashboard');
  const [selectedDossierOfferId, setSelectedDossierOfferId] = useState<string | null>(null);

  // Calendar States
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Local States
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Form States for modifying profile
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSpecialties, setProfileSpecialties] = useState('');

  // Form States for creating a circuit (agencies) or daily rate (guides)
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDuration, setOfferDuration] = useState('1');
  const [offerServices, setOfferServices] = useState('');
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Form States for registering new agency/guide profile
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDesc, setNewProfileDesc] = useState('');
  const [newProfileLocation, setNewProfileLocation] = useState<SenegalDestination>('Dakar');
  const [newProfileType, setNewProfileType] = useState<'agence' | 'guide'>('agence');
  const [newProfileEmail, setNewProfileEmail] = useState('');
  const [newProfilePhone, setNewProfilePhone] = useState('');
  const [newProfileSpecialties, setNewProfileSpecialties] = useState('');

  // Find the logged-in user's profile (either agency or guide)
  const myProfile = establishments.find(
    e => e.ownerId === currentUser?.id || e.id === currentUser?.establishmentId
  );

  const isCircuitsGuidesEst = myProfile && ['agence', 'guide'].includes(myProfile.type);

  // Fetch offers & bookings for this agency/guide
  const fetchMyData = async () => {
    if (!myProfile) return;
    setLoading(true);
    try {
      const offersRes = await fetch(`/api/establishments/${myProfile.id}/offers`);
      if (offersRes.ok) {
        setOffers(await offersRes.json());
      }
      const bookingsRes = await fetch(`/api/bookings?establishmentId=${myProfile.id}&role=professional`);
      if (bookingsRes.ok) {
        setBookings(await bookingsRes.json());
      }
      const reviewsRes = await fetch(`/api/reviews?establishmentId=${myProfile.id}`);
      if (reviewsRes.ok) {
        setReviews(await reviewsRes.json());
      }
    } catch (e) {
      console.error('Error fetching circuits/guides pro data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myProfile) {
      fetchMyData();
      
      setProfileName(myProfile.name);
      setProfileDesc(myProfile.description);
      setProfileEmail(myProfile.contactEmail || '');
      setProfilePhone(myProfile.contactPhone || '');
      setProfileSpecialties(myProfile.amenities.join(', '));
    } else {
      setOffers([]);
      setBookings([]);
    }
  }, [myProfile, currentUser]);

  // Handle registering profile
  const handleRegisterProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const response = await fetch('/api/establishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProfileName,
          description: newProfileDesc,
          location: newProfileLocation,
          type: newProfileType,
          ownerId: currentUser.id,
          amenities: newProfileSpecialties.split(',').map(s => s.trim()).filter(Boolean),
          contactEmail: newProfileEmail,
          contactPhone: newProfilePhone
        })
      });
      if (response.ok) {
        await onRefreshData();
        setShowRegisterForm(false);
      }
    } catch (err) {
      console.error('Failed to register pro profile:', err);
    }
  };

  // Handle Edit profile details
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile) return;
    try {
      const response = await fetch(`/api/establishments/${myProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          description: profileDesc,
          contactEmail: profileEmail,
          contactPhone: profilePhone,
          amenities: profileSpecialties.split(',').map(s => s.trim()).filter(Boolean)
        })
      });
      if (response.ok) {
        await onRefreshData();
        setShowEditProfile(false);
        alert("Modifications enregistrées ! Votre profil est en attente de validation par l'administrateur.");
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  // Helper to start editing an existing circuit/offer
  const startEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferTitle(offer.title);
    setOfferDesc(offer.description);
    setOfferPrice(String(offer.price));
    setOfferDuration(String(offer.capacity || 1));
    setOfferServices(offer.services.join(', '));
    setShowAddOffer(true);
  };

  const resetOfferForm = () => {
    setOfferTitle('');
    setOfferDesc('');
    setOfferPrice('');
    setOfferDuration('1');
    setOfferServices('');
    setEditingOffer(null);
    setShowAddOffer(false);
  };

  // Handle Add circuit/offer
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile) return;
    try {
      const payload = {
        title: offerTitle,
        description: offerDesc,
        price: Number(offerPrice),
        capacity: Number(offerDuration),
        services: offerServices.split(',').map(s => s.trim()).filter(Boolean),
        availableQuantity: 15,
        status: 'pending' as const
      };

      const response = await fetch(`/api/establishments/${myProfile.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        resetOfferForm();
        await fetchMyData();
        alert("Circuit publié avec succès ! Il est en attente de validation par l'administrateur.");
      }
    } catch (err) {
      console.error('Failed to create circuit:', err);
    }
  };

  // Handle Edit circuit/offer submit
  const handleEditOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOffer) return;
    try {
      const payload = {
        title: offerTitle,
        description: offerDesc,
        price: Number(offerPrice),
        capacity: Number(offerDuration),
        services: offerServices.split(',').map(s => s.trim()).filter(Boolean),
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
        alert("Circuit corrigé et republié ! Il est en attente de validation par l'administrateur.");
      }
    } catch (err) {
      console.error('Failed to update circuit:', err);
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

  // Toggle departure availability for a date
  const toggleDepartureDate = async (offerId: string, dateStr: string, currentStatus: boolean) => {
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
      console.error('Failed to toggle departure availability:', e);
    }
  };

  // Categories of offers
  const pendingOffers = offers.filter(o => (o.status || 'approved') === 'pending');
  const approvedOffers = offers.filter(o => (o.status || 'approved') === 'approved');
  const rejectedOffers = offers.filter(o => (o.status || 'approved') === 'rejected');

  // Stats calculation
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const totalRevenue = approvedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Active Dossier Circuit
  const currentDossierOffer = offers.find(o => o.id === selectedDossierOfferId) || offers[0];
  const dossierBookings = currentDossierOffer ? bookings.filter(b => b.offerId === currentDossierOffer.id) : [];

  // Auth gate if not agency or guide
  if (!currentUser || currentUser.role !== 'professional' || (myProfile && !isCircuitsGuidesEst)) {
    return (
      <div id="circuits-auth-gate" className="max-w-4xl mx-auto space-y-8 animate-fade-in py-12 flex flex-col items-center">
        <TerangaLogo size={88} showText={true} textPosition="bottom" className="mb-2 bg-amber-500 text-white p-4 rounded-3xl border border-amber-600 shadow-xl" />
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-4 py-1.5 rounded-full border border-amber-200 font-sans font-medium text-xs tracking-wider uppercase">
            🧭 Application Web Agences & Guides — Logiciel Metier
          </div>
          <h2 className="font-sans font-bold text-3xl text-gray-900 tracking-tight">
            Espace Professionnel Agences de Voyage & Guides
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Gérez vos circuits, suivez vos dossiers de voyageurs inscrits par excursion et gérez vos départs en toute simplicité.
          </p>
        </div>

        <div className="bg-[#1C120C] text-white p-8 rounded-3xl border border-amber-900/60 shadow-2xl max-w-xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-900/40 text-amber-400 rounded-2xl flex items-center justify-center border border-amber-700/50 mx-auto">
            <Compass size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-lg text-white">Connexion requise</h3>
            <p className="text-amber-200 text-xs leading-relaxed max-w-sm mx-auto">
              Veuillez vous connecter avec un profil professionnel de type **Agence de Voyage** ou **Guide Touristique**.
            </p>
          </div>

          <div className="pt-4 border-t border-amber-900/60 space-y-3">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Accès d'évaluation rapide :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => onDirectLogin('agency_casamance@teranga.sn', 'professional')}
                className="bg-amber-600 hover:bg-amber-500 text-white font-sans font-bold py-2.5 px-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🚀 Agence Casamance</span>
                <ArrowRight size={12} />
              </button>

              <button
                onClick={() => onDirectLogin('guide_dakar@teranga.sn', 'professional')}
                className="bg-amber-800 hover:bg-amber-700 text-white font-sans font-bold py-2.5 px-3 rounded-xl text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🧭 Guide Abdoulaye</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app-circuits-root" className="space-y-6 animate-fade-in font-sans">
      
      {/* HEADER: AMBER/TERRACOTTA AGENCIES THEME */}
      <div className="bg-[#2A1B0E] text-white p-5 md:p-6 rounded-3xl border border-amber-900/60 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-amber-900/40 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              • PORTAIL AGENCES DE VOYAGE & GUIDES SÉNÉGAL
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <TerangaLogo size={32} showText={false} className="bg-amber-950 p-1 rounded-xl border border-amber-800 shrink-0" />
              Teranga Travel — Portail Pro ({myProfile ? myProfile.name : 'Mon Agence / Guide'})
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-950/80 border border-amber-800/80 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs">
              <span className="text-amber-100 font-medium">{currentUser?.name || 'Moussa Gueye'}</span>
              <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                PRO
              </div>
            </div>
            {myProfile && (
              <button
                onClick={() => setShowEditProfile(!showEditProfile)}
                className="bg-amber-800 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={14} /> Modifier Profil
              </button>
            )}
          </div>
        </div>

        {/* HERO BANNER WITH 4 STAT CARDS */}
        {myProfile && (
          <div className="bg-[#3D2714] p-6 rounded-2xl border border-amber-800/60 space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <span className="bg-amber-900/80 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-700/60 uppercase tracking-wider inline-block mb-2">
                  LOGICIEL DE GESTION DE CIRCUITS & EXCURSIONS
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Espace de Gestion des Excursions & Inscriptions
                </h2>
                <p className="text-amber-100 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
                  Consultez les dossiers automatiques par circuit, suivez les listes de voyageurs inscrits à chaque départ et gérez vos paiements sur place.
                </p>
              </div>

              <span className="bg-amber-950/80 text-amber-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-800/80 flex items-center gap-1.5 shrink-0">
                📍 {myProfile.location.toUpperCase()}, SÉNÉGAL
              </span>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#23150A] p-4 rounded-xl border border-amber-800/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={12} /> CIRCUITS PUBLIÉS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{offers.length}</span>
                  <span className="text-[11px] text-amber-400 font-medium">({approvedOffers.length} validés)</span>
                </div>
              </div>

              <div className="bg-[#23150A] p-4 rounded-xl border border-amber-800/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Folder size={12} /> DOSSIERS CIRCUITS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{bookings.length}</span>
                  <span className="text-[11px] text-emerald-300 font-medium">({bookings.filter(b => b.status === 'pending').length} nouveaux)</span>
                </div>
              </div>

              <div className="bg-[#23150A] p-4 rounded-xl border border-amber-800/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={12} /> VOYAGEURS CONFIRMÉS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{approvedBookings.length}</span>
                  <span className="text-[11px] text-amber-400 font-medium">inscrits</span>
                </div>
              </div>

              <div className="bg-[#23150A] p-4 rounded-xl border border-amber-800/50 space-y-1.5 shadow-xs">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Star size={12} /> NOTE AVIS GLOBAL
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{myProfile.rating ? myProfile.rating.toFixed(1) : '5.0'}</span>
                  <span className="text-[11px] text-amber-300 font-medium">({reviews.length} avis)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODULE NAVIGATION BAR FOR CIRCUITS & GUIDES */}
      {myProfile && (
        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-amber-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard size={14} /> Tableau de Bord
          </button>

          <button
            onClick={() => setActiveTab('circuits')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'circuits' ? 'bg-amber-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Compass size={14} /> Circuits & Excursions ({offers.length})
          </button>

          <button
            onClick={() => setActiveTab('dossiers')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dossiers' ? 'bg-amber-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Folder size={14} /> Dossiers par Circuit ({offers.length})
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'calendar' ? 'bg-amber-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar size={14} /> Calendrier des Départs
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bookings' ? 'bg-amber-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText size={14} /> Inscriptions ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reviews' ? 'bg-amber-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Star size={14} /> Avis Clientèle ({reviews.length})
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stats' ? 'bg-amber-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={14} /> Statistiques
          </button>
        </div>
      )}

      {/* Edit Profile Form Panel */}
      {myProfile && showEditProfile && (
        <form onSubmit={handleEditProfile} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-fade-in max-w-2xl">
          <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
            Modifier la fiche Agence / Guide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Nom commercial / Intitulé</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Spécialités</label>
              <input
                type="text"
                value={profileSpecialties}
                onChange={(e) => setProfileSpecialties(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                placeholder="Ecotourisme, Pirogue, Safari..."
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Présentation</label>
            <textarea
              required
              rows={3}
              value={profileDesc}
              onChange={(e) => setProfileDesc(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-800"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setShowEditProfile(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Add / Edit Circuit Form Panel */}
      {myProfile && showAddOffer && (
        <form onSubmit={editingOffer ? handleEditOfferSubmit : handleAddOffer} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-fade-in max-w-2xl">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h3 className="font-sans font-bold text-sm text-gray-900">
              {editingOffer ? `Modifier le Circuit : ${editingOffer.title}` : "Publier un nouveau Circuit / Excursion"}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Titre du Circuit</label>
              <input
                type="text"
                required
                placeholder="Ex. Traversée des Bolongs du Sine Saloum"
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Tarif (FCFA)</label>
                <input
                  type="number"
                  required
                  placeholder="Ex. 35000"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">Durée (jours)</label>
                <input
                  type="number"
                  required
                  value={offerDuration}
                  onChange={(e) => setOfferDuration(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Programme & Etapes</label>
            <textarea
              required
              rows={3}
              placeholder="Programme détaillé du circuit, points d'intérêt, restauration..."
              value={offerDesc}
              onChange={(e) => setOfferDesc(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-800"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
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
      {myProfile && activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Inscriptions Totales</span>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xl text-gray-900">{totalBookings}</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                  <Users size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Circuits Publiés</span>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xl text-gray-900">{offers.length}</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                  <Compass size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Inscriptions Confirmées</span>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-xl text-gray-900">{approvedBookings.length}</span>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                  <CheckCircle size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Revenus Estimatifs (FCFA)</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-base text-gray-900">{totalRevenue.toLocaleString('fr-FR')}</span>
                <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
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
                    <Compass className="text-amber-700" size={16} />
                    Circuits Récents ({offers.length})
                  </h3>
                  <button
                    onClick={() => setShowAddOffer(true)}
                    className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Publier Circuit
                  </button>
                </div>
                {offers.map(offer => (
                  <div key={offer.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold text-gray-900">{offer.title}</h4>
                      <p className="text-gray-500 text-[11px] font-mono">{offer.price.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                    <button
                      onClick={() => { setSelectedDossierOfferId(offer.id); setActiveTab('dossiers'); }}
                      className="bg-amber-50 text-amber-800 hover:bg-amber-100 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Folder size={12} /> Voir Dossier Voyageurs
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                  <Calendar className="text-amber-700" size={16} />
                  Dernières Inscriptions ({bookings.length})
                </h3>
                {bookings.slice(0, 4).map(book => (
                  <div key={book.id} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{book.offerTitle}</span>
                      <span className="text-amber-700 font-mono">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Voyageur : {book.touristName} ({book.touristEmail})</p>
                    <div className="text-[10px] text-amber-800 bg-amber-50/80 p-1.5 rounded-lg border border-amber-100 font-semibold">
                      💳 Réglement : <b>Paiement sur place au départ</b>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE TAB 2: CIRCUITS & EXCURSIONS */}
      {myProfile && activeTab === 'circuits' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
                <Compass className="text-amber-700" size={18} />
                Gestion de vos Circuits & Itinéraires
              </h3>
            </div>
            <button
              onClick={() => setShowAddOffer(true)}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Publier un Circuit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map(offer => (
              <div key={offer.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{offer.title}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase mt-1 inline-block ${
                      offer.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                      offer.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {offer.status === 'approved' ? '✓ Validé' : offer.status === 'rejected' ? '✗ Refusé' : '⏰ En examen'}
                    </span>
                  </div>
                  <button
                    onClick={() => startEditOffer(offer)}
                    className="p-2 hover:bg-gray-200 rounded-xl text-gray-600 cursor-pointer border border-gray-200"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{offer.description}</p>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs">
                  <span className="font-mono font-bold text-amber-800">{offer.price.toLocaleString('fr-FR')} FCFA</span>
                  <button
                    onClick={() => { setSelectedDossierOfferId(offer.id); setActiveTab('dossiers'); }}
                    className="text-xs font-bold text-amber-800 hover:text-amber-900 underline cursor-pointer"
                  >
                    Dossier Voyageurs →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE TAB 3: DOSSIERS PAR CIRCUIT */}
      {myProfile && activeTab === 'dossiers' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider inline-block mb-2">
              📁 DOSSIERS DE GESTION PAR CIRCUIT
            </span>
            <h3 className="font-sans font-bold text-lg text-gray-900 flex items-center gap-2">
              <Folder className="text-amber-700" size={20} />
              Dossiers Automatiques des Voyageurs
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Chaque circuit regroupant automatiquement les touristes inscrits, leurs coordonnées, les dates et le suivi des règlements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {offers.map(off => {
              const count = bookings.filter(b => b.offerId === off.id).length;
              const isSelected = (currentDossierOffer?.id === off.id);
              return (
                <button
                  key={off.id}
                  onClick={() => setSelectedDossierOfferId(off.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-2 ${
                    isSelected ? 'bg-amber-900 text-white border-amber-800 shadow-md' : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isSelected ? 'bg-amber-800 text-amber-200' : 'bg-white text-gray-600 border border-gray-200'
                    }`}>
                      DOSSIER CIRCUIT
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-amber-700'}`}>
                      {count} voyageur(s)
                    </span>
                  </div>
                  <h4 className="font-bold text-xs truncate">{off.title}</h4>
                  <p className={`text-[10px] font-mono ${isSelected ? 'text-amber-200' : 'text-gray-500'}`}>
                    {off.price.toLocaleString('fr-FR')} FCFA / pers.
                  </p>
                </button>
              );
            })}
          </div>

          {currentDossierOffer && (
            <div className="bg-amber-50/40 border border-amber-100 p-6 rounded-3xl space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-amber-100 shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Dossier de Circuit Actif</span>
                  <h4 className="text-xl font-bold text-gray-900">{currentDossierOffer.title}</h4>
                  <p className="text-xs text-gray-500">{currentDossierOffer.description}</p>
                </div>
                <div className="bg-amber-900 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold text-right shrink-0">
                  {currentDossierOffer.price.toLocaleString('fr-FR')} FCFA / pers.
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <Users size={16} className="text-amber-700" />
                  Liste des Voyageurs Inscrits ({dossierBookings.length})
                </h4>

                {dossierBookings.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl text-center text-xs text-gray-400 border border-gray-200">
                    Aucun voyageur inscrit sur ce dossier de circuit pour le moment.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dossierBookings.map(book => (
                      <div key={book.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 block uppercase">Nom du voyageur</span>
                            <span className="font-bold text-sm text-gray-900">{book.touristName}</span>
                            <span className="text-xs text-gray-500 block">📧 {book.touristEmail}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase ${
                            book.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            book.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {book.status === 'approved' ? '✓ Inscription Validée' : book.status === 'rejected' ? '✗ Déclinée' : '⏰ En attente'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">Date de départ</span>
                            <span className="font-mono text-gray-800">{book.checkIn}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">Places réservées</span>
                            <span className="font-bold text-gray-800">{book.guestsCount} pers.</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">Montant Total</span>
                            <span className="font-mono font-bold text-amber-800">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold">Règlement</span>
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded border border-amber-200 inline-block">
                              Paiement sur place
                            </span>
                          </div>
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

      {/* MODULE TAB 4: CALENDRIER DES DÉPARTS */}
      {myProfile && activeTab === 'calendar' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-wider inline-block mb-2">
              📅 CALENDRIER DES DÉPARTS & DISPONIBILITÉS
            </span>
            <h3 className="font-sans font-bold text-lg text-gray-900 flex items-center gap-2">
              <Calendar className="text-amber-700" size={20} />
              Planification des Dates de Départ
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="font-bold text-sm text-gray-900">Août 2026 — Planning Départs</h4>
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                  <span key={d} className="font-bold text-gray-400 text-[10px] py-1">{d}</span>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `2026-08-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                  const isSelected = selectedCalendarDate === dateStr;
                  const currentOffer = offers[0];
                  const isClosed = currentOffer?.availabilityCalendar?.some(c => c.startDate === dateStr && !c.available);

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedCalendarDate(dateStr)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected ? 'ring-2 ring-amber-700 bg-amber-900 text-white font-bold' :
                        isClosed ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold' :
                        'bg-white hover:bg-amber-50 text-gray-800 border-gray-200'
                      }`}
                    >
                      <span className="block text-xs">{dayNum}</span>
                      <span className="text-[8px] block font-mono">{isClosed ? 'ANNULÉ' : 'DÉPART'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-5 bg-amber-50/50 border border-amber-100 p-5 rounded-2xl space-y-4">
              <h4 className="font-bold text-sm text-gray-900">Départs pour le {selectedCalendarDate}</h4>
              {offers.map(off => {
                const isClosed = off.availabilityCalendar?.some(c => c.startDate === selectedCalendarDate && !c.available);
                return (
                  <div key={off.id} className="p-3 bg-white rounded-xl border border-gray-200 text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-900 block">{off.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{off.price.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <button
                      onClick={() => toggleDepartureDate(off.id, selectedCalendarDate, !isClosed)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                        isClosed ? 'bg-amber-700 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isClosed ? 'Ouvrir Départ' : 'Fermer Départ'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODULE TAB 5: INSCRIPTIONS & RÉSERVATIONS */}
      {myProfile && activeTab === 'bookings' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
              <FileText className="text-amber-700" size={18} />
              Inscriptions des Voyageurs ({bookings.length})
            </h3>
          </div>

          <div className="space-y-3">
            {bookings.map(book => (
              <div key={book.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-gray-900">{book.offerTitle}</h4>
                  <p className="text-gray-600">Voyageur : {book.touristName} ({book.touristEmail})</p>
                  <span className="text-gray-500 font-mono block">🗓️ Date départ : {book.checkIn} ({book.guestsCount} pers.)</span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200 inline-block mt-1">
                    💳 Paiement sur place au départ
                  </span>
                </div>

                <div className="text-right space-y-2">
                  <span className="font-mono font-bold text-amber-800 block text-sm">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                  {book.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBookingStatus(book.id, 'rejected')}
                        className="bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-lg border border-rose-200 text-[10px] cursor-pointer"
                      >
                        Décliner
                      </button>
                      <button
                        onClick={() => handleBookingStatus(book.id, 'approved')}
                        className="bg-amber-700 text-white font-bold px-3 py-1 rounded-lg text-[10px] cursor-pointer"
                      >
                        Valider
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE TAB 6: AVIS */}
      {myProfile && activeTab === 'reviews' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" size={18} />
              Avis Clientèle ({reviews.length})
            </h3>
            <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-full">
              Note moyenne : {myProfile?.rating?.toFixed(1) || '5.0'} / 5.0
            </span>
          </div>

          <div className="space-y-3">
            {reviews.map(rev => (
              <div key={rev.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">{rev.touristName || rev.authorName || 'Touriste'}</span>
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
      {myProfile && activeTab === 'stats' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-amber-700" size={18} />
              Statistiques de Fréquentation Agence / Guide
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Inscriptions Validées</span>
              <span className="text-3xl font-black text-amber-950">{approvedBookings.length}</span>
              <p className="text-[11px] text-amber-700">Voyageurs guidés</p>
            </div>

            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Total Volume d'Affaires</span>
              <span className="text-2xl font-black text-emerald-950 font-mono">{totalRevenue.toLocaleString('fr-FR')} FCFA</span>
              <p className="text-[11px] text-emerald-700">Paiement direct au départ</p>
            </div>

            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Note de Satisfaction</span>
              <span className="text-3xl font-black text-blue-950">{myProfile?.rating?.toFixed(1) || '5.0'} / 5.0</span>
              <p className="text-[11px] text-blue-700">Satisfaction des touristes</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
