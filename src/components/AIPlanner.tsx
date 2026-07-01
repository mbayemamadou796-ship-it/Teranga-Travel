/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Calendar, Compass, DollarSign, Users, Check, MapPin, Search, Phone, Mail, 
  Star, Clock, ShieldCheck, Heart, ArrowRight, RefreshCw, ClipboardList, Eye
} from 'lucide-react';
import { SenegalDestination, Establishment, Offer } from '../types';

interface AIPlannerProps {
  onSearchEstablishment: (location: SenegalDestination) => void;
  establishments: Establishment[];
  onBookOffer?: (offer: Offer) => void;
  currentUser?: any;
  onSwitchToDashboard?: () => void;
}

export default function AIPlanner({ 
  onSearchEstablishment, 
  establishments,
  onBookOffer,
  currentUser,
  onSwitchToDashboard
}: AIPlannerProps) {
  // Filter States
  const [selectedRegion, setSelectedRegion] = useState<SenegalDestination | 'all'>('all');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  
  // Data States
  const [allOffers, setAllOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedCircuits, setSavedCircuits] = useState<string[]>([]);

  // Fetch all offers on mount
  useEffect(() => {
    const fetchAllOffers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/offers');
        if (response.ok) {
          const data = await response.json();
          setAllOffers(data);
        }
      } catch (err) {
        console.error('Error fetching offers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllOffers();
  }, []);

  // Filter establishments to get agencies
  const partnerAgencies = establishments.filter(e => e.type === 'agence' && e.status === 'approved');

  // Filter offers that belong to partner agencies
  const agencyOffers = allOffers.filter(offer => {
    const agency = partnerAgencies.find(a => a.id === offer.establishmentId);
    if (!agency) return false;

    // Region filter
    const matchesRegion = selectedRegion === 'all' || agency.location === selectedRegion;

    // Theme/Search filters
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          agency.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Price filter
    const matchesPrice = offer.price <= maxPrice;

    // Theme filter mapping based on titles/descriptions
    let matchesTheme = true;
    if (selectedTheme !== 'all') {
      const text = (offer.title + ' ' + offer.description).toLowerCase();
      if (selectedTheme === 'culture') {
        matchesTheme = text.includes('goree') || text.includes('culture') || text.includes('historien') || text.includes('histoire') || text.includes('tradition');
      } else if (selectedTheme === 'nature') {
        matchesTheme = text.includes('oiseaux') || text.includes('djoudj') || text.includes('eco') || text.includes('bolongs') || text.includes('nature') || text.includes('cascade');
      } else if (selectedTheme === 'aventure') {
        matchesTheme = text.includes('trek') || text.includes('vtt') || text.includes('aventure') || text.includes('randonnee');
      } else if (selectedTheme === 'surf') {
        matchesTheme = text.includes('surf') || text.includes('glisse') || text.includes('ocean');
      }
    }

    return matchesRegion && matchesSearch && matchesPrice && matchesTheme;
  });

  const toggleFavorite = (id: string) => {
    setSavedCircuits(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getThemeLabel = (themeId: string) => {
    switch (themeId) {
      case 'culture': return 'Culture & Histoire';
      case 'nature': return 'Nature & Écotourisme';
      case 'aventure': return 'Aventure & Trekking';
      case 'surf': return 'Surf & Glisse';
      default: return 'Toutes thématiques';
    }
  };

  return (
    <div id="circuits-explorer-wrapper" className="space-y-12 animate-fade-in">
      
      {/* Intro Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-1.5 rounded-full border border-emerald-100 font-sans font-medium text-xs tracking-wider uppercase">
          <Compass size={14} className="text-emerald-600 animate-spin [animation-duration:8s]" />
          Circuits & Excursions Locaux
        </div>
        <h2 className="font-sans font-bold text-3xl md:text-4xl text-gray-900 tracking-tight">
          Explorez le Sénégal Autrement
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed max-w-2xl mx-auto">
          Découvrez notre sélection exclusive d'excursions guidées, treks sportifs et circuits d'immersion culturelle, conçus et encadrés par des guides et agences de voyage 100% locaux.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FILTERS & AGENCIES LIST */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Filters Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-sans font-bold text-sm text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Search className="text-emerald-600" size={16} />
              Affiner ma recherche
            </h3>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recherche libre</label>
              <input
                type="text"
                placeholder="Ex: Gorée, Casamance, trek, surf..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Region Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Région du Sénégal</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-medium"
              >
                <option value="all">Toutes les régions</option>
                <option value="Dakar">Dakar & Environs</option>
                <option value="Sine Saloum">Delta du Sine Saloum</option>
                <option value="Casamance">Casamance verte</option>
                <option value="Saint-Louis">Saint-Louis & Fleuve</option>
                <option value="Kédougou">Kédougou & Pays Bassari</option>
              </select>
            </div>

            {/* Theme Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Thématique du circuit</label>
              <div className="flex flex-col gap-1.5 pt-1">
                {[
                  { id: 'all', label: 'Tous les thèmes' },
                  { id: 'culture', label: '🏛️ Culture & Histoire' },
                  { id: 'nature', label: '🌿 Nature & Écotourisme' },
                  { id: 'aventure', label: '🥾 Aventure & Trekking' },
                  { id: 'surf', label: '🏄 Surf & Glisse' }
                ].map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedTheme === theme.id
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'border-transparent text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span>Budget Max</span>
                <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  {maxPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="100000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] text-gray-400 font-mono font-bold">
                <span>10k FCFA</span>
                <span>100k FCFA</span>
              </div>
            </div>
          </div>

          {/* Agencies info list */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-sm text-gray-900 border-b border-gray-100 pb-3">
              Agences Partenaires ({partnerAgencies.length})
            </h3>
            <p className="text-gray-500 text-[11px] leading-relaxed">
              Toutes les agences de notre réseau disposent d'un agrément du Ministère du Tourisme du Sénégal et d'assurances responsabilité professionnelle.
            </p>
            <div className="space-y-3 pt-1">
              {partnerAgencies.map(agency => (
                <div key={agency.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-sans font-bold text-xs text-gray-900">{agency.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium flex items-center gap-0.5 mt-0.5">
                        <MapPin size={10} /> Sénégal, {agency.location}
                      </p>
                    </div>
                    {agency.rating > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        ⭐ {agency.rating}
                      </span>
                    )}
                  </div>
                  <div className="border-t border-gray-200/60 pt-2 flex flex-col gap-1 text-[10px] text-gray-500 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Phone size={11} className="text-gray-400" />
                      <a href={`tel:${agency.contactPhone}`} className="hover:text-emerald-700 transition-colors font-mono">{agency.contactPhone}</a>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail size={11} className="text-gray-400" />
                      <a href={`mailto:${agency.contactEmail}`} className="hover:text-emerald-700 transition-colors">{agency.contactEmail}</a>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CIRCUITS & TOURS CARDS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-center bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-xs">
            <span className="text-xs font-bold text-gray-500">
              {agencyOffers.length} {agencyOffers.length > 1 ? 'circuits trouvés' : 'circuit trouvé'}
            </span>
            <div className="flex gap-2">
              {selectedRegion !== 'all' && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                  Region: {selectedRegion}
                  <button onClick={() => setSelectedRegion('all')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                </span>
              )}
              {selectedTheme !== 'all' && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                  Thème: {getThemeLabel(selectedTheme)}
                  <button onClick={() => setSelectedTheme('all')} className="hover:text-rose-600 font-bold ml-0.5">×</button>
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-2 min-h-[350px]">
              <RefreshCw className="animate-spin text-emerald-700" size={24} />
              <span className="text-xs font-semibold text-gray-500">Chargement des circuits Teranga...</span>
            </div>
          ) : agencyOffers.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 min-h-[350px] flex flex-col justify-center items-center">
              <span className="text-3xl">🧭</span>
              <h3 className="font-sans font-bold text-gray-800 text-sm mt-3">Aucun circuit trouvé</h3>
              <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto text-center leading-relaxed">
                Aucune excursion ou circuit de voyage ne correspond à vos filtres actuels. Modifiez le budget maximum ou sélectionnez d'autres critères.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {agencyOffers.map(offer => {
                const agency = partnerAgencies.find(a => a.id === offer.establishmentId)!;
                const isFavorite = savedCircuits.includes(offer.id);
                
                // Parse duration from title/description
                let durationText = "1 journée";
                if (offer.title.toLowerCase().includes('trek') || offer.title.toLowerCase().includes('cases à impluvium')) {
                  durationText = "2 jours / 1 nuit";
                }

                return (
                  <div 
                    key={offer.id}
                    className="bg-white rounded-3xl border border-gray-100 hover:border-emerald-100 hover:shadow-lg transition-all overflow-hidden flex flex-col md:flex-row shadow-sm"
                  >
                    {/* Circuit Image */}
                    <div className="w-full md:w-64 h-48 md:h-auto shrink-0 relative overflow-hidden bg-gray-100">
                      <img 
                        src={offer.images?.[0] || 'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=600&q=80'} 
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={() => toggleFavorite(offer.id)}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-500 hover:text-rose-600 shadow-xs border border-gray-100 transition-colors cursor-pointer"
                      >
                        <Heart size={14} className={isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
                      </button>
                      <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-gray-950/60 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-white/10 flex items-center gap-1">
                        <Clock size={11} />
                        {durationText}
                      </span>
                    </div>

                    {/* Circuit Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        
                        {/* Upper agency header */}
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            Excursion & Circuit
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            Par : <b className="text-gray-700 font-sans">{agency.name}</b>
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-sans font-bold text-base text-gray-900 hover:text-emerald-800 transition-colors">
                          {offer.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                          {offer.description}
                        </p>

                        {/* Services / Inclusions Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            👥 Groupe : max {offer.capacity} voyageurs
                          </span>
                          {offer.services.map((service, i) => (
                            <span 
                              key={i} 
                              className="text-[9px] font-semibold text-emerald-800 bg-emerald-50/60 px-2 py-0.5 rounded-md"
                            >
                              ✓ {service}
                            </span>
                          ))}
                        </div>

                      </div>

                      {/* Lower Action & Pricing bar */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100 gap-4">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-400 font-sans block font-medium">Tarif tout compris</span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono font-bold text-lg text-emerald-700">
                              {offer.price.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs font-bold text-emerald-700">FCFA</span>
                            <span className="text-[10px] text-gray-400 font-semibold font-sans">/ voyageur</span>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto">
                          {/* Map view button */}
                          <button
                            type="button"
                            onClick={() => onSearchEstablishment(agency.location as SenegalDestination)}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                            title="Voir la région sur la carte"
                          >
                            <MapPin size={13} />
                            <span className="hidden sm:inline">Région</span>
                          </button>

                          {/* Direct Book button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (onBookOffer) {
                                onBookOffer(offer);
                              } else {
                                alert("Veuillez réserver via le bouton de réservation principal ou vous connecter.");
                              }
                            }}
                            className="flex-1 sm:flex-initial bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <span>Réserver ce circuit</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Guarantee / Teranga banner */}
          <div className="bg-radial from-white to-amber-50/20 p-6 rounded-3xl border border-amber-100 flex flex-col sm:flex-row gap-5 items-center justify-between shadow-xs">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Garantie Teranga Responsable
              </span>
              <h4 className="font-sans font-bold text-sm text-gray-900">Tourisme équitable et retombées directes</h4>
              <p className="text-gray-500 text-xs leading-relaxed max-w-xl">
                90% du prix payé pour ces circuits revient directement aux guides locaux, rameurs de pirogues, hôtes de campements et cuisinières villageoises. Merci pour votre soutien au développement durable du Sénégal !
              </p>
            </div>
            <div className="shrink-0 bg-white p-3 rounded-2xl border border-amber-100">
              <ShieldCheck size={28} className="text-amber-600 animate-pulse" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
