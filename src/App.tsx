/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Compass, Search, User, MapPin, Calendar, Users, Star, Coffee, Wifi, Phone, Mail, 
  Sparkles, Check, X, Shield, ChevronRight, Plus, ArrowLeft, Sun, Waves, Eye, 
  RefreshCw, ClipboardList, Building, CheckCircle, HelpCircle, ShieldAlert, Heart, Info 
} from 'lucide-react';
import { SenegalDestination, Destination, Establishment, Offer, Booking, Review, User as UserType } from './types';
import { INITIAL_DESTINATIONS } from './data';
import MapMock from './components/MapMock';
import AIPlanner from './components/AIPlanner';
import ReviewSection from './components/ReviewSection';
import BookingModal from './components/BookingModal';

export default function App() {
  // Navigation & Routing State
  const [activeTab, setActiveTab] = useState<'destinations' | 'establishments' | 'ai-planner' | 'dashboard'>('destinations');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  
  // Data State
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedOffers, setSelectedOffers] = useState<Offer[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<Review[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  
  // Filtering & Search
  const [locationFilter, setLocationFilter] = useState<SenegalDestination | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<'tourist' | 'professional'>('tourist');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Booking process
  const [bookingOffer, setBookingOffer] = useState<Offer | null>(null);

  // Creation forms (for Professionals)
  const [showAddOfferForm, setShowAddOfferForm] = useState(false);
  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferDesc, setNewOfferDesc] = useState('');
  const [newOfferPrice, setNewOfferPrice] = useState('');
  const [newOfferCapacity, setNewOfferCapacity] = useState('2');
  const [newOfferServices, setNewOfferServices] = useState('');
  const [newOfferQty, setNewOfferQty] = useState('2');

  const [showCreateEstForm, setShowCreateEstForm] = useState(false);
  const [newEstName, setNewEstName] = useState('');
  const [newEstDesc, setNewEstDesc] = useState('');
  const [newEstLocation, setNewEstLocation] = useState<SenegalDestination>('Dakar');
  const [newEstType, setNewEstType] = useState<'hotel' | 'campement' | 'maison_hotes' | 'agence'>('hotel');
  const [newEstAmenities, setNewEstAmenities] = useState<string[]>([]);
  const [newEstEmail, setNewEstEmail] = useState('');
  const [newEstPhone, setNewEstPhone] = useState('');

  // Global loading states
  const [loadingEst, setLoadingEst] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Load User session from LocalStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('teranga_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('teranga_user');
      }
    }
  }, []);

  // Fetch establishments
  const fetchEstablishments = async () => {
    setLoadingEst(true);
    try {
      const response = await fetch('/api/establishments');
      if (response.ok) {
        const data = await response.json();
        setEstablishments(data);
      }
    } catch (e) {
      console.error('Error fetching establishments:', e);
    } finally {
      setLoadingEst(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, []);

  // Fetch selected establishment details (Offers & Reviews)
  useEffect(() => {
    if (selectedEstablishment) {
      const fetchOffersAndReviews = async () => {
        setLoadingOffers(true);
        try {
          const offersRes = await fetch(`/api/establishments/${selectedEstablishment.id}/offers`);
          const reviewsRes = await fetch(`/api/reviews?establishmentId=${selectedEstablishment.id}`);
          
          if (offersRes.ok) {
            setSelectedOffers(await offersRes.json());
          }
          if (reviewsRes.ok) {
            setSelectedReviews(await reviewsRes.json());
          }
        } catch (e) {
          console.error('Error fetching details:', e);
        } finally {
          setLoadingOffers(false);
        }
      };
      fetchOffersAndReviews();
    }
  }, [selectedEstablishment]);

  // Fetch Bookings based on logged in user
  const fetchBookingsAndUsers = async () => {
    if (!currentUser) return;
    try {
      const url = `/api/bookings?userId=${currentUser.id}&role=${currentUser.role}${currentUser.establishmentId ? `&establishmentId=${currentUser.establishmentId}` : ''}`;
      const bookingsRes = await fetch(url);
      if (bookingsRes.ok) {
        setUserBookings(await bookingsRes.json());
      }

      // Fetch all users if admin
      if (currentUser.role === 'admin') {
        const response = await fetch('/api/establishments'); // just triggers refresh
        // For simple MVP we query users if needed, or filter db.json.
        // Let's create an endpoint or simulate in memory.
      }
    } catch (e) {
      console.error('Error fetching user space details:', e);
    }
  };

  useEffect(() => {
    fetchBookingsAndUsers();
  }, [currentUser, activeTab]);

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const endpoint = authTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = authTab === 'login' 
      ? { email: authEmail, password: authPassword }
      : { email: authEmail, password: authPassword, name: authName, role: authRole };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de la connexion.');
      }

      setCurrentUser(data.user);
      localStorage.setItem('teranga_user', JSON.stringify(data.user));
      setAuthSuccess(authTab === 'login' ? 'Connexion réussie !' : 'Inscription réussie !');
      
      // Clean forms
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teranga_user');
    setCurrentUser(null);
    setUserBookings([]);
    setAuthSuccess(null);
  };

  // Direct Login Shortcuts for Quick Evaluation
  const handleDirectLogin = async (email: string, pass: string) => {
    setAuthError(null);
    setAuthSuccess(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('teranga_user', JSON.stringify(data.user));
        setAuthSuccess('Connexion en tant que compte de test réussie !');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Create Establishment (Professional only)
  const handleCreateEstablishment = async (e: React.FormEvent) => {
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
          amenities: newEstAmenities,
          contactEmail: newEstEmail,
          contactPhone: newEstPhone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update user state locally
        const updatedUser = { ...currentUser, establishmentId: data.establishment.id };
        setCurrentUser(updatedUser);
        localStorage.setItem('teranga_user', JSON.stringify(updatedUser));
        
        await fetchEstablishments();
        setShowCreateEstForm(false);
        
        // Reset inputs
        setNewEstName('');
        setNewEstDesc('');
        setNewEstAmenities([]);
        setNewEstEmail('');
        setNewEstPhone('');
      }
    } catch (err) {
      console.error('Failed to create establishment:', err);
    }
  };

  // Create Room/Offer (Professional only)
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.establishmentId) return;

    try {
      const response = await fetch(`/api/establishments/${currentUser.establishmentId}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newOfferTitle,
          description: newOfferDesc,
          price: Number(newOfferPrice),
          capacity: Number(newOfferCapacity),
          services: newOfferServices.split(',').map(s => s.trim()).filter(s => s.length > 0),
          availableQuantity: Number(newOfferQty),
        }),
      });

      if (response.ok) {
        const newOffer = await response.json();
        setSelectedOffers((prev) => [...prev, newOffer]);
        setShowAddOfferForm(false);
        
        // Reset fields
        setNewOfferTitle('');
        setNewOfferDesc('');
        setNewOfferPrice('');
        setNewOfferCapacity('2');
        setNewOfferServices('');
        setNewOfferQty('2');
      }
    } catch (err) {
      console.error('Failed to create offer:', err);
    }
  };

  // Approve/Reject Reservation (Professional & Admin)
  const handleUpdateBookingStatus = async (bookingId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh bookings
        await fetchBookingsAndUsers();
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  // Approve/Reject Establishment (Admin only)
  const handleUpdateEstStatus = async (estId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/establishments/${estId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await fetchEstablishments();
      }
    } catch (err) {
      console.error('Failed to update establishment status:', err);
    }
  };

  // Link location click from destinations search
  const handleSearchEstablishmentOfLocation = (loc: SenegalDestination) => {
    setLocationFilter(loc);
    setSelectedDestination(null);
    setSelectedEstablishment(null);
    setActiveTab('establishments');
  };

  // Filters for listings
  const filteredEstablishments = establishments.filter((est) => {
    const matchesLocation = locationFilter === 'all' || est.location === locationFilter;
    const matchesType = typeFilter === 'all' || est.type === typeFilter;
    const matchesSearch = est.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          est.description.toLowerCase().includes(searchQuery.toLowerCase());
    // In public page, only show approved establishments. Professionals see their own pending/approved list in dashboard
    return matchesLocation && matchesType && matchesSearch && est.status === 'approved';
  });

  const proEstablishment = establishments.find(e => e.id === currentUser?.establishmentId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 antialiased">
      
      {/* Decorative Senegal Flag Strip at Top */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-emerald-600" />
        <div className="flex-1 bg-amber-400" />
        <div className="flex-1 bg-red-600" />
      </div>

      {/* Primary Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* Logo */}
          <button 
            onClick={() => {
              setSelectedDestination(null);
              setSelectedEstablishment(null);
              setActiveTab('destinations');
            }}
            className="flex items-center gap-3 focus:outline-none cursor-pointer group"
          >
            <div className="w-11 h-11 bg-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-700/10 group-hover:scale-105 transition-all">
              <span className="text-xl">🇸🇳</span>
            </div>
            <div className="text-left">
              <h1 className="font-sans font-bold text-lg text-gray-900 tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                Teranga Travel
              </h1>
              <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">Sénégal Autrement</p>
            </div>
          </button>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-1.5">
            {[
              { id: 'destinations', label: 'Destinations', icon: Compass },
              { id: 'establishments', label: 'Hébergements', icon: Building },
              { id: 'ai-planner', label: 'Circuits & Agences', icon: ClipboardList },
              { id: 'dashboard', label: 'Mon Espace', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedDestination(null);
                    setSelectedEstablishment(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-800' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Section & Mobile Trigger */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('dashboard');
                    setSelectedDestination(null);
                    setSelectedEstablishment(null);
                  }}
                  className="hidden sm:flex flex-col text-right cursor-pointer"
                >
                  <span className="text-xs font-bold text-gray-900 leading-none">{currentUser.name}</span>
                  <span className="text-[9px] text-gray-500 font-medium capitalize mt-1">
                    {currentUser.role === 'admin' ? 'Administrateur' : currentUser.role === 'professional' ? 'Professionnel' : 'Voyageur'}
                  </span>
                </button>
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-800 uppercase">
                  {currentUser.name.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:border-rose-100 transition-colors cursor-pointer"
                >
                  Quitter
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setSelectedDestination(null);
                  setSelectedEstablishment(null);
                }}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <User size={14} />
                <span>Se connecter</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Submenu Strip */}
        <div className="md:hidden border-t border-gray-100 bg-white px-2 py-2 flex justify-around">
          {[
            { id: 'destinations', label: 'Découvrir', icon: Compass },
            { id: 'establishments', label: 'Séjours', icon: Building },
            { id: 'ai-planner', label: 'Circuits', icon: ClipboardList },
            { id: 'dashboard', label: 'Mon Espace', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedDestination(null);
                  setSelectedEstablishment(null);
                }}
                className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-emerald-700 font-bold scale-105' : 'text-gray-400 text-xs'
                }`}
              >
                <Icon size={16} />
                <span className="text-[9px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Primary Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* ==================== TAB 1: DESTINATIONS ==================== */}
        {activeTab === 'destinations' && (
          <div id="tab-destinations" className="space-y-12">
            
            {/* If Single Destination is opened */}
            {selectedDestination ? (
              <div className="space-y-8 animate-fade-in">
                
                {/* Back Link */}
                <button 
                  onClick={() => setSelectedDestination(null)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Retour aux Destinations</span>
                </button>

                {/* Hero Banner Destination */}
                <div className="relative rounded-3xl overflow-hidden h-[300px] md:h-[400px] shadow-sm">
                  <img 
                    src={selectedDestination.coverImage} 
                    alt={selectedDestination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 backdrop-blur-xs px-2.5 py-1 rounded-full border border-amber-400/30">
                      Destination Majeure
                    </span>
                    <h2 className="font-sans font-bold text-3xl md:text-5xl tracking-tight">
                      {selectedDestination.name}
                    </h2>
                    <p className="text-gray-200 text-sm md:text-base max-w-2xl leading-relaxed">
                      {selectedDestination.description}
                    </p>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left block (Info, Highlights, Tips) */}
                  <div className="lg:col-span-7 space-y-8">
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                      <h3 className="font-sans font-bold text-lg text-gray-900">À propos de la destination</h3>
                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {selectedDestination.longDescription}
                      </p>
                    </div>

                    {/* Points d'intérêt */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                      <h3 className="font-sans font-bold text-lg text-gray-900 flex items-center gap-2 text-emerald-800">
                        <Sparkles size={18} className="text-amber-500 animate-pulse" />
                        Les Incontournables de {selectedDestination.name}
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {selectedDestination.highlights.map((h, i) => (
                          <li key={i} className="flex gap-2.5 items-start text-xs text-gray-700 font-medium">
                            <span className="w-5 h-5 bg-emerald-50 text-emerald-700 font-sans font-bold text-[10px] flex items-center justify-center rounded-full shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Local Tips Teranga */}
                    <div className="p-6 md:p-8 rounded-3xl border border-amber-100 bg-radial from-white to-amber-50/20 shadow-xs space-y-4">
                      <h3 className="font-sans font-bold text-lg text-amber-950 flex items-center gap-2">
                        💡 Conseil de la Teranga
                      </h3>
                      <div className="space-y-3">
                        {selectedDestination.localTips.map((tip, i) => (
                          <div key={i} className="flex gap-3 text-xs text-amber-900 leading-relaxed font-medium">
                            <span className="text-lg leading-none shrink-0">✨</span>
                            <p>{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right block (Local interactive map mock & Accommodations) */}
                  <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
                      <h3 className="font-sans font-bold text-base text-gray-900 mb-4">Localisation & Carte</h3>
                      <MapMock selectedDestination={selectedDestination.name} />
                    </div>

                    {/* Local stays list */}
                    <div className="space-y-4">
                      <h3 className="font-sans font-bold text-base text-gray-900">
                        Où loger à {selectedDestination.name} ?
                      </h3>
                      
                      {establishments.filter(e => e.location === selectedDestination.name && e.status === 'approved').length === 0 ? (
                        <div className="p-6 text-center bg-gray-100 rounded-2xl border border-dashed text-xs text-gray-500">
                          Aucun hébergement disponible pour le moment.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {establishments
                            .filter(e => e.location === selectedDestination.name && e.status === 'approved')
                            .map((est) => (
                              <button
                                key={est.id}
                                onClick={() => {
                                  setSelectedEstablishment(est);
                                  setActiveTab('establishments');
                                }}
                                className="w-full text-left p-4 bg-white rounded-2xl border border-gray-100 hover:border-emerald-100 hover:shadow-md transition-all flex gap-4 cursor-pointer"
                              >
                                <img 
                                  src={est.images[0]} 
                                  alt={est.name}
                                  className="w-16 h-16 object-cover rounded-xl shrink-0"
                                />
                                <div className="space-y-1 overflow-hidden flex-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                                      {est.type === 'hotel' ? 'Hôtel' : est.type === 'campement' ? 'Campement' : est.type === 'maison_hotes' ? 'Maison d\'hôtes' : 'Excursions'}
                                    </span>
                                    {est.rating > 0 && (
                                      <span className="text-[10px] font-semibold text-amber-700 flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-md">
                                        ⭐ {est.rating}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="font-sans font-bold text-xs text-gray-900 truncate">
                                    {est.name}
                                  </h4>
                                  <p className="text-[10px] text-gray-500 line-clamp-1">
                                    {est.description}
                                  </p>
                                </div>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              /* All Destinations home layout */
              <div className="space-y-12 animate-fade-in">
                
                {/* Hero Intro banner */}
                <div className="relative rounded-3xl overflow-hidden h-[260px] sm:h-[320px] bg-emerald-900 text-white flex flex-col justify-center px-6 sm:px-12 md:px-16 space-y-4 shadow-sm">
                  <div className="absolute inset-0 bg-radial from-emerald-800/80 to-emerald-950 opacity-90" />
                  
                  {/* Decorative map graphics in background */}
                  <div className="absolute right-0 bottom-0 opacity-10 w-96 h-96 pointer-events-none transform translate-x-12 translate-y-12">
                    <Compass size={384} />
                  </div>

                  <div className="relative z-10 space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 font-sans font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                      ★ BIENVENUE AU SÉNÉGAL ★
                    </div>
                    <h2 className="font-sans font-bold text-3xl sm:text-4.5xl leading-tight tracking-tight">
                      Découvrez la Teranga sénégalaise
                    </h2>
                    <p className="text-emerald-100 text-xs sm:text-sm max-w-lg leading-relaxed">
                      Planifiez, réservez et vivez vos vacances de rêve au Sénégal. De la vibrante Dakar aux montagnes de Kédougou, trouvez l'hébergement parfait.
                    </p>
                    
                    {/* Integrated CTA Search Button */}
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button 
                        onClick={() => setActiveTab('ai-planner')}
                        className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-sans font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition-all"
                      >
                        <Sparkles size={14} />
                        <span>Planifier avec l'IA</span>
                      </button>
                      <button 
                        onClick={() => {
                          setLocationFilter('all');
                          setActiveTab('establishments');
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-sans font-medium text-xs px-5 py-3 rounded-xl cursor-pointer transition-all"
                      >
                        Voir les hébergements
                      </button>
                    </div>
                  </div>
                </div>

                {/* Map & Grid Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                  
                  {/* Left part: Grid of Destinations */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-1">
                      <h3 className="font-sans font-bold text-xl text-gray-900 tracking-tight">Destinations phares</h3>
                      <p className="text-gray-500 text-xs">Sélectionnez une destination pour découvrir ses secrets et hébergements</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {INITIAL_DESTINATIONS.map((dest) => (
                        <button
                          key={dest.id}
                          onClick={() => setSelectedDestination(dest)}
                          className="group relative h-48 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer text-left"
                        >
                          <img 
                            src={dest.coverImage} 
                            alt={dest.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                            <h4 className="font-sans font-bold text-base tracking-tight">{dest.name}</h4>
                            <p className="text-gray-200 text-[11px] line-clamp-1">{dest.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right part: Stylized Senegal Interactive Map */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4 text-center">
                    <div className="space-y-1 text-center">
                      <h3 className="font-sans font-bold text-base text-gray-900">Carte Interactive</h3>
                      <p className="text-gray-500 text-xs">Cliquez sur un marqueur pour explorer la région</p>
                    </div>
                    <MapMock onSelectDestination={(name) => {
                      const dest = INITIAL_DESTINATIONS.find(d => d.name === name);
                      if (dest) setSelectedDestination(dest);
                    }} />
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 2: ESTABLISHMENTS ==================== */}
        {activeTab === 'establishments' && (
          <div id="tab-establishments" className="space-y-8 animate-fade-in">
            
            {/* If Single Establishment Detail View is active */}
            {selectedEstablishment ? (
              <div className="space-y-8 animate-fade-in">
                
                {/* Back controls */}
                <button 
                  onClick={() => setSelectedEstablishment(null)}
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl border border-emerald-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Retour aux hébergements</span>
                </button>

                {/* Establishment Gallery Header */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Big Image */}
                  <div className="md:col-span-8 rounded-3xl overflow-hidden h-[300px] md:h-[400px] shadow-xs relative">
                    <img 
                      src={selectedEstablishment.images[0]} 
                      alt={selectedEstablishment.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-gray-950/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border border-white/10">
                      Photo Principale
                    </div>
                  </div>

                  {/* Side Small Images */}
                  <div className="md:col-span-4 hidden md:flex flex-col gap-4">
                    {selectedEstablishment.images.slice(1, 3).map((img, i) => (
                      <div key={i} className="flex-1 rounded-2xl overflow-hidden shadow-xs relative h-48">
                        <img 
                          src={img} 
                          alt={`${selectedEstablishment.name} detail`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {selectedEstablishment.images.length < 2 && (
                      <div className="flex-1 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 font-sans font-bold text-xs">
                        Pas de photos secondaires
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Basics info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Details, Amenities, Rooms */}
                  <div className="lg:col-span-8 space-y-8">
                    
                    {/* Basic Info paper */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                          {selectedEstablishment.type === 'hotel' ? 'Hôtel' : selectedEstablishment.type === 'campement' ? 'Campement' : selectedEstablishment.type === 'maison_hotes' ? 'Maison d\'hôtes' : 'Excursions'}
                        </span>
                        
                        {selectedEstablishment.rating > 0 && (
                          <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-100 px-3 py-1 rounded-full text-xs font-semibold">
                            <Star size={14} className="fill-amber-400 text-amber-400" />
                            <span>{selectedEstablishment.rating} / 5</span>
                          </div>
                        )}
                      </div>

                      <h2 className="font-sans font-bold text-2xl md:text-3xl text-gray-900 tracking-tight leading-tight">
                        {selectedEstablishment.name}
                      </h2>

                      <p className="text-gray-500 text-xs flex items-center gap-1 font-semibold">
                        <MapPin size={14} className="text-emerald-600" /> 
                        <span>Sénégal, {selectedEstablishment.location}</span>
                      </p>

                      <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                        {selectedEstablishment.description}
                      </p>
                    </div>

                    {/* Amenities list */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                      <h3 className="font-sans font-bold text-base text-gray-900">Services & Équipements</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-2">
                        {selectedEstablishment.amenities.map((amenity, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <div className="p-1 bg-emerald-50 rounded-md text-emerald-700 shrink-0">
                              <Check size={12} className="stroke-[3]" />
                            </div>
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Offers / Rooms */}
                    <div className="space-y-4">
                      <h3 className="font-sans font-bold text-lg text-gray-900">
                        Chambres & Offres Disponibles
                      </h3>

                      {loadingOffers ? (
                        <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 flex items-center justify-center gap-2">
                          <RefreshCw className="animate-spin text-emerald-600" size={16} />
                          <span className="text-xs font-medium text-gray-500">Recherche des offres...</span>
                        </div>
                      ) : selectedOffers.length === 0 ? (
                        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 text-xs text-gray-500">
                          Aucune chambre ou offre enregistrée pour cet établissement pour le moment.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedOffers.map((offer) => (
                            <div 
                              key={offer.id} 
                              className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-emerald-100 transition-all shadow-xs flex flex-col sm:flex-row gap-5 items-start sm:items-center"
                            >
                              {offer.images?.[0] && (
                                <img 
                                  src={offer.images[0]} 
                                  alt={offer.title}
                                  className="w-full sm:w-28 h-24 object-cover rounded-xl shrink-0"
                                />
                              )}
                              <div className="space-y-1 flex-1">
                                <h4 className="font-sans font-bold text-sm text-gray-900">{offer.title}</h4>
                                <p className="text-gray-500 text-xs leading-relaxed">{offer.description}</p>
                                
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                  <span className="text-[9px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    Capacité : {offer.capacity} voyageurs
                                  </span>
                                  {offer.services.map((serv, i) => (
                                    <span key={i} className="text-[9px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                                      {serv}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="text-right sm:border-l sm:border-gray-100 sm:pl-5 shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-3 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0">
                                <div>
                                  <span className="text-[10px] text-gray-400 block font-sans font-medium">Prix estimé</span>
                                  <span className="font-mono font-bold text-emerald-700 text-base">
                                    {offer.price.toLocaleString('fr-FR')} FCFA
                                  </span>
                                  <span className="text-[9px] text-gray-400 block">/ nuit</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!currentUser) {
                                      setActiveTab('dashboard');
                                      alert("Veuillez vous connecter pour faire une réservation.");
                                      return;
                                    }
                                    setBookingOffer(offer);
                                  }}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm transition-all"
                                >
                                  Réserver
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Review Section */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs">
                      <ReviewSection 
                        establishmentId={selectedEstablishment.id}
                        reviews={selectedReviews}
                        onAddReview={(newReview) => {
                          setSelectedReviews((prev) => [newReview, ...prev]);
                        }}
                      />
                    </div>

                  </div>

                  {/* Right Column: Contact info panel */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                      <h3 className="font-sans font-bold text-base text-gray-900 border-b border-gray-100 pb-3">
                        Contact & Réservation
                      </h3>
                      
                      <div className="space-y-3.5 text-xs text-gray-700 font-medium">
                        {selectedEstablishment.contactEmail && (
                          <div className="flex items-center gap-2.5">
                            <Mail className="text-gray-400 shrink-0" size={16} />
                            <a href={`mailto:${selectedEstablishment.contactEmail}`} className="hover:text-emerald-700 transition-colors">
                              {selectedEstablishment.contactEmail}
                            </a>
                          </div>
                        )}
                        {selectedEstablishment.contactPhone && (
                          <div className="flex items-center gap-2.5">
                            <Phone className="text-gray-400 shrink-0" size={16} />
                            <a href={`tel:${selectedEstablishment.contactPhone}`} className="hover:text-emerald-700 transition-colors font-mono">
                              {selectedEstablishment.contactPhone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <Compass className="text-gray-400 shrink-0" size={16} />
                          <span>Localisation : {selectedEstablishment.location}, Sénégal</span>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex gap-2 text-[10px] text-amber-900 font-medium">
                        <Info size={14} className="shrink-0 mt-0.5 text-amber-600" />
                        <span>
                          En réservant via Teranga Travel, vous encouragez le tourisme local. L'établissement traitera directement votre dossier sans intermédiaires.
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* All Stays grid with search filters */
              <div className="space-y-8 animate-fade-in">
                
                {/* Section title & intro */}
                <div className="space-y-2">
                  <h2 className="font-sans font-bold text-2xl md:text-3xl text-gray-900 tracking-tight">
                    Trouver votre séjour idéal au Sénégal
                  </h2>
                  <p className="text-gray-500 text-xs">
                    Découvrez des hébergements de confiance validés par notre équipe : Hôtels, Éco-lodges et Campements d'accueil.
                  </p>
                </div>

                {/* Filtering controls bar */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
                  
                  {/* Search box */}
                  <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      type="text"
                      placeholder="Rechercher par nom..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800"
                    />
                  </div>

                  {/* Filter Selects */}
                  <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                    
                    {/* Location selector */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 w-full sm:w-auto">
                      <span className="font-sans font-semibold shrink-0">Région :</span>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value as any)}
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="all">Toutes les régions</option>
                        <option value="Dakar">Dakar</option>
                        <option value="Sine Saloum">Sine Saloum</option>
                        <option value="Casamance">Casamance</option>
                        <option value="Saint-Louis">Saint-Louis</option>
                        <option value="Kédougou">Kédougou</option>
                      </select>
                    </div>

                    {/* Type selector */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 w-full sm:w-auto">
                      <span className="font-sans font-semibold shrink-0">Type :</span>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="all">Tous les types</option>
                        <option value="hotel">Hôtel de charme</option>
                        <option value="campement">Campement Nature</option>
                        <option value="maison_hotes">Maison d'hôtes</option>
                      </select>
                    </div>

                  </div>

                </div>

                {/* Grid list results */}
                {loadingEst ? (
                  <div className="p-16 text-center bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="animate-spin text-emerald-700" size={24} />
                    <span className="text-xs font-semibold text-gray-500">Chargement de la Teranga...</span>
                  </div>
                ) : filteredEstablishments.length === 0 ? (
                  <div className="p-16 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <span className="text-3xl">🏜️</span>
                    <h3 className="font-sans font-bold text-gray-800 text-sm mt-3">Aucun séjour ne correspond</h3>
                    <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">Essayez d'ajuster vos filtres de recherche ou sélectionnez une autre région.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEstablishments.map((est) => (
                      <button
                        key={est.id}
                        onClick={() => setSelectedEstablishment(est)}
                        className="group bg-white rounded-3xl border border-gray-100 hover:border-emerald-100 shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all overflow-hidden flex flex-col text-left cursor-pointer"
                      >
                        {/* Image banner */}
                        <div className="h-48 w-full overflow-hidden relative shrink-0">
                          <img 
                            src={est.images[0]} 
                            alt={est.name}
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-gray-100 shadow-xs">
                            {est.type === 'hotel' ? 'Hôtel' : est.type === 'campement' ? 'Campement' : est.type === 'maison_hotes' ? 'Maison d\'hôtes' : 'Excursions'}
                          </span>
                          
                          {est.rating > 0 && (
                            <span className="absolute bottom-3 right-3 text-[10px] font-bold text-amber-950 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-xs">
                              ⭐ {est.rating}
                            </span>
                          )}
                        </div>

                        {/* Content block */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-0.5">
                              <MapPin size={10} /> {est.location}
                            </p>
                            <h3 className="font-sans font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                              {est.name}
                            </h3>
                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                              {est.description}
                            </p>
                          </div>

                          {/* Action helper */}
                          <div className="flex justify-between items-center border-t border-gray-100 pt-3 text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                            <span>Découvrir l'offre</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ==================== TAB 3: CIRCUITS & AGENCES ==================== */}
        {activeTab === 'ai-planner' && (
          <div id="tab-ai-planner" className="animate-fade-in">
            <AIPlanner 
              onSearchEstablishment={handleSearchEstablishmentOfLocation}
              establishments={establishments}
              onBookOffer={(offer) => {
                if (!currentUser) {
                  setActiveTab('dashboard');
                  alert("Veuillez vous connecter pour faire une réservation.");
                  return;
                }
                setBookingOffer(offer);
              }}
              currentUser={currentUser}
              onSwitchToDashboard={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {/* ==================== TAB 4: DASHBOARD / AUTH ==================== */}
        {activeTab === 'dashboard' && (
          <div id="tab-dashboard" className="space-y-8 animate-fade-in">
            
            {/* 1. IF NOT AUTHENTICATED */}
            {!currentUser ? (
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                
                {/* Left graphics intro panel */}
                <div className="md:col-span-5 space-y-6">
                  <span className="text-[10px] font-sans font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full uppercase tracking-wider">
                    Espace Membres
                  </span>
                  <h2 className="font-sans font-bold text-2xl md:text-3xl text-gray-900 tracking-tight leading-none">
                    Rejoignez Teranga Travel
                  </h2>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    Créez un compte pour effectuer et suivre des réservations ou, si vous êtes un hôtelier local, pour publier vos offres touristiques.
                  </p>

                  {/* Evaluation shortcuts */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-3.5">
                    <h4 className="font-sans font-bold text-xs text-amber-950 flex items-center gap-1">
                      💡 Raccourcis de Test MVP :
                    </h4>
                    <p className="text-[10px] text-amber-900 leading-snug">
                      Cliquez ci-dessous pour vous connecter instantanément à l'un de nos profils préconfigurés afin d'évaluer tous les aspects de la plateforme :
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDirectLogin('tourist@teranga.sn', 'tourist')}
                        className="bg-white hover:bg-emerald-50 text-emerald-800 text-[10px] font-semibold py-2 px-3 rounded-xl border border-emerald-200/80 transition-all text-left flex justify-between items-center cursor-pointer"
                      >
                        <span>👤 Voyageur (Fatou Diop)</span>
                        <ChevronRight size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectLogin('professional@teranga.sn', 'professional')}
                        className="bg-white hover:bg-amber-50 text-amber-800 text-[10px] font-semibold py-2 px-3 rounded-xl border border-amber-200/80 transition-all text-left flex justify-between items-center cursor-pointer"
                      >
                        <span>🏠 Hôtelier Dakar (Cheikh Ndiaye)</span>
                        <ChevronRight size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDirectLogin('admin@teranga.sn', 'admin')}
                        className="bg-white hover:bg-red-50 text-red-800 text-[10px] font-semibold py-2 px-3 rounded-xl border border-red-200/80 transition-all text-left flex justify-between items-center cursor-pointer"
                      >
                        <span>🛡️ Administrateur (Modou Sow)</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right auth form panel */}
                <div className="md:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  
                  {/* Tabs */}
                  <div className="flex border-b border-gray-100">
                    <button
                      onClick={() => setAuthTab('login')}
                      className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                        authTab === 'login' 
                          ? 'border-emerald-600 text-emerald-700' 
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Connexion
                    </button>
                    <button
                      onClick={() => setAuthTab('register')}
                      className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
                        authTab === 'register' 
                          ? 'border-emerald-600 text-emerald-700' 
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      Créer un compte
                    </button>
                  </div>

                  {/* Feedback messaging */}
                  {authError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                      <ShieldAlert size={14} className="shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    
                    {authTab === 'register' && (
                      <>
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Nom Complet</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex. Fatou Diop"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800"
                          />
                        </div>

                        {/* Role selection */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Type de Profil</label>
                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setAuthRole('tourist')}
                              className={`p-2.5 rounded-xl text-center border text-xs font-medium transition-all cursor-pointer ${
                                authRole === 'tourist' 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              👤 Voyageur / Touriste
                            </button>
                            <button
                              type="button"
                              onClick={() => setAuthRole('professional')}
                              className={`p-2.5 rounded-xl text-center border text-xs font-medium transition-all cursor-pointer ${
                                authRole === 'professional' 
                                  ? 'bg-amber-50 border-amber-500 text-amber-800' 
                                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              🏠 Hôtelier / Professionnel
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Adresse E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="nom@exemple.sn"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Mot de Passe</label>
                      <input
                        type="password"
                        required
                        placeholder="Saisir votre mot de passe"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-gray-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-3 px-6 rounded-xl text-xs transition-all shadow-sm cursor-pointer mt-2"
                    >
                      {authTab === 'login' ? 'Se Connecter' : 'Créer mon Compte'}
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              /* 2. IF AUTHENTICATED AND LOGGED IN */
              <div className="space-y-8">
                
                {/* Greeting banner with Senegal design and nice ocre frame */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-1">
                    <span className="text-[9px] font-sans font-bold text-amber-800 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Bienvenue au Tableau de Bord
                    </span>
                    <h2 className="font-sans font-bold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
                      Jërëjëf, {currentUser.name} !
                    </h2>
                    <p className="text-gray-500 text-xs font-medium">
                      E-mail enregistré : <span className="font-mono">{currentUser.email}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-lg shadow-sm">
                      🇸🇳
                    </div>
                    <div className="text-left text-xs text-emerald-900 leading-tight">
                      <p className="font-bold">Mon Profil Teranga</p>
                      <p className="text-[10px] text-emerald-700 capitalize mt-0.5">{currentUser.role === 'admin' ? 'Administrateur' : currentUser.role === 'professional' ? 'Hôtelier Pro' : 'Voyageur'}</p>
                    </div>
                  </div>
                </div>

                {/* ROLE SUB-VIEW A: TOURIST DASHBOARD */}
                {currentUser.role === 'tourist' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
                      <h3 className="font-sans font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                        <ClipboardList className="text-emerald-700" size={18} />
                        Mes Demandes de Réservations ({userBookings.length})
                      </h3>

                      {userBookings.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                          <span className="text-3xl">🧳</span>
                          <h4 className="font-sans font-bold text-gray-800 text-sm mt-3">Aucun séjour réservé pour l'instant</h4>
                          <p className="text-gray-500 text-xs mt-1 max-w-xs mx-auto">
                            Découvrez nos destinations de rêve ou demandez de l'aide à l'Assistant Voyage IA pour vous aider à planifier.
                          </p>
                          <button
                            onClick={() => {
                              setActiveTab('destinations');
                              setSelectedDestination(null);
                            }}
                            className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer"
                          >
                            Parcourir les destinations
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userBookings.map((book) => (
                            <div key={book.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                    book.status === 'approved' 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                      : book.status === 'rejected' 
                                      ? 'bg-rose-50 border-rose-200 text-rose-800' 
                                      : 'bg-amber-50 border-amber-200 text-amber-800'
                                  }`}>
                                    {book.status === 'approved' ? '✓ Confirmé par l\'hôte' : book.status === 'rejected' ? '✗ Décliné' : '⏰ En attente d\'approbation'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">ID: {book.id}</span>
                                </div>

                                <h4 className="font-sans font-bold text-sm text-gray-900">{book.offerTitle}</h4>
                                <p className="text-xs text-gray-500 font-medium">Hébergement : <b>{book.establishmentName}</b></p>
                                
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium pt-1">
                                  <span className="flex items-center gap-1"><Calendar size={13} /> {book.checkIn} au {book.checkOut}</span>
                                  <span className="flex items-center gap-1"><Users size={13} /> {book.guestsCount} voyageur(s)</span>
                                </div>
                              </div>

                              <div className="text-right flex md:flex-col justify-between items-center md:items-end w-full md:w-auto pt-3 md:pt-0 border-t border-gray-50 md:border-t-0 shrink-0">
                                <span className="text-[10px] text-gray-400 font-medium block">Total à payer sur place :</span>
                                <span className="font-mono font-bold text-gray-900 text-sm md:text-base">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                                <p className="text-[9px] text-gray-400 italic mt-0.5">Teranga Protection</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ROLE SUB-VIEW B: PROFESSIONAL DASHBOARD */}
                {currentUser.role === 'professional' && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Check if pro has an establishment */}
                    {!currentUser.establishmentId ? (
                      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6 max-w-xl mx-auto text-center">
                        <span className="text-3xl">🏠</span>
                        <h3 className="font-sans font-bold text-lg text-gray-900">Enregistrer votre Établissement</h3>
                        <p className="text-gray-500 text-xs">
                          Vous n'avez pas encore d'établissement enregistré sous votre profil. Remplissez ce formulaire d'enregistrement de base pour que les administrateurs valident votre établissement.
                        </p>

                        <button
                          type="button"
                          onClick={() => setShowCreateEstForm(true)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-3 px-6 rounded-xl text-xs transition-all cursor-pointer"
                        >
                          Remplir le Formulaire
                        </button>

                        {/* Slide form container */}
                        {showCreateEstForm && (
                          <form onSubmit={handleCreateEstablishment} className="text-left space-y-4 border-t border-gray-100 pt-6 mt-6">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Nom de l'Établissement</label>
                              <input
                                type="text"
                                required
                                placeholder="Ex. Ecolodge de la Casamance"
                                value={newEstName}
                                onChange={(e) => setNewEstName(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description immersive</label>
                              <textarea
                                required
                                rows={3}
                                placeholder="Décrivez votre hébergement, son cadre et l'accueil que vous réservez..."
                                value={newEstDesc}
                                onChange={(e) => setNewEstDesc(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-gray-800"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Région</label>
                                <select
                                  value={newEstLocation}
                                  onChange={(e) => setNewEstLocation(e.target.value as any)}
                                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs text-gray-800 focus:outline-none"
                                >
                                  <option value="Dakar">Dakar</option>
                                  <option value="Sine Saloum">Sine Saloum</option>
                                  <option value="Casamance">Casamance</option>
                                  <option value="Saint-Louis">Saint-Louis</option>
                                  <option value="Kédougou">Kédougou</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Type d'établissement</label>
                                <select
                                  value={newEstType}
                                  onChange={(e) => setNewEstType(e.target.value as any)}
                                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs text-gray-800 focus:outline-none"
                                >
                                  <option value="hotel">Hôtel</option>
                                  <option value="campement">Campement</option>
                                  <option value="maison_hotes">Maison d'hôtes</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">E-mail de Contact</label>
                                <input
                                  type="email"
                                  required
                                  value={newEstEmail}
                                  onChange={(e) => setNewEstEmail(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs text-gray-800"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Téléphone</label>
                                <input
                                  type="text"
                                  required
                                  value={newEstPhone}
                                  onChange={(e) => setNewEstPhone(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs text-gray-800"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Équipements (séparés par des virgules)</label>
                              <input
                                type="text"
                                placeholder="Ex: Wi-Fi gratuit, Piscine, Énergie solaire, Climatisation"
                                onChange={(e) => setNewEstAmenities(e.target.value.split(',').map(a => a.trim()).filter(a => a.length > 0))}
                                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs text-gray-800"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-3 px-6 rounded-xl text-xs transition-all cursor-pointer"
                            >
                              Soumettre mon établissement
                            </button>
                          </form>
                        )}
                      </div>
                    ) : (
                      /* Active professional dashboard view */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        
                        {/* Left part: Stats & bookings manager */}
                        <div className="lg:col-span-8 space-y-8">
                          
                          {/* Establishment Card Summary info */}
                          {proEstablishment && (
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                                    proEstablishment.status === 'approved' 
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                      : proEstablishment.status === 'rejected'
                                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                                      : 'bg-amber-50 border-amber-200 text-amber-800'
                                  }`}>
                                    {proEstablishment.status === 'approved' ? '✓ Établissement Validé' : proEstablishment.status === 'rejected' ? '✗ Établissement Rejeté' : '⏰ En attente de validation par l\'admin'}
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">Location : {proEstablishment.location}</span>
                                </div>
                                <h3 className="font-sans font-bold text-lg text-gray-900">{proEstablishment.name}</h3>
                              </div>

                              <button
                                onClick={() => {
                                  setSelectedEstablishment(proEstablishment);
                                  setActiveTab('establishments');
                                }}
                                className="text-xs text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Eye size={12} />
                                <span>Voir ma Page</span>
                              </button>
                            </div>
                          )}

                          {/* Demandes de Réservations list */}
                          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
                            <h3 className="font-sans font-bold text-base text-gray-900 border-b border-gray-100 pb-4">
                              Demandes de Réservations Reçues ({userBookings.length})
                            </h3>

                            {userBookings.length === 0 ? (
                              <div className="p-8 text-center bg-gray-50/50 rounded-2xl text-xs text-gray-500">
                                Aucune demande de réservation reçue pour le moment.
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {userBookings.map((book) => (
                                  <div key={book.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all shadow-xs space-y-3">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-gray-900">{book.offerTitle}</span>
                                          <span className="text-[10px] text-gray-400 font-mono">({book.id})</span>
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium">Demandeur : <b>{book.touristName}</b> (<a href={`mailto:${book.touristEmail}`} className="hover:underline text-emerald-700">{book.touristEmail}</a>)</p>
                                      </div>

                                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                                        book.status === 'approved' 
                                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                          : book.status === 'rejected' 
                                          ? 'bg-rose-50 border-rose-200 text-rose-800' 
                                          : 'bg-amber-50 border-amber-200 text-amber-800'
                                      }`}>
                                        {book.status === 'approved' ? '✓ Accepté' : book.status === 'rejected' ? '✗ Décliné' : '⏰ En attente'}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 font-medium pt-2 border-t border-gray-50">
                                      <div className="flex gap-4">
                                        <span>📅 <b>Dates :</b> {book.checkIn} au {book.checkOut}</span>
                                        <span>👥 <b>Voyageurs :</b> {book.guestsCount}</span>
                                      </div>
                                      <div>
                                        <span><b>Montant estimé :</b> </span>
                                        <span className="font-mono font-bold text-gray-900">{book.totalPrice.toLocaleString('fr-FR')} FCFA</span>
                                      </div>
                                    </div>

                                    {/* Decision buttons */}
                                    {book.status === 'pending' && (
                                      <div className="flex gap-2 justify-end pt-2">
                                        <button
                                          onClick={() => handleUpdateBookingStatus(book.id, 'rejected')}
                                          className="bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-700 px-3.5 py-1.5 rounded-xl border border-gray-200 hover:border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
                                        >
                                          Décliner
                                        </button>
                                        <button
                                          onClick={() => handleUpdateBookingStatus(book.id, 'approved')}
                                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                                        >
                                          Accepter la demande
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right part: Add Room form */}
                        <div className="lg:col-span-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-4">
                          <h3 className="font-sans font-bold text-base text-gray-900 border-b border-gray-100 pb-3">
                            Créer une Offre / Chambre
                          </h3>
                          
                          <form onSubmit={handleCreateOffer} className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Nom de la Chambre / Offre</label>
                              <input
                                type="text"
                                required
                                placeholder="Ex. Suite Royale avec Balcon"
                                value={newOfferTitle}
                                onChange={(e) => setNewOfferTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                              <textarea
                                required
                                rows={3}
                                value={newOfferDesc}
                                onChange={(e) => setNewOfferDesc(e.target.value)}
                                placeholder="Taille de la pièce, lits, vue, équipements de base..."
                                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-xs text-gray-800 resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Prix / nuit (FCFA)</label>
                                <input
                                  type="number"
                                  required
                                  value={newOfferPrice}
                                  onChange={(e) => setNewOfferPrice(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800 font-mono"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Capacité (personnes)</label>
                                <input
                                  type="number"
                                  required
                                  value={newOfferCapacity}
                                  onChange={(e) => setNewOfferCapacity(e.target.value)}
                                  className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">Services inclus (séparés par des virgules)</label>
                              <input
                                type="text"
                                placeholder="Ex: Petit-déjeuner inclus, Wi-Fi gratuit, Climatisation"
                                value={newOfferServices}
                                onChange={(e) => setNewOfferServices(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl text-xs text-gray-800"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-sans font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                            >
                              Publier la chambre
                            </button>
                          </form>
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* ROLE SUB-VIEW C: ADMIN DASHBOARD */}
                {currentUser.role === 'admin' && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* Admin overall metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1 text-center">
                        <span className="text-gray-400 text-xs block font-bold uppercase tracking-wider">Hébergements Enregistrés</span>
                        <span className="text-2xl font-bold text-gray-900">{establishments.length}</span>
                        <p className="text-[10px] text-emerald-700 font-medium">Validés ou en cours</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1 text-center">
                        <span className="text-gray-400 text-xs block font-bold uppercase tracking-wider">Hébergements en Attente</span>
                        <span className="text-2xl font-bold text-amber-600">
                          {establishments.filter(e => e.status === 'pending').length}
                        </span>
                        <p className="text-[10px] text-amber-700 font-medium">Nouveaux dossiers professionnels</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-1 text-center">
                        <span className="text-gray-400 text-xs block font-bold uppercase tracking-wider">Régions Couvertes</span>
                        <span className="text-2xl font-bold text-blue-600">5</span>
                        <p className="text-[10px] text-blue-700 font-medium">Sine Saloum, Casamance, Dakar, Ndar, Kédougou</p>
                      </div>
                    </div>

                    {/* Pending establishments validation section */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
                      <h3 className="font-sans font-bold text-base text-gray-900 border-b border-gray-100 pb-4">
                        Établissements en attente de validation ({establishments.filter(e => e.status === 'pending').length})
                      </h3>

                      {establishments.filter(e => e.status === 'pending').length === 0 ? (
                        <div className="p-8 text-center bg-gray-50/50 rounded-2xl text-xs text-gray-500">
                          Aucun établissement en attente d'approbation. Tous les dossiers sont traités.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {establishments.filter(e => e.status === 'pending').map((est) => (
                            <div key={est.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 transition-all shadow-xs space-y-3">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div className="space-y-1">
                                  <h4 className="font-sans font-bold text-sm text-gray-900">{est.name}</h4>
                                  <p className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block capitalize font-bold">
                                    {est.type}
                                  </p>
                                  <p className="text-xs text-gray-500 font-medium">Région : <b>{est.location}</b></p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 border-amber-200 text-amber-800 uppercase">
                                  ⏰ En attente
                                </span>
                              </div>

                              <p className="text-gray-600 text-xs leading-relaxed">{est.description}</p>

                              <div className="flex justify-between items-center text-xs text-gray-500 font-medium border-t border-gray-50 pt-2 flex-wrap gap-2">
                                <div className="flex gap-4">
                                  <span>✉ {est.contactEmail || 'Non fourni'}</span>
                                  <span>📞 {est.contactPhone || 'Non fourni'}</span>
                                </div>
                                
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateEstStatus(est.id, 'rejected')}
                                    className="bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-700 px-3.5 py-1.5 rounded-xl border border-gray-200 hover:border-rose-200 text-xs font-semibold cursor-pointer transition-colors"
                                  >
                                    Rejeter
                                  </button>
                                  <button
                                    onClick={() => handleUpdateEstStatus(est.id, 'approved')}
                                    className="bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all"
                                  >
                                    Approuver l'établissement
                                  </button>
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

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex justify-center items-center gap-2 font-sans font-bold text-gray-900">
            <span>🇸🇳</span>
            <span>Teranga Travel Sénégal</span>
          </div>
          <p className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed font-medium">
            Plateforme touristique numérique unifiée. Conçue avec amour pour promouvoir le tourisme local, préserver le patrimoine historique sénégalais et encourager l'éco-responsabilité.
          </p>
          <div className="text-[10px] text-gray-300 font-mono">
            &copy; {new Date().getFullYear()} Teranga Travel MVP. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Booking Modal render trigger */}
      {bookingOffer && selectedEstablishment && currentUser && (
        <BookingModal
          offer={bookingOffer}
          establishment={selectedEstablishment}
          touristId={currentUser.id}
          onClose={() => setBookingOffer(null)}
          onSuccess={(booking) => {
            // Update bookings list dynamically
            setUserBookings((prev) => [booking, ...prev]);
          }}
        />
      )}

    </div>
  );
}
