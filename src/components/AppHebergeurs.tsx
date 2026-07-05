/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Building, Plus, Edit3, TrendingUp, Calendar, Users, CheckCircle, 
  XCircle, AlertCircle, DollarSign, Clock, Sliders, ShieldAlert, MapPin, 
  Phone, Mail, ArrowRight, Eye, RefreshCw, Star, Info
} from 'lucide-react';
import { Establishment, Offer, Booking, User as UserType, SenegalDestination } from '../types';

interface AppHebergeursProps {
  currentUser: UserType | null;
  establishments: Establishment[];
  onRefreshData: () => Promise<void>;
  onDirectLogin: (email: string, role: string) => void;
}

export default function AppHebergeurs({ 
  currentUser, 
  establishments, 
  onRefreshData,
  onDirectLogin
}: AppHebergeursProps) {
  // Local States
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
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
      // Fetch offers
      const offersRes = await fetch(`/api/establishments/${myEstablishment.id}/offers`);
      if (offersRes.ok) {
        setOffers(await offersRes.json());
      }
      // Fetch bookings
      const bookingsRes = await fetch(`/api/bookings?establishmentId=${myEstablishment.id}&role=professional`);
      if (bookingsRes.ok) {
        setBookings(await bookingsRes.json());
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
      
      // Initialize edit fields
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

  // Handle Add offer
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myEstablishment) return;
    try {
      const response = await fetch(`/api/establishments/${myEstablishment.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: offerTitle,
          description: offerDesc,
          price: Number(offerPrice),
          capacity: Number(offerCapacity),
          services: offerServices.split(',').map(s => s.trim()).filter(Boolean),
          availableQuantity: Number(offerQty)
        })
      });
      if (response.ok) {
        setOfferTitle('');
        setOfferDesc('');
        setOfferPrice('');
        setOfferCapacity('2');
        setOfferQty('2');
        setOfferServices('');
        setShowAddOffer(false);
        await fetchMyData();
        alert("Offre publiée avec succès ! Elle est en attente de validation par l'administrateur.");
      }
    } catch (err) {
      console.error('Failed to create offer:', err);
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

  // Categories of offers based on validation
  const pendingOffers = offers.filter(o => (o.status || 'approved') === 'pending');
  const approvedOffers = offers.filter(o => (o.status || 'approved') === 'approved');
  const rejectedOffers = offers.filter(o => (o.status || 'approved') === 'rejected');

  // Stats calculation
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const totalRevenue = approvedBookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalQty = approvedOffers.reduce((sum, o) => sum + o.availableQuantity, 0);
  const occupancyRate = totalQty > 0 ? Math.round((approvedBookings.length / (totalQty * 10)) * 100) : 0; // Simulated rate

  // If user is not logged in as Hébergeur
  if (!currentUser || currentUser.role !== 'professional' || (myEstablishment && !isHebergeurEst)) {
    return (
      <div id="hebergeurs-auth-gate" className="max-w-4xl mx-auto space-y-8 animate-fade-in py-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full border border-emerald-100 font-sans font-medium text-xs tracking-wider uppercase">
            🏨 Application Web Hébergeurs
          </div>
          <h2 className="font-sans font-bold text-3xl text-gray-900 tracking-tight">
            Espace Professionnel Hébergeurs
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Gérez vos chambres, suivez vos réservations en temps réel et analysez votre taux d'occupation sur notre portail pro dédié aux hôtels, campements et maisons d'hôtes.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg max-w-xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 mx-auto">
            <Building size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-lg text-gray-900">Connexion requise</h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
              Pour accéder au tableau de bord, vous devez être connecté avec un profil professionnel de type **Hébergeur**.
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
    <div id="app-hebergeurs-root" className="space-y-8 animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
              🏨 App Hébergeurs
            </span>
            {myEstablishment && (
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                myEstablishment.status === 'approved' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : myEstablishment.status === 'rejected'
                  ? 'bg-rose-50 border-rose-200 text-rose-800' 
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                {myEstablishment.status === 'approved' ? '✓ Établissement Validé' : myEstablishment.status === 'rejected' ? '✗ Établissement Refusé' : '⏰ Profil en cours de validation'}
              </span>
            )}
          </div>
          <h2 className="font-sans font-bold text-2xl text-gray-900 tracking-tight">
            {myEstablishment ? myEstablishment.name : "Mon Établissement"}
          </h2>
          {myEstablishment && (
            <p className="text-gray-500 text-xs flex items-center gap-1 font-semibold">
              <MapPin size={12} /> {myEstablishment.location} • Type : {myEstablishment.type === 'hotel' ? 'Hôtel' : myEstablishment.type === 'campement' ? 'Campement' : "Maison d'hôtes"}
            </p>
          )}
        </div>

        {myEstablishment && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowEditEst(!showEditEst)}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 size={14} />
              Modifier Infos
            </button>
            <button
              onClick={() => setShowAddOffer(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              Ajouter une Chambre / Offre
            </button>
          </div>
        )}
      </div>

      {/* If professional does not have any establishment registered yet */}
      {!myEstablishment && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto text-center space-y-6">
          <span className="text-4xl">🏨</span>
          <h3 className="font-sans font-bold text-lg text-gray-900">Créez votre fiche Hébergeur</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            Présentez votre établissement de charme, campement insolite ou maison d'hôtes accueillante pour commencer à recevoir des voyageurs de Teranga Travel.
          </p>
          {!showRegisterEst ? (
            <button
              onClick={() => setShowRegisterEst(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-3 px-6 rounded-xl text-xs cursor-pointer transition-all"
            >
              Remplir le dossier d'hébergement
            </button>
          ) : (
            <form onSubmit={handleRegisterEst} className="text-left space-y-4 border-t border-gray-100 pt-6 mt-6">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Nom de l'établissement</label>
                <input
                  type="text"
                  required
                  placeholder="Ex. Ecolodge du Sine Saloum"
                  value={newEstName}
                  onChange={(e) => setNewEstName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Cadre de l'hébergement, accueil, atouts..."
                  value={newEstDesc}
                  onChange={(e) => setNewEstDesc(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-xs text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Région</label>
                  <select
                    value={newEstLocation}
                    onChange={(e) => setNewEstLocation(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800"
                  >
                    <option value="Dakar">Dakar</option>
                    <option value="Sine Saloum">Sine Saloum</option>
                    <option value="Casamance">Casamance</option>
                    <option value="Saint-Louis">Saint-Louis</option>
                    <option value="Kédougou">Kédougou</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                  <select
                    value={newEstType}
                    onChange={(e) => setNewEstType(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800"
                  >
                    <option value="hotel">Hôtel</option>
                    <option value="campement">Campement</option>
                    <option value="maison_hotes">Maison d'hôtes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Email de contact</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@hotel.sn"
                    value={newEstEmail}
                    onChange={(e) => setNewEstEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Téléphone de contact</label>
                  <input
                    type="text"
                    required
                    placeholder="+221 77..."
                    value={newEstPhone}
                    onChange={(e) => setNewEstPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Équipements (séparés par virgules)</label>
                <input
                  type="text"
                  placeholder="Ex: Piscine, Wifi, Restaurant, Plage privée, Climatisation"
                  value={newEstAmenities}
                  onChange={(e) => setNewEstAmenities(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-3 rounded-xl text-xs cursor-pointer transition-all"
              >
                Soumettre mon dossier
              </button>
            </form>
          )}
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

      {/* Add Offer Form Panel */}
      {myEstablishment && showAddOffer && (
        <form onSubmit={handleAddOffer} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-fade-in max-w-2xl">
          <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
            Créer une nouvelle Offre / Chambre
          </h3>
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
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-gray-500 uppercase">Prix par nuit (FCFA)</label>
              <input
                type="number"
                required
                placeholder="Ex. 45000"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800 font-mono"
              />
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="space-y-1">
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

      {/* Main Stats Grid */}
      {myEstablishment && (
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
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Revenus (FCFA)</span>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-base text-gray-900">{totalRevenue.toLocaleString('fr-FR')}</span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                <DollarSign size={18} />
              </div>
            </div>
          </div>
        </div>
      )}

      {myEstablishment && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* OFFERS LIST COLUMN (Left) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Sliders className="text-emerald-700" size={16} />
                Gestion de vos Chambres / Offres ({offers.length})
              </h3>

              {loading ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="animate-spin text-emerald-700" size={20} />
                  <span className="text-xs text-gray-500">Chargement des offres...</span>
                </div>
              ) : offers.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Aucune chambre ou offre publiée pour le moment. Cliquez sur "Ajouter une chambre" pour commencer.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PENDING OFFERS SECTION */}
                  {pendingOffers.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 w-fit">
                        <Clock size={11} />
                        En Attente de Validation ({pendingOffers.length})
                      </span>
                      <div className="space-y-2 pl-2 border-l-2 border-amber-300">
                        {pendingOffers.map(offer => (
                          <div key={offer.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <h4 className="font-bold text-gray-900">{offer.title}</h4>
                              <p className="text-gray-500 text-[11px]">{offer.description}</p>
                              <span className="font-mono text-emerald-700 font-bold">{offer.price.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                            <span className="text-[9px] text-amber-800 bg-amber-50 px-2 py-1 rounded font-bold border border-amber-100">En cours d'examen</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* APPROVED OFFERS SECTION */}
                  {approvedOffers.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 w-fit">
                        <CheckCircle size={11} className="text-emerald-600" />
                        Validées & En Ligne ({approvedOffers.length})
                      </span>
                      <div className="grid grid-cols-1 gap-2 pl-2 border-l-2 border-emerald-300">
                        {approvedOffers.map(offer => (
                          <div key={offer.id} className="p-4 bg-white rounded-2xl border border-gray-100 flex justify-between items-center text-xs shadow-xs hover:border-emerald-100">
                            <div className="space-y-1">
                              <h4 className="font-bold text-gray-900">{offer.title}</h4>
                              <p className="text-gray-500 text-[11px]">{offer.description}</p>
                              <div className="flex gap-2 items-center text-[10px] pt-1">
                                <span className="font-mono text-emerald-700 font-bold">{offer.price.toLocaleString('fr-FR')} FCFA / nuit</span>
                                <span className="text-gray-400">• Capacité : {offer.capacity} pers.</span>
                                <span className="text-gray-400">• Stock : {offer.availableQuantity}</span>
                              </div>
                            </div>
                            <span className="text-[9px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded font-bold border border-emerald-100">Visible public</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REJECTED OFFERS SECTION */}
                  {rejectedOffers.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 w-fit">
                        <XCircle size={11} className="text-rose-500" />
                        Refusées par l'Admin ({rejectedOffers.length})
                      </span>
                      <div className="space-y-2 pl-2 border-l-2 border-rose-300">
                        {rejectedOffers.map(offer => (
                          <div key={offer.id} className="p-4 bg-rose-50/20 rounded-2xl border border-rose-100/50 text-xs">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="font-bold text-gray-900">{offer.title}</h4>
                                <p className="text-gray-500 text-[11px]">{offer.description}</p>
                                <span className="font-mono text-emerald-700 font-bold">{offer.price.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                              <span className="text-[9px] text-rose-800 bg-rose-50 px-2 py-1 rounded font-bold border border-rose-100">Refusée</span>
                            </div>
                            <div className="mt-2.5 p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-900 flex items-start gap-1.5 font-medium">
                              <AlertCircle size={12} className="text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">Motif du refus :</p>
                                <p className="italic mt-0.5">{offer.rejectionReason || "Qualité du contenu insuffisante."}</p>
                              </div>
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

          {/* RESERVATIONS RECEIVED COLUMN (Right) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Calendar className="text-emerald-700" size={16} />
                Calendrier & Demandes reçues ({bookings.length})
              </h3>

              {loading ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Chargement...
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  Aucune demande de réservation reçue pour le moment.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(book => (
                    <div key={book.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 space-y-3 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">{book.offerTitle}</h4>
                          <p className="text-[10px] text-gray-500 font-medium">Client : <b>{book.touristName}</b> ({book.touristEmail})</p>
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

                      <div className="border-t border-b border-gray-200/60 py-2 flex justify-between text-[10px] text-gray-500 font-semibold font-mono">
                        <span>🗓️ {book.checkIn} → {book.checkOut}</span>
                        <span>👥 {book.guestsCount} pers.</span>
                      </div>

                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-sans">Montant total</span>
                          <span className="font-mono font-bold text-gray-900">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                        </div>

                        {book.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleBookingStatus(book.id, 'rejected')}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-1.5 rounded-lg font-bold text-[10px] border border-rose-100 transition-colors cursor-pointer"
                            >
                              Décliner
                            </button>
                            <button
                              onClick={() => handleBookingStatus(book.id, 'approved')}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all cursor-pointer shadow-xs"
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
      )}
    </div>
  );
}
