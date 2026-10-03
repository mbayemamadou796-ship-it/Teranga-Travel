/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Compass, Building, ClipboardList, Users, Sparkles, MapPin, 
  Calendar, Star, ChevronRight, ArrowRight, CheckCircle2, 
  LogIn, UserPlus, Heart, Search, Eye, ShieldCheck, Sun, 
  Waves, Mountain, Coffee, Camera, Palmtree, ArrowLeft, X
} from 'lucide-react';
import { TerangaLogo } from '../../shared/ui/TerangaLogo';
import { Destination, Establishment, Offer, SenegalDestination } from '../../shared/types';

interface PublicShowcaseProps {
  destinations: Destination[];
  establishments: Establishment[];
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onSelectEstablishment: (est: Establishment) => void;
  onSelectOfferBooking: (offer: Offer, est: Establishment) => void;
}

export default function PublicShowcase({
  destinations,
  establishments,
  onOpenAuth,
  onSelectEstablishment,
  onSelectOfferBooking
}: PublicShowcaseProps) {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // Only show APPROVED establishments on the public showcase
  const approvedEstablishments = establishments.filter(e => e.status === 'approved');

  // Filtered accommodations (hotels, campements, maisons d'hôtes)
  const accommodationList = approvedEstablishments.filter(e => 
    ['hotel', 'campement', 'maison_hotes'].includes(e.type)
  ).filter(e => {
    const matchRegion = regionFilter === 'all' || e.location === regionFilter;
    const matchType = typeFilter === 'all' || e.type === typeFilter;
    const matchKeyword = !searchKeyword || 
      e.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      e.description.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchRegion && matchType && matchKeyword;
  });

  // Filtered circuits and guides (agences, guides)
  const circuitsList = approvedEstablishments.filter(e => 
    ['agence', 'guide'].includes(e.type)
  ).filter(e => {
    const matchRegion = regionFilter === 'all' || e.location === regionFilter;
    const matchKeyword = !searchKeyword || 
      e.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
      e.description.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchRegion && matchKeyword;
  });

  // Activities and landmarks list
  const touristActivities = [
    {
      id: 'act_goree',
      name: 'Île de Gorée & Maison des Esclaves',
      category: 'Histoire & Patrimoine',
      region: 'Dakar',
      image: 'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=800&q=80',
      description: 'Lieu de mémoire mondial classé à l’UNESCO, avec ses façades aux couleurs pastel et ruelles pavées de bougainvilliers.',
      tags: ['UNESCO', 'Histoire', 'Bateau chaloupe']
    },
    {
      id: 'act_saloum',
      name: 'Delta du Saloum & Forêts de Bolongs',
      category: 'Nature & Éco-tourisme',
      region: 'Sine Saloum',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      description: 'Balades en pirogue traditionnelle au milieu des mangroves sauvages et des colonies de pélicans et hérons goliaths.',
      tags: ['Mangroves', 'Pirogue', 'Oiseaux rares']
    },
    {
      id: 'act_dindefelo',
      name: 'Cascade de Dindéfélo & Monts Bassari',
      category: 'Aventure & Cascades',
      region: 'Kédougou',
      image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
      description: 'Chute spectaculaire de plus de 100 mètres nichée au cœur d’une végétation tropicale luxuriante au Sénégal oriental.',
      tags: ['Cascade', 'Randonnée', 'Baignade fraîche']
    },
    {
      id: 'act_cap_skirring',
      name: 'Plages Sauvages de Cap Skirring',
      category: 'Plages & Détente',
      region: 'Casamance',
      image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80',
      description: 'Kilomètres de sable doré bordés de cocotiers et de fromagers géants le long de l’océan Atlantique.',
      tags: ['Océan', 'Sable fin', 'Cocotiers']
    },
    {
      id: 'act_lac_rose',
      name: 'Le Lac Rose (Retba) & Dunes de sable',
      category: 'Paysages Insolites',
      region: 'Dakar',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      description: 'Célèbre lagune aux reflets mauves et roses, réputée pour sa forte salinité et les balades en 4x4 dans les dunes.',
      tags: ['Sel', 'Couleur rose', 'Safari quad']
    },
    {
      id: 'act_saint_louis',
      name: 'Saint-Louis (Ndar) & Pont Faidherbe',
      category: 'Histoire & Culture',
      region: 'Saint-Louis',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
      description: 'Ancienne capitale de l’AOF, réputée pour son architecture coloniale, ses calèches d’époque et son Festival de Jazz.',
      tags: ['Calèche', 'Jazz', 'Guet Ndar']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800 antialiased">
      
      {/* Decorative Senegal Flag Strip */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-emerald-600" />
        <div className="flex-1 bg-amber-400" />
        <div className="flex-1 bg-red-600" />
      </div>

      {/* 3.1 Header Public Showcase */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* Logo Teranga Travel */}
          <button 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setSelectedDestination(null);
            }}
            className="focus:outline-none cursor-pointer group text-left"
          >
            <TerangaLogo size={42} showText={true} />
          </button>

          {/* Connexion & Inscription buttons clearly visible on the right */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onOpenAuth('register')}
              className="hidden sm:inline-flex text-xs font-bold text-gray-700 hover:text-emerald-700 bg-gray-100 hover:bg-gray-200/80 px-4 py-2.5 rounded-xl transition-all cursor-pointer items-center gap-1.5"
            >
              <UserPlus size={15} />
              <span>Créer un compte</span>
            </button>

            <button
              onClick={() => onOpenAuth('login')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all cursor-pointer"
            >
              <LogIn size={15} />
              <span>Connexion</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Body of Vitrine Publique */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        
        {/* ========================================================
            4. SECTION HERO (Visual presentation of Senegal)
            ======================================================== */}
        <section className="relative rounded-[32px] overflow-hidden shadow-xl bg-slate-950 text-white animate-fade-in">
          {/* Background Photography with gradient overlay */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80" 
              alt="Paysage du Sénégal Teranga" 
              className="w-full h-full object-cover object-center opacity-45 scale-105 transform hover:scale-100 transition-all duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 p-8 sm:p-12 md:p-16 max-w-3xl space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
              <span>🇸🇳</span>
              <span>Vitrine Touristique Officielle du Sénégal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Découvrez le Sénégal <span className="text-emerald-400 underline decoration-amber-400">autrement</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
              Des destinations authentiques, des hébergements de charme, des circuits immersifs et des rencontres inoubliables au cœur de la Teranga sénégalaise.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => document.getElementById('section-destinations')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Compass size={17} />
                <span>Découvrir les destinations</span>
              </button>

              <button
                onClick={() => document.getElementById('section-accommodations')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 backdrop-blur-xs transition-all cursor-pointer"
              >
                <Building size={17} />
                <span>Voir les hébergements</span>
              </button>
            </div>

            {/* Quick Senegal Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-xs">
              <div>
                <span className="block font-black text-xl text-amber-400">100%</span>
                <span className="text-slate-300 text-[11px]">Teranga & Hospitalité</span>
              </div>
              <div>
                <span className="block font-black text-xl text-emerald-400">{approvedEstablishments.length}+</span>
                <span className="text-slate-300 text-[11px]">Adresses Certifiées</span>
              </div>
              <div>
                <span className="block font-black text-xl text-amber-400">6</span>
                <span className="text-slate-300 text-[11px]">Régions Majeures</span>
              </div>
              <div>
                <span className="block font-black text-xl text-emerald-400">Gratuit</span>
                <span className="text-slate-300 text-[11px]">Accès Visiteur Libre</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            5. DESTINATIONS POPULAIRES (Interactive discovery)
            ======================================================== */}
        <section id="section-destinations" className="space-y-6 pt-4">
            
            <div className="flex justify-between items-end flex-wrap gap-4">
              <div>
                <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider block">
                  Évasion & Découverte
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Destinations populaires du Sénégal
                </h2>
              </div>
            </div>

            {/* Destination Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => setSelectedDestination(dest)}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={dest.coverImage} 
                      alt={dest.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
                    
                    <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-gray-800 flex items-center gap-1">
                      <MapPin size={11} className="text-emerald-600" />
                      <span>Sénégal</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="text-xl font-bold tracking-tight">{dest.name}</h3>
                      <p className="text-xs text-gray-200 line-clamp-1 mt-0.5">{dest.description}</p>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Points forts :
                      </span>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {dest.highlights.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span className="truncate">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-1">
                        <span>Explorer la région</span>
                        <ArrowRight size={13} />
                      </span>
                      <span className="text-gray-400 text-[11px]">Accès libre</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </section>

        {/* Selected Destination Full Sheet Modal */}
        {selectedDestination && (
          <div className="fixed inset-0 z-50 bg-gray-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-6 p-6 sm:p-8 relative">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Destination Cover & Title */}
              <div className="relative rounded-2xl overflow-hidden h-64 shadow-xs">
                <img 
                  src={selectedDestination.coverImage} 
                  alt={selectedDestination.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider">
                    Destination Sénégal
                  </span>
                  <h2 className="text-3xl font-black">{selectedDestination.name}</h2>
                  <p className="text-sm text-gray-200">{selectedDestination.description}</p>
                </div>
              </div>

              {/* Long Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Présentation & Histoire</h4>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  {selectedDestination.longDescription}
                </p>
              </div>

              {/* Highlights & Activities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Lieux à visiter absolument</span>
                  </h4>
                  <ul className="text-xs text-emerald-950 space-y-1">
                    {selectedDestination.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100 space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Camera size={14} className="text-amber-600" />
                    <span>Activités & Expériences</span>
                  </h4>
                  <ul className="text-xs text-amber-950 space-y-1">
                    {selectedDestination.activities.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Culinary Specialties & Tips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <Coffee size={14} className="text-emerald-600" />
                    <span>Spécialités culinaires</span>
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedDestination.specialties.join(', ')}.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Conseils locaux Teranga</span>
                  </h4>
                  <ul className="text-gray-600 space-y-1">
                    {selectedDestination.localTips.slice(0, 2).map((tip, idx) => (
                      <li key={idx}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* CTA to view accommodations in this region */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center flex-wrap gap-3">
                <button
                  onClick={() => setSelectedDestination(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setRegionFilter(selectedDestination.name);
                    setSelectedDestination(null);
                    setTimeout(() => {
                      document.getElementById('section-accommodations')?.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Voir les hébergements à {selectedDestination.name}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            6. SECTION HÉBERGEMENTS (Only APPROVED establishments)
            ======================================================== */}
        <section id="section-accommodations" className="space-y-6 pt-6">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider block">
                Séjours d'exception
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Hébergements certifiés Teranga
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Seuls les hébergements validés et agréés sont présentés publiquement.
              </p>
            </div>

            {/* Region & Type Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-700 font-medium shadow-xs"
              >
                <option value="all">Toutes les régions</option>
                <option value="Dakar">Dakar</option>
                <option value="Sine Saloum">Sine Saloum</option>
                <option value="Casamance">Casamance</option>
                <option value="Saint-Louis">Saint-Louis</option>
                <option value="Kédougou">Kédougou</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-700 font-medium shadow-xs"
              >
                <option value="all">Tous les types</option>
                <option value="hotel">Hôtel</option>
                <option value="campement">Campement éco-lodge</option>
                <option value="maison_hotes">Maison d'hôtes</option>
              </select>
            </div>
          </div>

          {/* Accommodations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {accommodationList.map((est) => (
                <div
                  key={est.id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Establishment Photo */}
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={(est.images && est.images[0]) || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"} 
                        alt={est.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <ShieldCheck size={11} />
                        <span>Agréé Teranga</span>
                      </div>

                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-amber-500 text-xs font-bold px-2 py-0.5 rounded-xl flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>{est.rating || 4.8}</span>
                      </div>

                      <div className="absolute bottom-3 left-3 bg-gray-950/70 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <MapPin size={11} />
                        <span>{est.location}</span>
                      </div>
                    </div>

                    {/* Establishment Details */}
                    <div className="p-5 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-1">{est.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {est.description}
                      </p>

                      {/* Amenities Pills */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {est.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Pricing and Reservation Trigger */}
                  <div className="p-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Tarif indicatif</span>
                      <span className="text-sm font-black text-gray-900">
                        À partir de 35 000 FCFA
                        <span className="text-[10px] font-normal text-gray-500"> / nuit</span>
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectEstablishment(est)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Voir les offres
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </section>

        {/* ========================================================
            7. CIRCUITS & EXPÉRIENCES (Guided itineraries)
            ======================================================== */}
        <section id="section-circuits" className="space-y-6 pt-6">
          <div className="flex justify-between items-end flex-wrap gap-4">
            <div>
              <span className="text-amber-700 text-xs font-bold uppercase tracking-wider block">
                Circuits & Éco-aventures
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Circuits & guides locaux vérifiés
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Des itinéraires exclusifs accompagnés par des guides professionnels agréés.
              </p>
            </div>
          </div>

            {/* Circuits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {circuitsList.map((circuit) => (
                <div
                  key={circuit.id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img 
                        src={(circuit.images && circuit.images[0]) || "https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80"} 
                        alt={circuit.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <span>{circuit.type === 'guide' ? '🧭 Guide National' : '🚀 Agence Certifiée'}</span>
                      </div>

                      <div className="absolute bottom-3 left-3 bg-gray-950/70 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                        <MapPin size={11} />
                        <span>{circuit.location}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-1">{circuit.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                        {circuit.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Tarif indicatif</span>
                      <span className="text-sm font-black text-gray-900">
                        {circuit.type === 'guide' ? 'À partir de 25 000 FCFA' : 'À partir de 180 000 FCFA'}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectEstablishment(circuit)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Découvrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
        </section>

        {/* ========================================================
            8. ACTIVITÉS ET LIEUX À DÉCOUVRIR
            ======================================================== */}
        <section id="section-activities" className="space-y-6 pt-6">
            
            <div className="flex justify-between items-end flex-wrap gap-4">
              <div>
                <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider block">
                  Incontournables du Sénégal
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  Activités & lieux emblématiques
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Plages, cascades, parcs naturels, marchés artisanaux et trésors historiques.
                </p>
              </div>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {touristActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={act.image} 
                      alt={act.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />
                    
                    <span className="absolute top-3 left-3 bg-white/95 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                      {act.category}
                    </span>

                    <span className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center gap-1">
                      <MapPin size={12} className="text-emerald-400" />
                      <span>{act.region}</span>
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-gray-900">{act.name}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed">{act.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2">
                      {act.tags.map((t, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        {/* ========================================================
            9. COMMUNAUTÉ (Travelers sharing experiences)
            ======================================================== */}
        <section id="section-community" className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-[32px] p-8 sm:p-12 text-white space-y-8 shadow-xl mt-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block">
              Récits authentiques
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ils partagent leur expérience au Sénégal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consultez librement les avis et conseils de voyageurs. Créez un compte pour participer et publier vos propres carnets de voyage.
            </p>
          </div>

          {/* Testimonials Quotes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <p className="text-xs text-slate-200 leading-relaxed italic">
                « Mon séjour en Casamance avec l'accompagnement d'un guide local certifié a été le plus beau voyage de ma vie. Les cases à impluvium d'Enampore sont magiques ! »
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">F</div>
                <div>
                  <span className="text-xs font-bold block">Fatou D.</span>
                  <span className="text-[10px] text-amber-300">★ ★ ★ ★ ★ • Casamance</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <p className="text-xs text-slate-200 leading-relaxed italic">
                « Conseils pour visiter le Sine Saloum : prenez une pirogue au coucher du soleil et goûtez au miel de mangrove. Une sérénité et une Teranga absolues ! »
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">M</div>
                <div>
                  <span className="text-xs font-bold block">Marc L.</span>
                  <span className="text-[10px] text-amber-300">★ ★ ★ ★ ★ • Sine Saloum</span>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-6 rounded-2xl border border-white/10 space-y-3 flex flex-col justify-between">
              <p className="text-xs text-slate-200 leading-relaxed italic">
                « Les endroits à ne pas manquer à Saint-Louis : le quartier des pêcheurs de Guet Ndar et un détour par le parc des oiseaux du Djoudj. »
              </p>
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center">A</div>
                <div>
                  <span className="text-xs font-bold block">Aïcha B.</span>
                  <span className="text-[10px] text-amber-300">★ ★ ★ ★ ★ • Saint-Louis</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action to Join */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <span className="text-xs text-slate-300">
              Vous avez visité le Sénégal ? Partagez vos conseils avec la communauté.
            </span>
            <button
              onClick={() => onOpenAuth('login')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Rejoindre la communauté</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>

      </main>

      {/* Footer Vitrine Publique */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <TerangaLogo size={46} showText={true} />
            <div className="flex flex-wrap items-center gap-6 text-xs text-gray-500 font-medium">
              <button onClick={() => document.getElementById('section-destinations')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-700 cursor-pointer">Destinations</button>
              <button onClick={() => document.getElementById('section-accommodations')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-700 cursor-pointer">Hébergements</button>
              <button onClick={() => document.getElementById('section-circuits')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-700 cursor-pointer">Circuits & Guides</button>
              <button onClick={() => document.getElementById('section-activities')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-700 cursor-pointer">Activités</button>
              <button onClick={() => document.getElementById('section-community')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-emerald-700 cursor-pointer">Communauté</button>
              <button onClick={() => onOpenAuth('login')} className="text-emerald-700 font-bold hover:underline cursor-pointer">Espace Connexion</button>
            </div>
          </div>

          <p className="text-gray-400 text-xs text-center max-w-xl mx-auto leading-relaxed">
            Teranga Travel est la plateforme de référence pour découvrir, planifier et réserver des séjours authentiques au Sénégal. Conçue pour valoriser le patrimoine naturel et culturel sénégalais.
          </p>

          <div className="text-[11px] text-gray-400 text-center border-t border-gray-100 pt-6">
            &copy; {new Date().getFullYear()} Teranga Travel • Tous droits réservés.
          </div>

        </div>
      </footer>

    </div>
  );
}
