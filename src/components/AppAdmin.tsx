/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Shield, Check, X, AlertCircle, TrendingUp, Users, Building, 
  MapPin, Sliders, DollarSign, Calendar, Eye, RefreshCw, Star, MessageSquare
} from 'lucide-react';
import { Establishment, Offer, Booking, User as UserType } from '../types';
import { TerangaLogo } from './TerangaLogo';

interface AppAdminProps {
  currentUser: UserType | null;
  establishments: Establishment[];
  onRefreshData: () => Promise<void>;
  onDirectLogin: (email: string, role: string) => void;
}

export default function AppAdmin({
  currentUser,
  establishments,
  onRefreshData,
  onDirectLogin
}: AppAdminProps) {
  // Local States
  const [loading, setLoading] = useState(false);
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  
  // Tab for different admin subsections
  const [adminTab, setAdminTab] = useState<'approvals' | 'offers' | 'users' | 'bookings' | 'mapping'>('approvals');
  
  // Rejection Reason dialog state
  const [rejectingOfferId, setRejectingOfferId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch all database records
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch offers
      const offersRes = await fetch('/api/offers');
      if (offersRes.ok) {
        setAllOffers(await offersRes.json());
      }
      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings?role=admin');
      if (bookingsRes.ok) {
        setAllBookings(await bookingsRes.json());
      }
      // Fetch users (or establishments owners)
      const usersRes = await fetch('/api/auth/users'); // We can fetch from an endpoint or mock list
      if (usersRes.ok) {
        setAllUsers(await usersRes.json());
      } else {
        // Fallback: simulate users list
        setAllUsers([
          { id: 'user_tourist_1', email: 'tourist@teranga.sn', name: 'Fatou Diop', role: 'tourist' },
          { id: 'user_prof_dakar', email: 'professional@teranga.sn', name: 'Cheikh Ndiaye', role: 'professional', establishmentId: 'est_1' },
          { id: 'user_prof_saloum', email: 'saloum@teranga.sn', name: 'Babacar Faye', role: 'professional', establishmentId: 'est_2' },
          { id: 'user_agency_dakar', email: 'agency_dakar@teranga.sn', name: 'Moussa Gueye', role: 'professional', establishmentId: 'est_agence_1' },
          { id: 'user_agency_saloum', email: 'agency_saloum@teranga.sn', name: 'Safiétou Diallo', role: 'professional', establishmentId: 'est_agence_2' },
          { id: 'user_guide_dakar', email: 'guide_dakar@teranga.sn', name: 'Abdoulaye Ndiaye', role: 'professional', establishmentId: 'est_guide_1' },
        ]);
      }
    } catch (e) {
      console.error('Error loading admin information:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAdminData();
    }
  }, [currentUser, establishments]);

  // Handle Establishment status approval/rejection
  const handleEstablishmentStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/establishments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        await onRefreshData();
        alert(`Le profil de l'établissement a été ${status === 'approved' ? 'VALIDÉ' : 'REFUSÉ'} avec succès.`);
      }
    } catch (err) {
      console.error('Failed to change establishment status:', err);
    }
  };

  // Handle Offer status approval/rejection
  const handleOfferStatus = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const response = await fetch(`/api/offers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason: reason })
      });
      if (response.ok) {
        await fetchAdminData();
        setRejectingOfferId(null);
        setRejectionReason('');
        alert(`L'offre a été ${status === 'approved' ? 'VALIDÉE' : 'REFUSÉE'} avec succès.`);
      }
    } catch (err) {
      console.error('Failed to update offer status:', err);
    }
  };

  // Group pending profiles
  const pendingProfiles = establishments.filter(e => e.status === 'pending');
  const activeProfiles = establishments.filter(e => e.status === 'approved');

  // Group pending offers
  const pendingOffers = allOffers.filter(o => (o.status || 'approved') === 'pending');
  const activeOffers = allOffers.filter(o => (o.status || 'approved') === 'approved');

  // Calculate high-level statistics
  const totalHostProfiles = establishments.filter(e => ['hotel', 'campement', 'maison_hotes'].includes(e.type)).length;
  const totalAgencyGuides = establishments.filter(e => ['agence', 'guide'].includes(e.type)).length;
  const totalApprovedBookings = allBookings.filter(b => b.status === 'approved');
  const globalTurnover = totalApprovedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  // Auth gate if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div id="admin-auth-gate" className="max-w-4xl mx-auto space-y-8 animate-fade-in py-12 flex flex-col items-center">
        <TerangaLogo size={88} showText={true} textPosition="bottom" className="mb-2 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm" />
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full border border-slate-800 font-sans font-medium text-xs tracking-wider uppercase">
            🛡️ Application Web Administration
          </div>
          <h2 className="font-sans font-bold text-3xl text-gray-900 tracking-tight">
            Console d'Administration Globale
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Espace sécurisé de validation, de modération et d'analyse statistique de la plateforme Teranga Travel. Réservé aux gestionnaires agréés.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg max-w-xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-700 mx-auto">
            <Shield size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-lg text-gray-900">Accès Administrateur Restreint</h3>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm mx-auto">
              Veuillez vous connecter avec vos identifiants d'administration pour valider les publications et surveiller les réservations.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Identifiant d'accès rapide :</p>
            <button
              onClick={() => onDirectLogin('admin@teranga.sn', 'admin')}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-sans font-bold py-3 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>🔑 Se connecter en tant que Modou Sow (Admin)</span>
              <Check size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="app-admin-root" className="space-y-8 animate-fade-in">
      
      {/* Top Banner stats */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <TerangaLogo size={52} showText={false} className="bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shrink-0" />
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
              🛡️ App Administrateur
            </span>
            <h2 className="font-sans font-bold text-2xl tracking-tight">Supervision Générale</h2>
            <p className="text-slate-400 text-xs">Administrateur connecté : <b>Modou Sow</b> • Contrôle total de la plateforme</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={14} />
          Actualiser les données
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Chiffre d'Affaires Global</span>
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-base text-gray-900">{globalTurnover.toLocaleString('fr-FR')} FCFA</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <DollarSign size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Hébergements Enregistrés</span>
          <div className="flex items-center justify-between">
            <span className="font-sans font-bold text-xl text-gray-900">{totalHostProfiles}</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <Building size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Agences & Guides</span>
          <div className="flex items-center justify-between">
            <span className="font-sans font-bold text-xl text-gray-900">{totalAgencyGuides}</span>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
              <Sliders size={18} />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Demandes en attente</span>
          <div className="flex items-center justify-between">
            <span className="font-sans font-bold text-xl text-amber-700">{pendingProfiles.length + pendingOffers.length}</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
              <AlertCircle size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Admin Navigation */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          onClick={() => setAdminTab('approvals')}
          className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
            adminTab === 'approvals' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Validation Fiches Profils ({pendingProfiles.length})
          {adminTab === 'approvals' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
        </button>

        <button
          onClick={() => setAdminTab('offers')}
          className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
            adminTab === 'offers' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Validation Offres & Circuits ({pendingOffers.length})
          {adminTab === 'offers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
            adminTab === 'users' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Membres Écosystème ({allUsers.length})
          {adminTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
        </button>

        <button
          onClick={() => setAdminTab('bookings')}
          className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
            adminTab === 'bookings' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Suivi des Réservations ({allBookings.length})
          {adminTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
        </button>

        <button
          onClick={() => setAdminTab('mapping')}
          className={`pb-3.5 text-xs font-bold transition-all relative cursor-pointer ${
            adminTab === 'mapping' ? 'text-slate-900' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          🗂️ Fiche de Mapping (Données)
          {adminTab === 'mapping' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full" />}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6">
        
        {/* TAB 1: VALIDATION DE PROFILS/ÉTABLISSEMENTS */}
        {adminTab === 'approvals' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-900">Demandes d'enregistrement d'Établissements / Prestataires</h3>
              <p className="text-gray-500 text-xs">Vérifiez la légitimité des prestataires (Hôtels, Campements, Guides ou Agences) avant de leur donner accès à la publication.</p>
            </div>

            {pendingProfiles.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Aucune fiche établissement en attente de validation.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingProfiles.map(est => (
                  <div key={est.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-bold uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          {est.type.toUpperCase()}
                        </span>
                        <span className="text-gray-400 text-[10px] font-semibold flex items-center gap-0.5">
                          <MapPin size={10} /> {est.location}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{est.name}</h4>
                      <p className="text-gray-500 text-[11px] leading-relaxed">{est.description}</p>
                      
                      <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1 text-[10px] font-mono text-gray-600">
                        <p><b>📧 Contact :</b> {est.contactEmail || 'Non spécifié'}</p>
                        <p><b>📞 Téléphone :</b> {est.contactPhone || 'Non spécifié'}</p>
                        <p><b>✨ Services :</b> {est.amenities.join(', ')}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-gray-250/50 pt-3">
                      <button
                        onClick={() => handleEstablishmentStatus(est.id, 'rejected')}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X size={12} /> Refuser l'adhésion
                      </button>
                      <button
                        onClick={() => handleEstablishmentStatus(est.id, 'approved')}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check size={12} /> Approuver & Publier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approved Establishments */}
            {activeProfiles.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-sans font-bold text-xs text-gray-800 mb-3">Établissements Partenaires Actifs ({activeProfiles.length})</h4>
                <div className="max-h-72 overflow-y-auto space-y-2 pr-2">
                  {activeProfiles.map(est => (
                    <div key={est.id} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold uppercase text-slate-500">{est.type}</span>
                          <span className="text-gray-300">•</span>
                          <h5 className="font-bold text-gray-900">{est.name}</h5>
                        </div>
                        <p className="text-[10px] text-gray-400">{est.location} • {est.contactEmail}</p>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">✔ Partenaire actif</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VALIDATION DES OFFRES & CIRCUITS */}
        {adminTab === 'offers' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6 animate-fade-in">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-900">Modération des Offres Publiées</h3>
              <p className="text-gray-500 text-xs">Validez les chambres d'hôtels, circuits d'agences et forfaits de guidage avant leur mise en ligne officielle auprès des touristes.</p>
            </div>

            {pendingOffers.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs animate-fade-in">
                Aucune offre ou circuit en attente de modération.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOffers.map(offer => {
                  const est = establishments.find(e => e.id === offer.establishmentId);
                  return (
                    <div key={offer.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col justify-between gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">
                            Fourni par : <b>{est ? est.name : 'Prestataire'}</b>
                          </span>
                          <div className="text-right">
                            {offer.promoPrice ? (
                              <div className="space-y-0.5">
                                <span className="font-mono text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px] block">
                                  Promo: {offer.promoPrice.toLocaleString('fr-FR')} {offer.currency || 'FCFA'}
                                </span>
                                <span className="font-mono text-gray-400 line-through text-[9px] block">
                                  {offer.price.toLocaleString('fr-FR')} {offer.currency || 'FCFA'}
                                </span>
                              </div>
                            ) : (
                              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                {offer.price.toLocaleString('fr-FR')} {offer.currency || 'FCFA'}
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-900 text-sm">{offer.title}</h4>
                        <p className="text-gray-500 text-[11px] leading-relaxed">{offer.description}</p>
                        
                        <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1 text-[10px] text-gray-600">
                          <p><b>👥 Capacité/Durée :</b> {offer.capacity} {est?.type === 'agence' ? 'jours (Circuit)' : 'personnes'}</p>
                          <p><b>✨ Services & Détails :</b> {offer.services.join(', ')}</p>
                          {offer.coordinates && (
                            <p><b>📍 Coordonnées GPS :</b> Lat {offer.coordinates.lat}, Lng {offer.coordinates.lng}</p>
                          )}
                          {offer.availabilityCalendar && offer.availabilityCalendar.length > 0 && (
                            <p><b>📅 Dates de validité :</b> Du {offer.availabilityCalendar[0].startDate} au {offer.availabilityCalendar[0].endDate}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-gray-250/50 pt-3">
                        <button
                          onClick={() => setRejectingOfferId(offer.id)}
                          className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-700 py-2 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X size={12} /> Refuser l'offre
                        </button>
                        <button
                          onClick={() => handleOfferStatus(offer.id, 'approved')}
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-2 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check size={12} /> Valider l'offre
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custom Rejection Dialog */}
            {rejectingOfferId && (
              <div className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-4 animate-fade-in max-w-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-amber-700 shrink-0 mt-0.5" size={16} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Indiquez la raison du rejet de l'offre</h4>
                    <p className="text-gray-500 text-[10px] mt-0.5">Le prestataire recevra cette explication dans son tableau de bord et pourra modifier puis republier son offre.</p>
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Ex. Description insuffisante. Veuillez détailler le programme étape par étape pour le Jour 2 et le Jour 3."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-white border border-amber-200 p-2.5 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                <div className="flex gap-2 text-[10px] font-bold text-gray-500">
                  <button 
                    type="button" 
                    onClick={() => setRejectionReason("Le tarif proposé ne correspond pas à la moyenne locale. Veuillez ajuster vos prix.")}
                    className="bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                  >
                    Tarif incorrect
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRejectionReason("Informations de programme incomplètes. Veuillez détailler les étapes quotidiennes.")}
                    className="bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                  >
                    Programme incomplet
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRejectionReason("Photos floues ou non représentatives. Veuillez importer des visuels plus qualitatifs.")}
                    className="bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                  >
                    Photos insuffisantes
                  </button>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setRejectingOfferId(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3.5 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleOfferStatus(rejectingOfferId, 'rejected', rejectionReason)}
                    className="bg-rose-700 hover:bg-rose-800 text-white px-4 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer"
                  >
                    Confirmer le Rejet
                  </button>
                </div>
              </div>
            )}

            {/* Approved Offers List */}
            {activeOffers.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-sans font-bold text-xs text-gray-800 mb-3">Catalogue Offres & Chambres Actives ({activeOffers.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeOffers.map(offer => {
                    const est = establishments.find(e => e.id === offer.establishmentId);
                    return (
                      <div key={offer.id} className="p-3 bg-white border border-gray-100 rounded-xl flex flex-col justify-between text-xs space-y-2">
                        <div>
                          <div className="flex justify-between items-start text-[10px]">
                            <span className="text-gray-400 font-bold">{est ? est.name : 'Prestataire'}</span>
                            <span className="font-mono text-emerald-700 font-bold">{offer.price.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                          <h5 className="font-bold text-gray-900 mt-1">{offer.title}</h5>
                        </div>
                        <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 w-fit">En Ligne</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MEMBRES ECOSYSTEME */}
        {adminTab === 'users' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4 animate-fade-in">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-900">Utilisateurs de l'écosystème</h3>
              <p className="text-gray-500 text-xs">Liste complète des touristes, hôteliers, guides et agences enregistrés.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold text-[10px] uppercase tracking-wider bg-gray-50/50">
                    <th className="py-3 px-4">Nom Complet</th>
                    <th className="py-3 px-4">Adresse E-mail</th>
                    <th className="py-3 px-4">Rôle Écosystème</th>
                    <th className="py-3 px-4">ID Établissement lié</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allUsers.map(usr => (
                    <tr key={usr.id} className="hover:bg-gray-50/35">
                      <td className="py-3 px-4 font-bold text-gray-900">{usr.name}</td>
                      <td className="py-3 px-4 text-gray-600 font-mono">{usr.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          usr.role === 'admin' 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : usr.role === 'professional'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}>
                          {usr.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">{usr.establishmentId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: RESERVATIONS PLATFORME */}
        {adminTab === 'bookings' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4 animate-fade-in">
            <div>
              <h3 className="font-sans font-bold text-sm text-gray-900">Registre Global des Réservations</h3>
              <p className="text-gray-500 text-xs">Suivez l'ensemble des transactions de l'écosystème entre voyageurs et prestataires.</p>
            </div>

            {allBookings.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Aucune réservation enregistrée sur la plateforme.
              </div>
            ) : (
              <div className="space-y-3">
                {allBookings.map(book => (
                  <div key={book.id} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-gray-900">{book.offerTitle}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 font-semibold">{book.establishmentName}</span>
                      </div>
                      <p className="text-gray-500 text-[10px]">
                        Commandé par : <b>{book.touristName}</b> ({book.touristEmail}) • 🗓️ Du {book.checkIn} au {book.checkOut}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-semibold text-[11px]">
                      <div>
                        <span className="text-gray-400 text-[10px] font-normal block text-right">Montant</span>
                        <span className="font-mono text-gray-900">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        book.status === 'approved' 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                          : book.status === 'rejected'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        {book.status === 'approved' ? 'Validée' : book.status === 'rejected' ? 'Déclinée' : 'En examen'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FICHE DE MAPPING (GUIDE DE CONCEPTION) */}
        {adminTab === 'mapping' && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2">
                  <span>🗂️</span> Fiche de Mapping des Données Unique
                </h3>
                <p className="text-gray-500 text-xs">
                  "Une donnée est créée une seule fois, puis utilisée par toutes les applications." Métadonnées obligatoires de conformité.
                </p>
              </div>
              <div className="bg-emerald-50 text-emerald-800 text-[11px] font-sans font-bold px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Registre Actif du Modèle Unique
              </div>
            </div>

            {/* Explanatory cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <span>🔄</span> Cycle de Vie Standardisé
                </span>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Toutes les fiches (Hébergements, Offres, Circuits) partagent le cycle d'états : <b className="text-gray-700">Draft</b> (Brouillon) → <b className="text-gray-700">Pending</b> (En attente) → <b className="text-gray-700">Approved</b> (Validé) → <b className="text-gray-700">Rejected</b> (Refusé) → <b className="text-gray-700">Archived</b> (Archivé).
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <span>📍</span> Géographie et GPS
                </span>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  L'association avec une <b className="text-gray-700">Région sénégalaise</b> agréée est obligatoire. Les coordonnées GPS (Latitude / Longitude) sont implémentées pour garantir la cartographie interactive.
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5">
                <span className="font-bold text-gray-800 flex items-center gap-1">
                  <span>📅</span> Disponibilités & Catalogues
                </span>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  La gestion intègre un calendrier d'intervalles de dates au lieu d'une simple quantité brute. Les équipements sont sélectionnés à partir d'un catalogue normé de services.
                </p>
              </div>
            </div>

            {/* Mapping Interactive Table */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Dictionnaire d'Attributs Métier</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-3.5 px-4 font-sans">Nom du Champ</th>
                      <th className="py-3.5 px-4 font-mono text-slate-300">Nom Technique</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4 text-center">Obligatoire</th>
                      <th className="py-3.5 px-4">Créateur / Éditeur</th>
                      <th className="py-3.5 px-4">Validateur</th>
                      <th className="py-3.5 px-4">Visibilité</th>
                      <th className="py-3.5 px-4">Affichage & Rôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    
                    {/* Category: ESTABLISHMENT */}
                    <tr className="bg-emerald-50/40 text-emerald-900 font-bold text-[11px]">
                      <td colSpan={8} className="py-2.5 px-4 uppercase tracking-wider border-y border-emerald-100">
                        🏢 Objet Métier : Établissement (Hébergement, Agence ou Guide)
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Identifiant Unique</td>
                      <td className="py-3 px-4 font-mono text-amber-700">id</td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Système</td>
                      <td className="py-3 px-4 text-gray-500">Aucun</td>
                      <td className="py-3 px-4 text-gray-500">Technique</td>
                      <td className="py-3 px-4 font-medium">Clé primaire de relation avec l'offre et les réservations.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Nom de l'établissement</td>
                      <td className="py-3 px-4 font-mono text-amber-700">name</td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Affiché en en-tête de fiche et dans les cartes de recherche.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Description Immersive</td>
                      <td className="py-3 px-4 font-mono text-amber-700">description</td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Texte descriptif présentant les atouts de l'hébergeur ou guide.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Région Administrative</td>
                      <td className="py-3 px-4 font-mono text-amber-700">location</td>
                      <td className="py-3 px-4">SenegalDestination</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Dakar, Sine Saloum, Casamance, Saint-Louis, Kédougou. Clé de filtre géographique.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Coordonnées GPS</td>
                      <td className="py-3 px-4 font-mono text-amber-700">coordinates</td>
                      <td className="py-3 px-4">{"{ lat, lng }"}</td>
                      <td className="py-3 px-4 text-center text-gray-400">Non</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Position exacte sur la carte interactive Google Maps / Leaflet.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Statut du Cycle de vie</td>
                      <td className="py-3 px-4 font-mono text-amber-700">status</td>
                      <td className="py-3 px-4">EstablishmentStatus</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire / Admin</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Privé/Public</td>
                      <td className="py-3 px-4 font-medium">Draft (brouillon) → Pending (validation) → Approved (ligne) → Rejected (rejeté) → Archived.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Créateur de la donnée</td>
                      <td className="py-3 px-4 font-mono text-amber-700">creatorId</td>
                      <td className="py-3 px-4">string (user_id)</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Système / Owner</td>
                      <td className="py-3 px-4 text-gray-500">Aucun</td>
                      <td className="py-3 px-4 text-gray-500">Interne</td>
                      <td className="py-3 px-4 font-medium">Sert à l'audit pour savoir quel compte utilisateur a créé la fiche.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Équipements & Services</td>
                      <td className="py-3 px-4 font-mono text-amber-700">amenities</td>
                      <td className="py-3 px-4">string[] (catalog)</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Sélectionnés depuis un catalogue strict (Wi-Fi, Climatisation, Piscine, etc.).</td>
                    </tr>

                    {/* Category: OFFER */}
                    <tr className="bg-amber-50/40 text-amber-900 font-bold text-[11px]">
                      <td colSpan={8} className="py-2.5 px-4 uppercase tracking-wider border-y border-amber-100">
                        🎁 Objet Métier : Offre (Chambre, Bungalow ou Circuit)
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Titre de l'offre</td>
                      <td className="py-3 px-4 font-mono text-amber-700">title</td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Titre attractif affiché sur la fiche descriptive de l'offre (ex. Suite Junior).</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Tarif Normal</td>
                      <td className="py-3 px-4 font-mono text-amber-700">price</td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Prix brut de base servant pour le calcul de la réservation.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Tarif Promotionnel</td>
                      <td className="py-3 px-4 font-mono text-amber-700">promoPrice</td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4 text-center text-gray-400">Non</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Prix réduit d'appel pour déclencher plus de réservations (barré à l'écran).</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Devise Monétaire</td>
                      <td className="py-3 px-4 font-mono text-amber-700">currency</td>
                      <td className="py-3 px-4">string</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Valeur standard de devise, par défaut "FCFA" ou "XOF".</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Images Structurées</td>
                      <td className="py-3 px-4 font-mono text-amber-700">structuredImages</td>
                      <td className="py-3 px-4">OfferImage[]</td>
                      <td className="py-3 px-4 text-center text-gray-400">Non</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Tableau de photos avec légende textuelle, niveau de couverture et ordre d'affichage.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Calendrier Dispos</td>
                      <td className="py-3 px-4 font-mono text-amber-700">availabilityCalendar</td>
                      <td className="py-3 px-4">AvailabilityPeriod[]</td>
                      <td className="py-3 px-4 text-center text-gray-400">Non</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire</td>
                      <td className="py-3 px-4 text-gray-500">Administrateur</td>
                      <td className="py-3 px-4 text-gray-500">Public</td>
                      <td className="py-3 px-4 font-medium">Intervalles de dates spécifiant si l'offre est réservable et si le prix varie.</td>
                    </tr>

                    {/* Category: BOOKING */}
                    <tr className="bg-blue-50/40 text-blue-900 font-bold text-[11px]">
                      <td colSpan={8} className="py-2.5 px-4 uppercase tracking-wider border-y border-blue-100">
                        🗓️ Objet Métier : Réservation (Booking)
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Dates de séjour</td>
                      <td className="py-3 px-4 font-mono text-amber-700">checkIn, checkOut</td>
                      <td className="py-3 px-4">string (date YYYY-MM-DD)</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Voyageur</td>
                      <td className="py-3 px-4 text-gray-500">Aucun</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire / Voyageur</td>
                      <td className="py-3 px-4 font-medium">Détermine la période et le nombre de nuitées pour le calcul financier.</td>
                    </tr>
                    <tr className="hover:bg-gray-50/40 text-[11px]">
                      <td className="py-3 px-4 font-bold text-gray-900">Montant Facturé</td>
                      <td className="py-3 px-4 font-mono text-amber-700">totalPrice</td>
                      <td className="py-3 px-4">number</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">Oui</td>
                      <td className="py-3 px-4 text-gray-500">Système (Calculé)</td>
                      <td className="py-3 px-4 text-gray-500">Aucun</td>
                      <td className="py-3 px-4 text-gray-500">Prestataire / Voyageur</td>
                      <td className="py-3 px-4 font-medium">Calculé automatiquement par multiplication du nombre de nuitées par le prix de l'offre.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
