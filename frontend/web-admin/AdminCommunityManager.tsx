/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, CheckCircle, XCircle, Eye, Trash2, Plus, 
  MapPin, Flag, Search, Filter, RefreshCw, MessageSquare, Shield, Edit3, UserCheck, ShieldAlert
} from 'lucide-react';
import { Community, CommunityPost, CommunityPostCategory, User as UserType } from '../../shared/types';

export default function AdminCommunityManager() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'reported' | 'communities' | 'all_posts'>('reported');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCommunityFilter, setSelectedCommunityFilter] = useState<string>('all');

  // Create Community Modal State
  const [showCreateCommModal, setShowCreateCommModal] = useState<boolean>(false);
  const [commName, setCommName] = useState<string>('');
  const [commRegion, setCommRegion] = useState<string>('');
  const [commDescription, setCommDescription] = useState<string>('');
  const [commCoverImage, setCommCoverImage] = useState<string>('');
  const [commActive, setCommActive] = useState<boolean>(true);
  const [submittingComm, setSubmittingComm] = useState<boolean>(false);

  // Author Detail Modal State
  const [inspectAuthorPost, setInspectAuthorPost] = useState<CommunityPost | null>(null);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const commRes = await fetch('/api/communities');
      if (commRes.ok) {
        setCommunities(await commRes.json());
      }

      const postsRes = await fetch('/api/community-posts?status=all');
      if (postsRes.ok) {
        setPosts(await postsRes.json());
      }
    } catch (err) {
      console.error('Error fetching admin community data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Create Community
  const handleCreateCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commName.trim() || !commRegion.trim()) return;

    setSubmittingComm(true);
    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: commName,
          region: commRegion,
          description: commDescription,
          coverImage: commCoverImage || 'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=1200&q=80',
          active: commActive
        }),
      });

      if (res.ok) {
        alert(`La communauté "${commName}" a été créée avec succès !`);
        setCommName('');
        setCommRegion('');
        setCommDescription('');
        setCommCoverImage('');
        setShowCreateCommModal(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to create community:', err);
    } finally {
      setSubmittingComm(false);
    }
  };

  // Toggle Community Status
  const handleToggleCommunityStatus = async (comm: Community) => {
    try {
      const res = await fetch(`/api/communities/${comm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !comm.active }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Failed to toggle community active status:', err);
    }
  };

  // Moderation Decision on Post
  const handleModerationAction = async (postId: string, action: 'keep' | 'mask' | 'delete') => {
    try {
      if (action === 'keep') {
        // Clear report and ensure active status
        const res = await fetch(`/api/community-posts/${postId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'active', clearReport: true }),
        });
        if (res.ok) {
          alert('Publication conservée. Le signalement a été levé.');
          await fetchData();
        }
      } else if (action === 'mask') {
        const res = await fetch(`/api/community-posts/${postId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'masked' }),
        });
        if (res.ok) {
          alert('La publication a été masquée du flux public.');
          await fetchData();
        }
      } else if (action === 'delete') {
        if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement cette publication ?')) return;
        const res = await fetch(`/api/community-posts/${postId}`, { method: 'DELETE' });
        if (res.ok) {
          alert('Publication supprimée définitivement.');
          await fetchData();
        }
      }
    } catch (err) {
      console.error('Failed to execute moderation action:', err);
    }
  };

  // Stats calculation
  const reportedPosts = posts.filter(p => p.reported && p.status !== 'deleted');
  const activePostsCount = posts.filter(p => p.status === 'active').length;

  // Find most active community
  const communityCounts = communities.map(c => ({
    ...c,
    count: posts.filter(p => (p.communityId === c.id || p.destination.toLowerCase() === c.name.toLowerCase()) && p.status === 'active').length
  }));
  communityCounts.sort((a, b) => b.count - a.count);
  const mostActiveComm = communityCounts[0];

  // Filtered posts list
  const filteredPosts = posts.filter(p => {
    if (activeTab === 'reported' && !p.reported) return false;
    if (selectedCommunityFilter !== 'all' && p.communityId !== selectedCommunityFilter && p.destination !== selectedCommunityFilter) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-950 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-800/60 uppercase tracking-wider mb-2">
            <Users size={14} />
            <span>Gestion & Modération des Communautés</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
            Espace d'Administration des Communautés
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Créez et organisez les communautés touristiques par destination, surveillez les contenus partagés et traitez les signalements des voyageurs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateCommModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Nouvelle Communauté</span>
          </button>
          <button
            onClick={fetchData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-xl transition-colors cursor-pointer"
            title="Actualiser les données"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Communautés</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{communities.length}</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              {communities.filter(c => c.active).length} actives sur la plateforme
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
            <MapPin size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Publications Actives</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{activePostsCount}</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Contenus générés par utilisateurs</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center font-bold">
            <MessageSquare size={22} />
          </div>
        </div>

        <div className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between ${reportedPosts.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-white border-slate-200/80'}`}>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block text-slate-600">Signalements</span>
            <span className={`text-2xl font-black mt-1 block ${reportedPosts.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {reportedPosts.length}
            </span>
            <span className="text-[11px] font-semibold mt-1 block text-slate-600">
              {reportedPosts.length > 0 ? 'Action de modération requise' : 'Aucun contenu en attente'}
            </span>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${reportedPosts.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
            <AlertTriangle size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Destination Populaire</span>
            <span className="text-lg font-black text-slate-900 mt-1 block truncate max-w-[140px]">
              {mostActiveComm ? mostActiveComm.name : 'Sénégal'}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">
              {mostActiveComm ? `${mostActiveComm.count} publications` : '0 publications'}
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center font-bold">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('reported')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'reported'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle size={15} />
          <span>Signalements {reportedPosts.length > 0 && `(${reportedPosts.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('communities')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'communities'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin size={15} />
          <span>Liste des Communautés ({communities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('all_posts')}
          className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'all_posts'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare size={15} />
          <span>Toutes les Publications ({posts.length})</span>
        </button>
      </div>

      {/* TAB 1: SIGNALEMENTS & MODERATION */}
      {activeTab === 'reported' && (
        <div className="space-y-4">
          {reportedPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm space-y-2">
              <CheckCircle className="text-emerald-600 mx-auto" size={32} />
              <h3 className="text-sm font-bold text-slate-900">Aucun signalement en attente</h3>
              <p className="text-xs text-slate-500">Toutes les publications respectent les règles de la communauté.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reportedPosts.map(post => (
                <div key={post.id} className="bg-rose-50/50 border border-rose-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-200/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                      <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                      <span>Motif du signalement : <strong className="underline">{post.reportReason || 'Contenu inapproprié'}</strong></span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                      <span>Auteur : {post.authorName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-emerald-800">Destination : {post.destination}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{post.title}</h4>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{post.content}</p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-rose-200/60">
                    <button
                      onClick={() => setInspectAuthorPost(post)}
                      className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck size={14} />
                      <span>Consulter profil auteur</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleModerationAction(post.id, 'keep')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle size={14} />
                        <span>Conserver (Valider)</span>
                      </button>
                      <button
                        onClick={() => handleModerationAction(post.id, 'mask')}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>Masquer</span>
                      </button>
                      <button
                        onClick={() => handleModerationAction(post.id, 'delete')}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LISTE DES COMMUNAUTES */}
      {activeTab === 'communities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communities.map(comm => (
              <div key={comm.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-32 w-full relative">
                    <img src={comm.coverImage} alt={comm.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleCommunityStatus(comm)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer shadow-sm ${
                          comm.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {comm.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                      {comm.region}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{comm.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{comm.description}</p>
                  </div>
                </div>

                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>{comm.postsCount || 0} publication(s)</span>
                  <button
                    onClick={() => handleToggleCommunityStatus(comm)}
                    className="text-emerald-700 hover:underline cursor-pointer"
                  >
                    {comm.active ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TOUTES LES PUBLICATIONS */}
      {activeTab === 'all_posts' && (
        <div className="space-y-4">
          
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Rechercher une publication par titre, contenu ou auteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={selectedCommunityFilter}
              onChange={(e) => setSelectedCommunityFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="all">Toutes les destinations</option>
              {communities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* List of posts table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-3.5">Titre / Description</th>
                    <th className="p-3.5">Auteur</th>
                    <th className="p-3.5">Destination</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions Modération</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredPosts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                        <div className="text-slate-500 line-clamp-1 text-[11px] mt-0.5">{post.content}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {post.authorName}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-800">
                        {post.destination}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          post.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {post.status}
                        </span>
                        {post.reported && (
                          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-800">
                            Signalé
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setInspectAuthorPost(post)}
                          className="text-slate-600 hover:text-slate-900 font-bold text-[11px] cursor-pointer"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => handleModerationAction(post.id, post.status === 'active' ? 'mask' : 'keep')}
                          className="text-amber-700 hover:text-amber-800 font-bold text-[11px] cursor-pointer"
                        >
                          {post.status === 'active' ? 'Masquer' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleModerationAction(post.id, 'delete')}
                          className="text-rose-600 hover:text-rose-800 font-bold text-[11px] cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* CREATE COMMUNITY MODAL */}
      {showCreateCommModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Créer une nouvelle Communauté</h3>
              <button onClick={() => setShowCreateCommModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCommunitySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Nom de la Destination *</label>
                <input
                  type="text"
                  placeholder="Ex: Parc National du Niokolo-Koba"
                  value={commName}
                  onChange={(e) => setCommName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Région associée *</label>
                <input
                  type="text"
                  placeholder="Ex: Sénégal Oriental"
                  value={commRegion}
                  onChange={(e) => setCommRegion(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Description *</label>
                <textarea
                  rows={3}
                  placeholder="Description de la communauté pour guider les touristes..."
                  value={commDescription}
                  onChange={(e) => setCommDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">Image de couverture (URL Unsplash)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={commCoverImage}
                  onChange={(e) => setCommCoverImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCommCheck"
                  checked={commActive}
                  onChange={(e) => setCommActive(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="activeCommCheck" className="text-xs font-bold text-slate-900">
                  Activer immédiatement cette communauté dans l'application Touriste
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateCommModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submittingComm}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
                >
                  {submittingComm ? 'Création...' : 'Créer la Communauté'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTHOR DOSSIER MODAL */}
      {inspectAuthorPost && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="text-emerald-600" size={20} />
                <h3 className="text-base font-bold text-slate-900">Dossier Auteur / Modération</h3>
              </div>
              <button onClick={() => setInspectAuthorPost(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={18} />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div>
                <span className="font-bold text-slate-500">Nom complet : </span>
                <span className="font-extrabold text-slate-900">{inspectAuthorPost.authorName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Rôle : </span>
                <span className="font-bold text-emerald-800 capitalize">{inspectAuthorPost.authorRole || 'Touriste'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">ID de l'auteur : </span>
                <span className="font-mono text-slate-700">{inspectAuthorPost.authorId}</span>
              </div>
              <div>
                <span className="font-bold text-slate-500">Historique publication récente : </span>
                <p className="mt-1 p-2 bg-white rounded-xl border border-slate-200 text-slate-800 font-medium italic">
                  "{inspectAuthorPost.title}"
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setInspectAuthorPost(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl"
              >
                Fermer le dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
