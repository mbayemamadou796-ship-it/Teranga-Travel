/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn, ChevronRight, ShieldCheck, Sparkles, AlertCircle, CheckCircle2, Info, ArrowLeft, X } from 'lucide-react';
import { TerangaLogo } from '../../shared/ui/TerangaLogo';
import { User as UserType, SenegalDestination } from '../../shared/types';

interface AuthEntryGatewayProps {
  onLoginSuccess: (user: UserType, recommendedPortal?: string) => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthEntryGateway({ 
  onLoginSuccess, 
  onClose,
  initialMode = 'login'
}: AuthEntryGatewayProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regType, setRegType] = useState<'tourist' | 'host' | 'agency' | 'guide'>('tourist');
  const [regEstName, setRegEstName] = useState('');
  const [regLocation, setRegLocation] = useState<SenegalDestination>('Dakar');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Identifiant ou mot de passe incorrect.');
      }

      localStorage.setItem('teranga_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.recommendedPortal);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickId: string, quickPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: quickId, password: quickPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur de connexion');
      }
      localStorage.setItem('teranga_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.recommendedPortal);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regType === 'tourist' ? 'tourist' : 'professional',
          userType: regType,
          establishmentName: regEstName,
          establishmentLocation: regLocation,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription.');
      }

      setRegSuccessMsg(data.message || 'Compte créé avec succès !');
      localStorage.setItem('teranga_user', JSON.stringify(data.user));
      setTimeout(() => {
        onLoginSuccess(data.user, data.recommendedPortal);
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#003822] bg-radial from-[#004d2f] via-[#003822] to-[#002214] flex flex-col justify-center items-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Subtle background circles for depth */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Auth Card matching image.png */}
      <div className="bg-white rounded-[32px] sm:rounded-[36px] shadow-2xl border border-emerald-950/10 p-6 sm:p-8 max-w-[430px] w-full relative z-10 animate-fade-in space-y-6 my-auto">
        
        {/* Optional close / back to showcase button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Retour à la vitrine publique"
          >
            <X size={18} />
          </button>
        )}
        
        {/* Top Logo Emblem with green/lime gradient border like image.png */}
        <div className="flex flex-col items-center text-center">
          <div className="relative p-1 rounded-full bg-gradient-to-tr from-lime-400 via-emerald-400 to-green-600 shadow-xl shadow-emerald-600/20 mb-3">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white flex items-center justify-center p-2 border-2 border-white shadow-inner overflow-hidden">
              <TerangaLogo size={58} showText={false} />
            </div>
          </div>

          {/* Brand Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-1.5 justify-center">
            <span>Teranga</span>
            <span className="text-emerald-600">Travel</span>
          </h1>

          {/* Pill Badge */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[11px] font-semibold shadow-xs">
            <span>🇸🇳</span>
            <span>Au cœur de l'hospitalité et du voyage sénégalais !</span>
          </div>

          {/* Section Heading */}
          <div className="mt-5 space-y-1">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              {mode === 'login' ? "Espace d'Authentification" : "Création de Compte"}
            </h2>
            <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto">
              {mode === 'login' 
                ? "Connectez-vous pour accéder à la plateforme et à vos fonctionnalités personnalisées"
                : "Rejoignez Teranga Travel en tant que voyageur ou professionnel du tourisme"}
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs (Connexion / Inscription) */}
        <div className="flex bg-gray-100/80 p-1 rounded-2xl text-xs font-bold text-gray-600">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'login' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer text-center ${
              mode === 'register' ? 'bg-white text-emerald-700 shadow-xs' : 'hover:text-gray-900'
            }`}
          >
            S'inscrire
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {regSuccessMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{regSuccessMsg}</span>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Field: Identifiant * */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-800">
                Identifiant <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-2xl border border-gray-200 bg-white hover:border-gray-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ex: admin ou utilisateur"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Field: Mot de passe * */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-gray-800">
                Mot de passe <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-2xl border border-gray-200 bg-white hover:border-gray-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button with lime-green gradient like image.png */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-lime-500 hover:from-emerald-600 hover:to-lime-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              <LogIn size={18} />
              <span>{loading ? "Connexion en cours..." : "Se connecter"}</span>
            </button>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5 text-left">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800">Nom Complet *</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex. Fatou Diop"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800">Adresse E-mail *</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="nom@exemple.sn"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800">Mot de passe *</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Profile Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800">Profil & Espace Métier</label>
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setRegType('tourist')}
                  className={`p-2 rounded-xl text-left border text-xs font-medium cursor-pointer transition-all ${
                    regType === 'tourist' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>👤</span>
                    <div>
                      <div className="text-[11px]">Voyageur</div>
                      <div className="text-[9px] text-emerald-600">Accès direct</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegType('host')}
                  className={`p-2 rounded-xl text-left border text-xs font-medium cursor-pointer transition-all ${
                    regType === 'host' 
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🏨</span>
                    <div>
                      <div className="text-[11px]">Hébergeur</div>
                      <div className="text-[9px] text-gray-400">Hôtel/Lodge</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegType('agency')}
                  className={`p-2 rounded-xl text-left border text-xs font-medium cursor-pointer transition-all ${
                    regType === 'agency' 
                      ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🚀</span>
                    <div>
                      <div className="text-[11px]">Agence</div>
                      <div className="text-[9px] text-amber-700">Circuits</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRegType('guide')}
                  className={`p-2 rounded-xl text-left border text-xs font-medium cursor-pointer transition-all ${
                    regType === 'guide' 
                      ? 'bg-amber-50 border-amber-600 text-amber-950 font-bold' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span>🧭</span>
                    <div>
                      <div className="text-[11px]">Guide</div>
                      <div className="text-[9px] text-amber-800">Agréé</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Establishment Name if Pro */}
            {regType !== 'tourist' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-gray-700">
                  {regType === 'host' ? "Nom de l'hôtel / hébergement" : regType === 'agency' ? "Nom de l'agence de voyage" : "Intitulé guide & spécialité"}
                </label>
                <input
                  type="text"
                  value={regEstName}
                  onChange={(e) => setRegEstName(e.target.value)}
                  placeholder={regType === 'host' ? "Ex: Campement du Bolong" : regType === 'agency' ? "Ex: Casamance Découverte" : "Ex: Guide National Dakar"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-600 hover:from-emerald-700 hover:to-lime-700 active:scale-[0.99] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 mt-2"
            >
              <span>{loading ? "Création en cours..." : "Créer mon compte"}</span>
            </button>
          </form>
        )}

        {/* 1-Click Fast Evaluation Accounts */}
        <div className="pt-3 border-t border-gray-100 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" />
              Accès démo rapide (1-clic) :
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('tourist@teranga.sn', 'tourist')}
              className="w-full bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/60 text-emerald-950 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>👤 <b>Fatou Diop</b> (Voyageur / Touriste)</span>
              </span>
              <ChevronRight size={12} className="text-emerald-700" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('professional@teranga.sn', 'professional')}
              className="w-full bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200/60 text-emerald-950 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-700"></span>
                <span>🏨 <b>Cheikh Ndiaye</b> (Hébergeur Dakar)</span>
              </span>
              <ChevronRight size={12} className="text-emerald-700" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('agency_casamance@teranga.sn', 'agency')}
              className="w-full bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 text-amber-950 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>🚀 <b>Lamine Sané</b> (Agence Casamance)</span>
              </span>
              <ChevronRight size={12} className="text-amber-700" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('guide_dakar@teranga.sn', 'guide')}
              className="w-full bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200/60 text-amber-950 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-700"></span>
                <span>🧭 <b>Abdoulaye Ndiaye</b> (Guide Dakar)</span>
              </span>
              <ChevronRight size={12} className="text-amber-700" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@teranga.sn', 'admin')}
              className="w-full bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200/60 text-blue-950 px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-between transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>🛡️ <b>Modou Sow</b> (Administrateur SYSOP)</span>
              </span>
              <ChevronRight size={12} className="text-blue-700" />
            </button>
          </div>
        </div>

        {/* Footer info matching image.png */}
        <div className="pt-2 text-center border-t border-gray-100">
          <p className="text-[11px] text-gray-400 font-medium">
            Système sécurisé Teranga Travel • v1.0 MVP
          </p>
        </div>

      </div>

    </div>
  );
}
