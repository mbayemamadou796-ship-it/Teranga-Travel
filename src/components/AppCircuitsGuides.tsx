/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Compass, Map, Sparkles, CheckCircle, XCircle, AlertCircle, Calendar, 
  Users, DollarSign, Sliders, Info, MapPin, Plus, Edit3, ArrowRight,
  User, Star, BookOpen, Clock, RefreshCw, Layers
} from 'lucide-react';
import { Establishment, Offer, Booking, User as UserType, SenegalDestination } from '../types';

interface AppCircuitsGuidesProps {
  currentUser: UserType | null;
  establishments: Establishment[];
  onRefreshData: () => Promise<void>;
  onDirectLogin: (email: string, role: string) => void;
}

export default function AppCircuitsGuides({
  currentUser,
  establishments,
  onRefreshData,
  onDirectLogin
}: AppCircuitsGuidesProps) {
  // Local States
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Form States for modifying profile
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileSpecialties, setProfileSpecialties] = useState(''); // languages or logistics

  // Form States for creating a circuit (agencies) or daily rate (guides)
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDesc, setOfferDesc] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerDuration, setOfferDuration] = useState('1'); // for tours
  const [offerServices, setOfferServices] = useState(''); // specialties/highlights
  const [offerProgram, setOfferProgram] = useState(''); // Detailed itinerary program

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
      // Fetch offers/circuits
      const offersRes = await fetch(`/api/establishments/${myProfile.id}/offers`);
      if (offersRes.ok) {
        setOffers(await offersRes.json());
      }
      // Fetch bookings
      const bookingsRes = await fetch(`/api/bookings?establishmentId=${myProfile.id}&role=professional`);
      if (bookingsRes.ok) {
        setBookings(await bookingsRes.json());
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
      
      // Initialize edit fields
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

  // Handle publishing circuit or service rate
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfile) return;
    
    // For agencies, services might be Highlights, plus itinerary program
    // For guides, services are guiding packages/highlights
    const servicesList = offerServices.split(',').map(s => s.trim()).filter(Boolean);
    if (offerProgram && offerProgram.trim().length > 0) {
      servicesList.push(`Programme : ${offerProgram.trim()}`);
    }

    try {
      const response = await fetch(`/api/establishments/${myProfile.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: offerTitle,
          description: offerDesc,
          price: Number(offerPrice),
          capacity: Number(offerDuration), // abuse capacity as durationDays for circuits in frontend view
          services: servicesList,
          availableQuantity: 5 // Default available sessions
        })
      });
      if (response.ok) {
        setOfferTitle('');
        setOfferDesc('');
        setOfferPrice('');
        setOfferDuration('1');
        setOfferServices('');
        setOfferProgram('');
        setShowAddOffer(false);
        await fetchMyData();
        alert("Circuit/Offre envoyé pour validation ! Un administrateur l'examinera sous peu.");
      }
    } catch (err) {
      console.error('Failed to create circuit offer:', err);
    }
  };

  // Accept/Decline bookings
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
      console.error('Failed to update booking status:', err);
    }
  };

  const pendingOffers = offers.filter(o => (o.status || 'approved') === 'pending');
  const approvedOffers = offers.filter(o => (o.status || 'approved') === 'approved');
  const rejectedOffers = offers.filter(o => (o.status || 'approved') === 'rejected');

  const totalRevenue = bookings.filter(b => b.status === 'approved').reduce((sum, b) => sum + b.totalPrice, 0);

  // If user is not logged in as Agency/Guide
  if (!currentUser || currentUser.role !== 'professional' || (myProfile && !isCircuitsGuidesEst)) {
    return (
      <div id="circuits-auth-gate" className="max-w-4xl mx-auto space-y-8 animate-fade-in py-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-800 px-4 py-1.5 rounded-full border border-amber-100 font-sans font-medium text-xs tracking-wider uppercase">
            🥾 Application Web Circuits & Guides
          </div>
          <h2 className="font-sans font-bold text-3xl text-gray-900 tracking-tight">
            Portail Professionnel Circuits & Guides
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Élargissez votre clientèle touristique. Publiez vos itinéraires guidés, définissez vos forfaits journaliers ou hebdomadaires, gérez vos plannings de guidage et validez vos réservations.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg max-w-xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 mx-auto">
            <Compass size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-lg text-gray-900">Accès restreint</h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
              Veuillez vous connecter avec un compte professionnel de type **Agence** ou **Guide** pour accéder à votre tableau de bord.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Comptes d'évaluation rapide :</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onDirectLogin('agency_dakar@teranga.sn', 'agency')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🔑 Agence Moussa Gueye</span>
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => onDirectLogin('guide_dakar@teranga.sn', 'guide')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🔑 Guide Abdoulaye Ndiaye</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isGuide = myProfile.type === 'guide';

  return (
    <div id="app-circuits-root" className="space-y-8 animate-fade-in">
      
      {/* Header Profile Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
              {isGuide ? '🥾 Guide Touristique' : '🗺️ Agence de Voyage'}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
              myProfile.status === 'approved' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : myProfile.status === 'rejected'
                ? 'bg-rose-50 border-rose-200 text-rose-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              {myProfile.status === 'approved' ? '✓ Profil Validé' : myProfile.status === 'rejected' ? '✗ Profil Refusé' : '⏰ Profil en cours d\'examen'}
            </span>
          </div>
          <h2 className="font-sans font-bold text-2xl text-gray-900 tracking-tight">
            {myProfile.name}
          </h2>
          <p className="text-gray-500 text-xs flex items-center gap-1 font-semibold">
            <MapPin size={12} /> {myProfile.location} • {isGuide ? 'Langues & Spécialités' : 'Logistique'} : {myProfile.amenities.join(', ')}
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowEditProfile(!showEditProfile)}
            className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 size={14} />
            Modifier Profil
          </button>
          <button
            onClick={() => setShowAddOffer(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            {isGuide ? 'Définir Tarif / Disponibilité' : 'Publier un Circuit'}
          </button>
        </div>
      </div>

      {/* Profile register flow if not created - handled at App.tsx level but integrated here for fallback */}
      
      {/* Edit Profile details form */}
      {showEditProfile && (
        <form onSubmit={handleEditProfile} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-fade-in max-w-2xl">
          <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
            Modifier vos informations de profil professionnel
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Nom commercial / de Guide</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">
                {isGuide ? 'Langues parlées' : 'Services & Logistique'}
              </label>
              <input
                type="text"
                value={profileSpecialties}
                onChange={(e) => setProfileSpecialties(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                placeholder={isGuide ? "Français, Wolof, Anglais..." : "Transport 4x4, pirogues, guides locaux..."}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Présentation / Biographie</label>
            <textarea
              required
              rows={3}
              value={profileDesc}
              onChange={(e) => setProfileDesc(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-800"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Email de contact</label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Téléphone</label>
              <input
                type="text"
                required
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Sauvegarder les modifications
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

      {/* Add Circuit or Guide Rate form */}
      {showAddOffer && (
        <form onSubmit={handleAddOffer} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-fade-in max-w-2xl">
          <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
            {isGuide ? 'Créer une offre de guidage journalière' : 'Créer un nouveau Circuit Touristique'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">
                {isGuide ? "Intitulé du forfait" : "Nom du circuit"}
              </label>
              <input
                type="text"
                required
                placeholder={isGuide ? "Ex. Guidage historique Dakar et Gorée" : "Ex. Immersion Casamance & Île de Karabane"}
                value={offerTitle}
                onChange={(e) => setOfferTitle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">
                Tarif (FCFA) {isGuide && '/ jour'}
              </label>
              <input
                type="number"
                required
                placeholder="Ex. 30000"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800 font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-gray-500 uppercase">Description narrative</label>
            <textarea
              required
              rows={3}
              placeholder={isGuide ? "Détails de l'accompagnement, thèmes abordés, logistique..." : "Aperçu de l'aventure, des rencontres locales et du voyage..."}
              value={offerDesc}
              onChange={(e) => setOfferDesc(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">
                {isGuide ? "Disponibilités (nb de personnes max)" : "Durée en jours"}
              </label>
              <input
                type="number"
                required
                value={offerDuration}
                onChange={(e) => setOfferDuration(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Prestations incluses / Points clés (séparés par virgules)</label>
              <input
                type="text"
                placeholder="Ex: Pirogue, Déjeuner local, Ticket de musée, Eau minérale"
                value={offerServices}
                onChange={(e) => setOfferServices(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
              />
            </div>
          </div>

          {!isGuide && (
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Programme détaillé (Étape par étape)</label>
              <textarea
                rows={3}
                placeholder="Ex. Jour 1: Visite des cases traditionnelles. Jour 2: Navigation en pirogue dans la mangrove..."
                value={offerProgram}
                onChange={(e) => setOfferProgram(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-xs text-gray-800"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Envoyer pour validation
            </button>
            <button
              type="button"
              onClick={() => setShowAddOffer(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Réservations reçues</span>
          <div className="flex items-center justify-between">
            <span className="font-sans font-bold text-xl text-gray-900">{bookings.length}</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Calendar size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Circuits / Prestations</span>
          <div className="flex items-center justify-between">
            <span className="font-sans font-bold text-xl text-gray-900">{offers.length}</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Map size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Offres Actives</span>
          <div className="flex items-center justify-between">
            <span className="font-sans font-bold text-xl text-gray-900">{approvedOffers.length}</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <CheckCircle size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Chiffre d'Affaires</span>
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-sm text-gray-900">{totalRevenue.toLocaleString('fr-FR')} FCFA</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <DollarSign size={18} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: List of circuits / guiding offers */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Layers className="text-amber-700" size={16} />
              Catalogue de vos prestations ({offers.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <RefreshCw className="animate-spin text-amber-600" size={18} />
                <span className="text-xs text-gray-400">Mise à jour...</span>
              </div>
            ) : offers.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Aucune prestation ou circuit enregistré. Créez-en un à l'aide du bouton ci-dessus !
              </div>
            ) : (
              <div className="space-y-4">
                {/* PENDING */}
                {pendingOffers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 w-fit">
                      <Clock size={11} /> En cours de validation par Teranga ({pendingOffers.length})
                    </span>
                    <div className="space-y-2 pl-2 border-l-2 border-amber-400">
                      {pendingOffers.map(offer => (
                        <div key={offer.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1">
                          <h4 className="font-bold text-gray-900">{offer.title}</h4>
                          <p className="text-gray-500 text-[11px] leading-relaxed">{offer.description}</p>
                          <span className="font-mono text-amber-800 font-bold font-semibold block">{offer.price.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* APPROVED */}
                {approvedOffers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 w-fit">
                      <CheckCircle size={11} className="text-emerald-600" /> Publiés & Réservables ({approvedOffers.length})
                    </span>
                    <div className="grid grid-cols-1 gap-2 pl-2 border-l-2 border-emerald-400">
                      {approvedOffers.map(offer => (
                        <div key={offer.id} className="p-4 bg-white rounded-2xl border border-gray-100 text-xs space-y-2 shadow-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-gray-900">{offer.title}</h4>
                              <p className="text-gray-500 text-[11px] leading-relaxed">{offer.description}</p>
                            </div>
                            <span className="font-mono text-emerald-700 font-bold block">{offer.price.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                          
                          {/* Services tags */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {offer.services.map((srv, idx) => (
                              <span key={idx} className="bg-gray-50 border border-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[9px] font-semibold">
                                {srv}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* REJECTED */}
                {rejectedOffers.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 w-fit">
                      <XCircle size={11} className="text-rose-500" /> Refusés avec modifications requises ({rejectedOffers.length})
                    </span>
                    <div className="space-y-3 pl-2 border-l-2 border-rose-400">
                      {rejectedOffers.map(offer => (
                        <div key={offer.id} className="p-4 bg-rose-50/20 rounded-2xl border border-rose-100/50 text-xs space-y-2">
                          <div>
                            <h4 className="font-bold text-gray-900">{offer.title}</h4>
                            <p className="text-gray-500 text-[11px] leading-relaxed">{offer.description}</p>
                            <span className="font-mono text-rose-800 font-bold block mt-1">{offer.price.toLocaleString('fr-FR')} FCFA</span>
                          </div>

                          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-900 space-y-1">
                            <p className="font-bold flex items-center gap-1"><AlertCircle size={12} className="text-rose-600" /> Raison du rejet :</p>
                            <p className="italic">{offer.rejectionReason || "Informations incomplètes ou programme trop vague."}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bookings received */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Calendar className="text-amber-700" size={16} />
              Demandes de réservations ({bookings.length})
            </h3>

            {loading ? (
              <div className="py-8 text-center text-gray-400 text-xs">Chargement...</div>
            ) : bookings.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Aucune réservation de circuit reçue pour le moment.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(book => (
                  <div key={book.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 text-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{book.offerTitle}</h4>
                        <p className="text-[10px] text-gray-500">Voyageur : <b>{book.touristName}</b></p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        book.status === 'approved' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : book.status === 'rejected'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        {book.status === 'approved' ? 'Acceptée' : book.status === 'rejected' ? 'Refusée' : 'En attente'}
                      </span>
                    </div>

                    <div className="border-t border-b border-gray-200/50 py-1.5 flex justify-between text-[10px] text-gray-500 font-semibold font-mono">
                      <span>🗓️ Date : {book.checkIn}</span>
                      <span>👥 {book.guestsCount} voyageurs</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-sans">Montant</span>
                        <span className="font-mono font-bold text-gray-900">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                      </div>

                      {book.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleBookingStatus(book.id, 'rejected')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer"
                          >
                            Refuser
                          </button>
                          <button
                            onClick={() => handleBookingStatus(book.id, 'approved')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] cursor-pointer"
                          >
                            Accepter
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

      </div>

    </div>
  );
}
