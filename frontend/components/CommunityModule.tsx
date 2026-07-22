/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Plus, ThumbsUp, Flag, MapPin, Sparkles, MessageSquare, 
  Compass, HelpCircle, Lightbulb, Image as ImageIcon, Store, CheckCircle, 
  X, Filter, Send, ChevronRight, Share2, AlertTriangle, User as UserIcon
} from 'lucide-react';
import { Community, CommunityPost, CommunityPostCategory, User as UserType } from '../../shared/types';

interface CommunityModuleProps {
  currentUser: UserType | null;
  onNavigateToAuth?: () => void;
}

const CATEGORIES: { id: CommunityPostCategory | 'all'; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
  { id: 'all', label: 'Toutes les publications', icon: Users },
  { id: 'retours_experience', label: 'Retours d\'expérience', icon: Compass },
  { id: 'conseils', label: 'Conseils aux voyageurs', icon: Lightbulb },
  { id: 'questions', label: 'Questions & Réponses', icon: HelpCircle },
  { id: 'photos', label: 'Photos de séjours', icon: ImageIcon },
  { id: 'bonnes_adresses', label: 'Bonnes adresses', icon: Store },
];

export default function CommunityModule({ currentUser, onNavigateToAuth }: CommunityModuleProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<CommunityPostCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Post Form
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [postTitle, setPostTitle] = useState<string>('');
  const [postContent, setPostContent] = useState<string>('');
  const [postCategory, setPostCategory] = useState<CommunityPostCategory>('retours_experience');
  const [postDestination, setPostDestination] = useState<string>('Casamance');
  const [postLocationSpot, setPostLocationSpot] = useState<string>('');
  const [postImageUrl, setPostImageUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Report Modal
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  // Fetch Communities
  const fetchCommunities = async () => {
    try {
      const res = await fetch('/api/communities?activeOnly=true');
      if (res.ok) {
        const data = await res.json();
        setCommunities(data);
      }
    } catch (err) {
      console.error('Error fetching communities:', err);
    }
  };

  // Fetch Posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCommunityId !== 'all') {
        params.append('communityId', selectedCommunityId);
      }
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchQuery.trim().length > 0) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/community-posts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error('Error fetching community posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCommunityId, selectedCategory, searchQuery]);

  // Selected Community Object
  const currentCommunity = communities.find(c => c.id === selectedCommunityId);

  // Handle Like
  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/community-posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  // Handle Create Post
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    setSubmitting(true);
    try {
      // Find matching community ID
      const targetComm = communities.find(c => c.name.toLowerCase() === postDestination.toLowerCase()) || communities[0];

      const payload = {
        communityId: targetComm ? targetComm.id : 'comm_casamance',
        destination: postDestination,
        authorId: currentUser ? currentUser.id : 'guest_' + Date.now(),
        authorName: currentUser ? currentUser.name : 'Voyageur Teranga',
        authorRole: currentUser ? currentUser.role : 'tourist',
        title: postTitle,
        content: postContent,
        category: postCategory,
        locationSpot: postLocationSpot.trim() || undefined,
        imageUrl: postImageUrl.trim() || undefined,
      };

      const res = await fetch('/api/community-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMessage('Votre publication a été ajoutée avec succès à la communauté !');
        setPostTitle('');
        setPostContent('');
        setPostLocationSpot('');
        setPostImageUrl('');
        setShowCreateModal(false);
        await fetchPosts();
        await fetchCommunities();
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to create community post:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Report Post
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId || !reportReason.trim()) return;

    try {
      const res = await fetch(`/api/community-posts/${reportingPostId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportingPostId(null);
          setReportReason('');
          setReportSuccess(false);
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to report post:', err);
    }
  };

  // Category Badge Colors
  const getCategoryBadge = (cat: CommunityPostCategory) => {
    switch (cat) {
      case 'retours_experience':
        return { label: 'Retour d\'expérience', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'conseils':
        return { label: 'Conseil Voyage', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'questions':
        return { label: 'Question', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'photos':
        return { label: 'Photo de séjour', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'bonnes_adresses':
        return { label: 'Bonne adresse', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: 'Publication', bg: 'bg-gray-50 text-gray-800 border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      {/* Community Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
                <Users size={14} />
                <span>Communauté Tourisme Sénégal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
                Échangez & Préparez votre voyage au Sénégal
              </h1>
              <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                Partagez vos retours d'expérience authentiques, posez vos questions, découvrez les conseils locaux et recommandez de bonnes adresses par destination touristique.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (!currentUser && onNavigateToAuth) {
                    onNavigateToAuth();
                  } else {
                    setShowCreateModal(true);
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Plus size={18} />
                <span>Publier une expérience</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-600" size={20} />
              <span className="text-xs font-bold sm:text-sm">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Destination Communities Horizontal Picker */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin size={18} className="text-emerald-600" />
                <span>Choisissez une Communauté par Destination</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Chaque région du Sénégal a son espace dédié pour regrouper ses conseils et retours.
              </p>
            </div>
            {selectedCommunityId !== 'all' && (
              <button
                onClick={() => setSelectedCommunityId('all')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors"
              >
                Voir toutes les destinations
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCommunityId('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                selectedCommunityId === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Users size={14} />
              <span>Toutes les Communautés</span>
            </button>

            {communities.map(comm => {
              const isSelected = selectedCommunityId === comm.id;
              return (
                <button
                  key={comm.id}
                  onClick={() => setSelectedCommunityId(comm.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200'
                  }`}
                >
                  <MapPin size={13} className={isSelected ? 'text-emerald-300' : 'text-slate-400'} />
                  <span>{comm.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'}`}>
                    {comm.postsCount || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Community Active Info Header (If a specific community is chosen) */}
        {currentCommunity && (
          <div className="relative rounded-2xl overflow-hidden mb-8 border border-slate-200 shadow-sm bg-white">
            <div className="h-40 sm:h-48 w-full relative">
              <img 
                src={currentCommunity.coverImage} 
                alt={currentCommunity.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-600/90 text-white px-2.5 py-1 rounded-md mb-2 backdrop-blur-sm">
                  <MapPin size={12} />
                  <span>{currentCommunity.region}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                  Communauté {currentCommunity.name}
                </h2>
                <p className="text-slate-200 text-xs sm:text-sm mt-1 max-w-3xl line-clamp-2">
                  {currentCommunity.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar & Category Filters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Left Column: Search & Categories */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Search Box */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <label className="block text-xs font-bold text-slate-900 mb-2">Recherche interne</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Lieu, activité, mot-clé..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 placeholder-slate-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Category Navigation */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Filter size={14} className="text-emerald-600" />
                <span>Catégories</span>
              </h3>

              <div className="space-y-1">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-100'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={15} className={isSelected ? 'text-emerald-600' : 'text-slate-400'} />
                        <span>{cat.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Community Guidelines Banner */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-amber-900">
              <div className="flex items-start gap-2.5">
                <Sparkles className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-amber-950">Esprit de la Teranga</h4>
                  <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                    Partagez des contenus bienveillants et constructifs pour aider les futurs voyageurs à préparer sereinement leur séjour.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Feed of Publications */}
          <div className="lg:col-span-3">
            
            {/* Header Feed status */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-600">
                {posts.length} publication{posts.length > 1 ? 's' : ''} trouvée{posts.length > 1 ? 's' : ''}
              </div>
              <button
                onClick={() => {
                  if (!currentUser && onNavigateToAuth) {
                    onNavigateToAuth();
                  } else {
                    setShowCreateModal(true);
                  }
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Nouveau message</span>
              </button>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-16 bg-slate-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              /* Empty state */
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80 shadow-sm">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Aucune publication dans cette catégorie</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Soyez le premier voyageur à partager un conseil ou un retour d'expérience pour cette destination.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Ajouter une publication</span>
                </button>
              </div>
            ) : (
              /* Posts Feed Cards */
              <div className="space-y-5">
                {posts.map(post => {
                  const badge = getCategoryBadge(post.category);
                  const isAuthorPro = post.authorRole === 'professional';
                  
                  return (
                    <article 
                      key={post.id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all relative group"
                    >
                      {/* Top Header: Author & Category Badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold ${isAuthorPro ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-200'}`}>
                            {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{post.authorName}</span>
                              {isAuthorPro && (
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                                  Pro / Guide
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span>{new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-800">{post.destination}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                        {post.title}
                      </h3>

                      {/* Content */}
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line mb-4">
                        {post.content}
                      </p>

                      {/* Optional Location Spot Badge */}
                      {post.locationSpot && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg mb-4 border border-slate-200/60">
                          <MapPin size={13} className="text-rose-500" />
                          <span>Lieu cité : <strong>{post.locationSpot}</strong></span>
                        </div>
                      )}

                      {/* Optional Photo Image Attachment */}
                      {post.imageUrl && (
                        <div className="rounded-xl overflow-hidden mb-4 max-h-80 border border-slate-200">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          {/* Like Button */}
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center gap-1.5 font-semibold hover:text-emerald-700 transition-colors cursor-pointer group/btn"
                          >
                            <ThumbsUp size={15} className="group-hover/btn:scale-110 transition-transform text-slate-400 group-hover/btn:text-emerald-600" />
                            <span>{post.likesCount || 0} J'aime</span>
                          </button>

                          {/* Share button */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              alert('Lien de la publication copié dans le presse-papier !');
                            }}
                            className="flex items-center gap-1 font-semibold hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            <Share2 size={14} />
                            <span>Partager</span>
                          </button>
                        </div>

                        {/* Report button */}
                        <button
                          onClick={() => setReportingPostId(post.id)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Signaler ce contenu à l'administration"
                        >
                          <Flag size={13} />
                          <span className="hidden sm:inline">Signaler</span>
                        </button>
                      </div>

                    </article>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Nouvelle Publication</h3>
                  <p className="text-xs text-slate-500">Partagez votre avis ou vos conseils sur le Sénégal</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              {/* Destination Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Destination concernée *</label>
                <select
                  value={postDestination}
                  onChange={(e) => setPostDestination(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                >
                  <option value="Casamance">Casamance</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                  <option value="Sine Saloum">Sine Saloum</option>
                  <option value="Kédougou">Kédougou</option>
                  <option value="Cap Skirring">Cap Skirring</option>
                  <option value="Île de Gorée">Île de Gorée</option>
                  <option value="Lac Rose">Lac Rose</option>
                  <option value="Parc National du Niokolo-Koba">Parc National du Niokolo-Koba</option>
                </select>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Catégorie de publication *</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as CommunityPostCategory)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold"
                  required
                >
                  <option value="retours_experience">Retour d'expérience (Récit de séjour)</option>
                  <option value="conseils">Conseils pratiques aux voyageurs</option>
                  <option value="questions">Question / Demande d'information</option>
                  <option value="photos">Photos de séjour</option>
                  <option value="bonnes_adresses">Bonne adresse (Restaurant, Marché, Artisan...)</option>
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Titre de votre publication *</label>
                <input
                  type="text"
                  placeholder="Ex: Mon avis sur la balade en pirogue à Fadiouth..."
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">Description / Détails *</label>
                <textarea
                  rows={4}
                  placeholder="Racontez votre expérience, détaillez vos conseils ou posez clairement votre question..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  required
                ></textarea>
              </div>

              {/* Optional Location Spot */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Lieu / Adresse recommandée (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Resto Tante Mariama au Port, ou Plage d'Elinkine"
                  value={postLocationSpot}
                  onChange={(e) => setPostLocationSpot(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Optional Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Lien image / photo Unsplash (Optionnel)
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={postImageUrl}
                  onChange={(e) => setPostImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Publication...' : 'Publier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <AlertTriangle size={20} />
              <h3 className="text-base font-bold text-slate-900">Signaler cette publication</h3>
            </div>
            
            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="text-emerald-600 mx-auto" size={32} />
                <p className="text-xs font-bold text-slate-900">Signalement transmis !</p>
                <p className="text-[11px] text-slate-500">L'équipe d'administration va modérer cette publication.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Merci de préciser la raison du signalement. Notre équipe administrateur révisera ce contenu rapidement.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">Raison du signalement *</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-semibold"
                    required
                  >
                    <option value="">-- Choisissez un motif --</option>
                    <option value="Contenu inapproprié ou irrespectueux">Contenu inapproprié ou irrespectueux</option>
                    <option value="Spam ou publicité non autorisée">Spam ou publicité non autorisée</option>
                    <option value="Fausses informations sur la destination">Fausses informations sur la destination</option>
                    <option value="Hors sujet touristique">Hors sujet touristique</option>
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReportingPostId(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
                  >
                    Envoyer le signalement
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
