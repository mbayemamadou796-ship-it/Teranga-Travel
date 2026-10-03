/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DESTINATIONS, INITIAL_ESTABLISHMENTS, INITIAL_OFFERS, INITIAL_REVIEWS, INITIAL_COMMUNITIES, INITIAL_COMMUNITY_POSTS } from './data';
import { 
  User, Establishment, Offer, Booking, Review, Message, ItineraryRequest, SenegalDestination, 
  Community, CommunityPost, TravelBooking, BookingItem, Notification, AuditLog 
} from '../shared/types';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(express.json());

// Lazy-initialized Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('La clé API GEMINI_API_KEY n\'est pas configurée dans les secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Low DB Persistence helper
interface DatabaseSchema {
  users: User[];
  establishments: Establishment[];
  offers: Offer[];
  bookings: Booking[];
  travelBookings: TravelBooking[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  reviews: Review[];
  messages: Message[];
  communities: Community[];
  communityPosts: CommunityPost[];
}

function loadDatabase(): DatabaseSchema {
  // Generate initial DB with mock accounts including agencies
  const defaultUsers: User[] = [
    {
      id: 'user_tourist_1',
      email: 'tourist@teranga.sn',
      password: 'tourist',
      name: 'Fatou Diop',
      role: 'tourist',
    },
    {
      id: 'user_prof_dakar',
      email: 'professional@teranga.sn',
      password: 'professional',
      name: 'Cheikh Ndiaye',
      role: 'professional',
      establishmentId: 'est_1',
    },
    {
      id: 'user_prof_saloum',
      email: 'saloum@teranga.sn',
      password: 'saloum',
      name: 'Babacar Faye',
      role: 'professional',
      establishmentId: 'est_2',
    },
    {
      id: 'user_admin_1',
      email: 'admin@teranga.sn',
      password: 'admin',
      name: 'Modou Sow',
      role: 'admin',
    },
    {
      id: 'user_agency_dakar',
      email: 'agency_dakar@teranga.sn',
      password: 'agency',
      name: 'Moussa Gueye',
      role: 'professional',
      establishmentId: 'est_agence_1',
    },
    {
      id: 'user_agency_saloum',
      email: 'agency_saloum@teranga.sn',
      password: 'agency',
      name: 'Safiétou Diallo',
      role: 'professional',
      establishmentId: 'est_agence_2',
    },
    {
      id: 'user_agency_casamance',
      email: 'agency_casamance@teranga.sn',
      password: 'agency',
      name: 'Lamine Sané',
      role: 'professional',
      establishmentId: 'est_agence_3',
    },
    {
      id: 'user_agency_stlouis',
      email: 'agency_stlouis@teranga.sn',
      password: 'agency',
      name: 'Awa Fall',
      role: 'professional',
      establishmentId: 'est_agence_4',
    },
    {
      id: 'user_agency_kedougou',
      email: 'agency_kedougou@teranga.sn',
      password: 'agency',
      name: 'Ousmane Cissokho',
      role: 'professional',
      establishmentId: 'est_agence_5',
    },
    {
      id: 'user_guide_dakar',
      email: 'guide_dakar@teranga.sn',
      password: 'guide',
      name: 'Abdoulaye Ndiaye',
      role: 'professional',
      establishmentId: 'est_guide_1',
    },
    {
      id: 'user_guide_saloum',
      email: 'guide_saloum@teranga.sn',
      password: 'guide',
      name: 'Bamba Diouf',
      role: 'professional',
      establishmentId: 'est_guide_2',
    },
    {
      id: 'user_guide_kedougou',
      email: 'guide_kedougou@teranga.sn',
      password: 'guide',
      name: 'Samba Diallo',
      role: 'professional',
      establishmentId: 'est_guide_3',
    }
  ];

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const db = JSON.parse(content);
      
      // Merge missing default users
      let changed = false;
      defaultUsers.forEach(du => {
        if (!db.users.some((u: any) => u.email.toLowerCase() === du.email.toLowerCase())) {
          db.users.push(du);
          changed = true;
        }
      });

      // Merge missing establishments from INITIAL_ESTABLISHMENTS
      INITIAL_ESTABLISHMENTS.forEach(ie => {
        if (!db.establishments.some((e: any) => e.id === ie.id)) {
          db.establishments.push(ie);
          changed = true;
        }
      });

      // Merge missing offers from INITIAL_OFFERS
      INITIAL_OFFERS.forEach(io => {
        if (!db.offers.some((o: any) => o.id === io.id)) {
          db.offers.push(io);
          changed = true;
        }
      });

      // Ensure messages array exists
      if (!db.messages) {
        db.messages = [
          {
            id: 'msg_1',
            senderId: 'user_prof_dakar',
            senderName: 'Cheikh Ndiaye (Hôtel Teranga Dakar)',
            senderEmail: 'professional@teranga.sn',
            senderRole: 'professional',
            recipientId: 'user_tourist_1',
            recipientName: 'Fatou Diop',
            recipientEmail: 'tourist@teranga.sn',
            content: 'Bonjour Fatou ! Bienvenue sur la plateforme Teranga Travel. N’hésitez pas à me poser vos questions sur vos séjours à Dakar.',
            createdAt: new Date().toISOString(),
            read: true,
          },
          {
            id: 'msg_2',
            senderId: 'user_agency_casamance',
            senderName: 'Lamine Sané (Ecovoyages Casamance)',
            senderEmail: 'agency_casamance@teranga.sn',
            senderRole: 'professional',
            recipientId: 'user_tourist_1',
            recipientName: 'Fatou Diop',
            recipientEmail: 'tourist@teranga.sn',
            content: 'Dalal Ak Jamm Fatou ! Nos pirogues traditionnelles en Casamance sont disponibles pour votre prochain circuit.',
            createdAt: new Date().toISOString(),
            read: false,
          }
        ];
        changed = true;
      }

      // Ensure communities array exists and seed missing items
      if (!db.communities || db.communities.length === 0) {
        db.communities = INITIAL_COMMUNITIES;
        changed = true;
      } else {
        INITIAL_COMMUNITIES.forEach(ic => {
          if (!db.communities.some((c: any) => c.id === ic.id)) {
            db.communities.push(ic);
            changed = true;
          }
        });
      }

      // Ensure communityPosts array exists and seed missing items
      if (!db.communityPosts || db.communityPosts.length === 0) {
        db.communityPosts = INITIAL_COMMUNITY_POSTS;
        changed = true;
      } else {
        INITIAL_COMMUNITY_POSTS.forEach(ip => {
          if (!db.communityPosts.some((p: any) => p.id === ip.id)) {
            db.communityPosts.push(ip);
            changed = true;
          }
        });
      }

      // Ensure travelBookings array exists and seed reference cases
      if (!db.travelBookings || db.travelBookings.length === 0) {
        db.travelBookings = [
          {
            id: 'tb_ref_completed',
            reference: 'TT-2026-8F4K2',
            userId: 'user_tourist_1',
            travelerName: 'Fatou Diop',
            travelerEmail: 'tourist@teranga.sn',
            travelerPhone: '+221 77 123 45 67',
            destination: 'Casamance',
            checkIn: '2026-12-15',
            checkOut: '2026-12-20',
            guestsCount: 2,
            message: 'Nous souhaitions découvrir les villages Diolas et la forêt sacrée.',
            totalPrice: 240000,
            status: 'COMPLETED',
            createdAt: '2026-12-01',
            items: [
              {
                id: 'item_ref_acc',
                bookingId: 'tb_ref_completed',
                type: 'ACCOMMODATION',
                providerId: 'est_1',
                providerName: 'Hôtel Teranga & Spa Almadies',
                providerOwnerId: 'user_prof_dakar',
                offerId: 'off_1',
                offerTitle: 'Suite Junior Vue Océan & Balcon Private',
                price: 150000,
                details: {
                  roomType: 'Suite Junior Océan',
                  nightsCount: 5,
                },
                status: 'COMPLETED',
                checkInDate: '2026-12-15',
                completedAt: '2026-12-20',
                reviewSubmitted: true,
              },
              {
                id: 'item_ref_guide',
                bookingId: 'tb_ref_completed',
                type: 'GUIDE',
                providerId: 'est_guide_2',
                providerName: 'Awa Sané - Guide Écotourisme & Nature Casamance',
                providerOwnerId: 'user_guide_awa',
                offerId: 'off_guide2_1',
                offerTitle: 'Journée Immersion Botanique & Culturelle en Casamance',
                price: 90000,
                details: {
                  guideName: 'Awa Sané',
                  durationDays: 5,
                  languages: ['Français', 'Wolof', 'Diola'],
                  specialty: 'Culture & Nature',
                },
                status: 'COMPLETED',
                checkInDate: '2026-12-15',
                completedAt: '2026-12-20',
                reviewSubmitted: true,
              }
            ]
          },
          {
            id: 'tb_ref_pending',
            reference: 'TT-2026-3N8V7',
            userId: 'user_tourist_1',
            travelerName: 'Fatou Diop',
            travelerEmail: 'tourist@teranga.sn',
            travelerPhone: '+221 77 123 45 67',
            destination: 'Sine Saloum',
            checkIn: '2027-01-10',
            checkOut: '2027-01-14',
            guestsCount: 2,
            message: 'Observation des oiseaux et balade en pirogue dans les bolongs.',
            totalPrice: 175000,
            status: 'PENDING',
            createdAt: '2026-12-28',
            items: [
              {
                id: 'item_pending_acc',
                bookingId: 'tb_ref_pending',
                type: 'ACCOMMODATION',
                providerId: 'est_2',
                providerName: 'Ecolodge du Saloum',
                providerOwnerId: 'user_prof_saloum',
                offerId: 'off_2',
                offerTitle: 'Bungalow Traditionnel sur Pilotis',
                price: 100000,
                details: {
                  roomType: 'Bungalow Traditionnel Bolong',
                  nightsCount: 4,
                },
                status: 'PENDING',
              },
              {
                id: 'item_pending_guide',
                bookingId: 'tb_ref_pending',
                type: 'GUIDE',
                providerId: 'est_agence_2',
                providerName: 'Saloum Eco-Aventures & Pirogues',
                providerOwnerId: 'user_agency_saloum',
                offerId: 'off_ag2_1',
                offerTitle: 'Excursion Pirogue Bolongs & Île aux Coquillages de Fadiouth',
                price: 75000,
                details: {
                  guideName: 'Safiétou Diallo',
                  durationDays: 3,
                  languages: ['Français', 'Wolof', 'Sérère'],
                  specialty: 'Ornithologie & Pirogue',
                },
                status: 'PENDING',
              }
            ]
          }
        ];
        changed = true;
      }

      if (!db.notifications || db.notifications.length === 0) {
        db.notifications = [
          {
            id: 'notif_init_1',
            recipientUserId: 'user_prof_saloum',
            title: 'Nouvelle demande d\'hébergement',
            message: 'Fatou Diop a envoyé une demande pour Bungalow Traditionnel du 10/01/2027 au 14/01/2027. Réf: TT-2026-3N8V7',
            type: 'booking_request',
            reference: 'TT-2026-3N8V7',
            read: false,
            createdAt: new Date().toISOString()
          },
          {
            id: 'notif_init_2',
            recipientUserId: 'user_agency_saloum',
            title: 'Nouvelle demande de guidage',
            message: 'Fatou Diop a sélectionné votre excursion en pirogue du 10/01/2027 au 14/01/2027. Réf: TT-2026-3N8V7',
            type: 'booking_request',
            reference: 'TT-2026-3N8V7',
            read: false,
            createdAt: new Date().toISOString()
          }
        ];
        changed = true;
      }

      if (!db.auditLogs || db.auditLogs.length === 0) {
        db.auditLogs = [
          {
            id: 'log_init_1',
            actorUserId: 'user_tourist_1',
            actorName: 'Fatou Diop',
            action: 'TOURIST_CREATED_BOOKING',
            entityType: 'TravelBooking',
            entityId: 'tb_ref_pending',
            summary: 'Création du dossier de voyage combiné TT-2026-3N8V7 (Ecolodge du Saloum + Saloum Eco-Aventures)',
            createdAt: new Date().toISOString()
          }
        ];
        changed = true;
      }

      // Seed verified reviews if not present
      if (!db.reviews.some(r => r.verified)) {
        db.reviews.push({
          id: 'rev_verified_1',
          establishmentId: 'est_1',
          bookingId: 'tb_ref_completed',
          bookingItemId: 'item_ref_acc',
          authorUserId: 'user_tourist_1',
          authorName: 'Fatou Diop',
          touristName: 'Fatou Diop',
          targetType: 'ACCOMMODATION',
          targetId: 'est_1',
          targetName: 'Hôtel Teranga & Spa Almadies',
          rating: 5,
          title: 'Accueil chaleureux et séjour inoubliable',
          comment: 'Très bon séjour, accueil chaleureux et personnel aux petits soins. La vue sur le coucher de soleil est magique !',
          verified: true,
          stayDate: 'Séjour effectué en décembre 2026',
          status: 'VISIBLE',
          createdAt: '2026-12-21'
        });
        db.reviews.push({
          id: 'rev_verified_2',
          establishmentId: 'est_guide_2',
          bookingId: 'tb_ref_completed',
          bookingItemId: 'item_ref_guide',
          authorUserId: 'user_tourist_1',
          authorName: 'Fatou Diop',
          touristName: 'Fatou Diop',
          targetType: 'GUIDE',
          targetId: 'est_guide_2',
          targetName: 'Awa Sané - Guide Écotourisme & Nature Casamance',
          rating: 5,
          title: 'Guide très disponible et passionnée',
          comment: 'Awa a été formidable du début à la fin. Elle nous a fait découvrir des villages Diolas authentiques avec un respect et une bienveillance remarquables.',
          verified: true,
          stayDate: 'Séjour effectué en décembre 2026',
          status: 'VISIBLE',
          createdAt: '2026-12-21'
        });
        changed = true;
      }

      if (changed) {
        saveDatabase(db);
      }
      return db;
    } catch (err) {
      console.error('Error reading database, resetting...', err);
    }
  }

  const defaultMessages: Message[] = [
    {
      id: 'msg_1',
      senderId: 'user_prof_dakar',
      senderName: 'Cheikh Ndiaye (Hôtel Teranga Dakar)',
      senderEmail: 'professional@teranga.sn',
      senderRole: 'professional',
      recipientId: 'user_tourist_1',
      recipientName: 'Fatou Diop',
      recipientEmail: 'tourist@teranga.sn',
      content: 'Bonjour Fatou ! Bienvenue sur la plateforme Teranga Travel. N’hésitez pas à me poser vos questions sur vos séjours à Dakar.',
      createdAt: new Date().toISOString(),
      read: true,
    },
    {
      id: 'msg_2',
      senderId: 'user_agency_casamance',
      senderName: 'Lamine Sané (Ecovoyages Casamance)',
      senderEmail: 'agency_casamance@teranga.sn',
      senderRole: 'professional',
      recipientId: 'user_tourist_1',
      recipientName: 'Fatou Diop',
      recipientEmail: 'tourist@teranga.sn',
      content: 'Dalal Ak Jamm Fatou ! Nos pirogues traditionnelles en Casamance sont disponibles pour votre prochain circuit.',
      createdAt: new Date().toISOString(),
      read: false,
    }
  ];

  const db: DatabaseSchema = {
    users: defaultUsers,
    establishments: INITIAL_ESTABLISHMENTS,
    offers: INITIAL_OFFERS,
    bookings: [],
    travelBookings: [],
    notifications: [],
    auditLogs: [],
    reviews: INITIAL_REVIEWS,
    messages: defaultMessages,
    communities: INITIAL_COMMUNITIES,
    communityPosts: INITIAL_COMMUNITY_POSTS,
  };

  saveDatabase(db);
  return db;
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database:', err);
  }
}

// API Routes
// 1. Authentication API
app.post('/api/auth/login', (req, res) => {
  const { email, identifier, password } = req.body;
  const rawId = (identifier || email || '').trim();
  if (!rawId) {
    return res.status(400).json({ error: 'Veuillez saisir votre identifiant ou adresse e-mail.' });
  }

  const db = loadDatabase();
  const lowerId = rawId.toLowerCase();

  // Search user by email or username or role keyword
  let user = db.users.find(u => u.email.toLowerCase() === lowerId);
  if (!user) {
    if (lowerId === 'admin' || lowerId === 'administrateur' || lowerId === 'modou') {
      user = db.users.find(u => u.role === 'admin');
    } else if (lowerId === 'tourist' || lowerId === 'touriste' || lowerId === 'voyageur' || lowerId === 'fatou' || lowerId === 'utilisateur') {
      user = db.users.find(u => u.email === 'tourist@teranga.sn') || db.users.find(u => u.role === 'tourist');
    } else if (lowerId === 'hebergeur' || lowerId === 'hotel' || lowerId === 'cheikh' || lowerId === 'hote') {
      user = db.users.find(u => u.email === 'professional@teranga.sn');
    } else if (lowerId === 'agency' || lowerId === 'agence' || lowerId === 'casamance' || lowerId === 'lamine') {
      user = db.users.find(u => u.email === 'agency_casamance@teranga.sn');
    } else if (lowerId === 'guide' || lowerId === 'abdoulaye') {
      user = db.users.find(u => u.email === 'guide_dakar@teranga.sn');
    } else {
      user = db.users.find(u => u.name.toLowerCase().includes(lowerId) || u.id.toLowerCase() === lowerId);
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Identifiant inconnu. Utilisez par exemple "admin", "touriste", "hebergeur", "agence", "guide" ou votre e-mail.' });
  }

  // Check password or quick evaluation shortcut for demo accounts
  const isDemoUser = user.email.toLowerCase().endsWith('@teranga.sn');
  const isMatch = user.password === password 
    || (isDemoUser && (
      !password || 
      password === 'tourist' || 
      password === 'professional' || 
      password === 'agency' || 
      password === 'guide' || 
      password === 'admin' ||
      password === 'password' ||
      password === '123456' ||
      password === 'test'
    ))
    || (password === 'professional' && user.role === 'professional')
    || (password === 'agency' && (user.password === 'agency' || user.email.includes('agency')))
    || (password === 'guide' && (user.password === 'guide' || user.email.includes('guide')));

  if (!isMatch) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }

  // Determine user establishment and recommended portal
  const userEst = db.establishments.find(e => e.ownerId === user.id || e.id === user.establishmentId);
  let recommendedPortal: 'tourist' | 'hebergeurs' | 'circuits_guides' | 'admin' = 'tourist';
  if (user.role === 'admin') {
    recommendedPortal = 'admin';
  } else if (user.role === 'professional') {
    if (userEst && ['agence', 'guide'].includes(userEst.type)) {
      recommendedPortal = 'circuits_guides';
    } else if (user.email.includes('agency') || user.email.includes('guide')) {
      recommendedPortal = 'circuits_guides';
    } else {
      recommendedPortal = 'hebergeurs';
    }
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ 
    user: userWithoutPassword,
    establishment: userEst || null,
    recommendedPortal
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role, userType, establishmentName, establishmentLocation } = req.body;
  const db = loadDatabase();

  if (!email || !name) {
    return res.status(400).json({ error: 'Veuillez remplir les informations requises.' });
  }

  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Cette adresse e-mail est déjà utilisée.' });
  }

  const effectiveRole = (role === 'admin' ? 'admin' : (role === 'professional' || userType === 'host' || userType === 'agency' || userType === 'guide') ? 'professional' : 'tourist');
  const isProfessional = effectiveRole === 'professional';

  let establishmentId: string | undefined = undefined;
  let newEst: Establishment | undefined = undefined;

  if (isProfessional) {
    const estType = userType === 'agency' ? 'agence' : userType === 'guide' ? 'guide' : 'hotel';
    establishmentId = `est_${Date.now()}`;
    newEst = {
      id: establishmentId,
      name: establishmentName || (estType === 'guide' ? `${name} - Guide Agréé` : estType === 'agence' ? `${name} Voyages` : `Établissement ${name}`),
      description: `Profil professionnel et prestations enregistrés sur la plateforme Teranga Travel. En attente de validation d'homologation d'État.`,
      location: establishmentLocation || 'Dakar',
      type: estType,
      ownerId: `user_${Date.now()}`,
      status: 'pending',
      images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'],
      rating: 5.0,
      amenities: ['Agrément en cours', 'Assurance Professionnelle', 'Accueil Teranga'],
      contactEmail: email.toLowerCase(),
      reviewsCount: 0
    };
    db.establishments.push(newEst);
  }

  const newUser: User = {
    id: isProfessional && newEst ? newEst.ownerId : `user_${Date.now()}`,
    email: email.toLowerCase(),
    password: password || 'teranga2025',
    name,
    role: effectiveRole,
    establishmentId,
    status: isProfessional ? 'pending' : 'active'
  };

  db.users.push(newUser);
  saveDatabase(db);

  let recommendedPortal: 'tourist' | 'hebergeurs' | 'circuits_guides' | 'admin' = 'tourist';
  if (effectiveRole === 'admin') recommendedPortal = 'admin';
  else if (userType === 'agency' || userType === 'guide') recommendedPortal = 'circuits_guides';
  else if (userType === 'host' || isProfessional) recommendedPortal = 'hebergeurs';

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ 
    user: userWithoutPassword,
    establishment: newEst || null,
    recommendedPortal,
    message: isProfessional 
      ? 'Votre compte professionnel a été créé avec succès et est en attente d\'agrément par l\'administrateur Teranga Travel.' 
      : 'Compte voyageur créé avec succès !'
  });
});

app.get('/api/auth/demo-accounts', (req, res) => {
  const db = loadDatabase();
  const demoAccounts = [
    {
      label: 'Fatou Diop',
      roleDescription: 'Voyageur / Touriste',
      portalLabel: 'Portail Touriste',
      email: 'tourist@teranga.sn',
      role: 'tourist',
      portal: 'tourist',
      badgeColor: 'emerald',
      avatar: 'FD',
      description: 'Découvrez et réservez des séjours, explorez le Sénégal'
    },
    {
      label: 'Cheikh Ndiaye',
      roleDescription: 'Hôtelier Dakar (Hôtel Teranga & Spa)',
      portalLabel: 'Portail Hébergeurs',
      email: 'professional@teranga.sn',
      role: 'professional',
      portal: 'hebergeurs',
      badgeColor: 'emerald',
      avatar: 'CN',
      description: 'Gérez vos chambres, disponibilités et réservations hôtelières'
    },
    {
      label: 'Lamine Sané',
      roleDescription: 'Agence Casamance Evasion',
      portalLabel: 'Portail Circuits & Guides',
      email: 'agency_casamance@teranga.sn',
      role: 'professional',
      portal: 'circuits_guides',
      badgeColor: 'amber',
      avatar: 'LS',
      description: 'Gérez vos circuits, départs et dossiers d\'inscriptions'
    },
    {
      label: 'Abdoulaye Ndiaye',
      roleDescription: 'Guide Professionnel Dakar & Gorée',
      portalLabel: 'Portail Circuits & Guides',
      email: 'guide_dakar@teranga.sn',
      role: 'professional',
      portal: 'circuits_guides',
      badgeColor: 'amber',
      avatar: 'AN',
      description: 'Gérez vos prestations de guidage, tarifs et disponibilités'
    },
    {
      label: 'Modou Sow',
      roleDescription: 'Administrateur Central (SYSOP)',
      portalLabel: 'Portail Administrateur',
      email: 'admin@teranga.sn',
      role: 'admin',
      portal: 'admin',
      badgeColor: 'blue',
      avatar: 'MS',
      description: 'Homologation d\'État, modération des offres et supervision'
    }
  ];
  res.json(demoAccounts);
});

app.get('/api/auth/users', (req, res) => {
  const db = loadDatabase();
  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.put('/api/auth/profile', (req, res) => {
  const { userId, name, email, phone, preferredRegion, bio, savedOfferIds } = req.body;
  const db = loadDatabase();

  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }

  const user = db.users[userIndex];
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (phone !== undefined) user.phone = phone;
  if (preferredRegion !== undefined) user.preferredRegion = preferredRegion;
  if (bio !== undefined) user.bio = bio;
  if (savedOfferIds !== undefined) user.savedOfferIds = savedOfferIds;

  saveDatabase(db);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Messaging API (Transversal)
app.get('/api/messages', (req, res) => {
  const { userId } = req.query;
  const db = loadDatabase();

  if (!db.messages) db.messages = [];

  if (!userId) {
    return res.json(db.messages);
  }

  // Filter messages involving the user
  const userMessages = db.messages.filter(
    m => m.senderId === userId || m.recipientId === userId
  );

  res.json(userMessages);
});

app.post('/api/messages', (req, res) => {
  const { senderId, recipientId, content } = req.body;
  const db = loadDatabase();

  if (!db.messages) db.messages = [];

  const sender = db.users.find(u => u.id === senderId);
  const recipient = db.users.find(u => u.id === recipientId);

  if (!sender || !recipient) {
    return res.status(404).json({ error: 'Expéditeur ou destinataire introuvable.' });
  }

  const newMessage: Message = {
    id: `msg_${Date.now()}`,
    senderId: sender.id,
    senderName: sender.name,
    senderEmail: sender.email,
    senderRole: sender.role,
    recipientId: recipient.id,
    recipientName: recipient.name,
    recipientEmail: recipient.email,
    content,
    createdAt: new Date().toISOString(),
    read: false,
  };

  db.messages.push(newMessage);
  saveDatabase(db);
  res.status(201).json(newMessage);
});

// ==================== COMMUNITIES API ==================== //

// Get all communities
app.get('/api/communities', (req, res) => {
  const db = loadDatabase();
  const { activeOnly } = req.query;
  let communities = db.communities || [];
  if (activeOnly === 'true') {
    communities = communities.filter(c => c.active);
  }
  
  // Calculate dynamic postsCount for each community
  const posts = db.communityPosts || [];
  const enriched = communities.map(comm => {
    const activePostsCount = posts.filter(p => (p.communityId === comm.id || p.destination.toLowerCase() === comm.name.toLowerCase()) && p.status === 'active').length;
    return { ...comm, postsCount: activePostsCount };
  });

  res.json(enriched);
});

// Admin: Create community
app.post('/api/communities', (req, res) => {
  const { name, region, description, coverImage, active } = req.body;
  const db = loadDatabase();
  if (!db.communities) db.communities = [];

  const newComm: Community = {
    id: `comm_${Date.now()}`,
    name: name || 'Nouvelle Destination',
    region: region || 'Sénégal',
    description: description || '',
    coverImage: coverImage || 'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=1200&q=80',
    active: active !== undefined ? active : true,
    postsCount: 0,
    createdAt: new Date().toISOString()
  };

  db.communities.push(newComm);
  saveDatabase(db);
  res.status(201).json(newComm);
});

// Admin: Update community
app.put('/api/communities/:id', (req, res) => {
  const { id } = req.params;
  const { name, region, description, coverImage, active } = req.body;
  const db = loadDatabase();
  if (!db.communities) db.communities = [];

  const comm = db.communities.find(c => c.id === id);
  if (!comm) {
    return res.status(404).json({ error: 'Communauté introuvable.' });
  }

  if (name !== undefined) comm.name = name;
  if (region !== undefined) comm.region = region;
  if (description !== undefined) comm.description = description;
  if (coverImage !== undefined) comm.coverImage = coverImage;
  if (active !== undefined) comm.active = active;

  saveDatabase(db);
  res.json(comm);
});

// ==================== COMMUNITY POSTS API ==================== //

// Get community posts with filters
app.get('/api/community-posts', (req, res) => {
  const db = loadDatabase();
  const { communityId, destination, category, search, reportedOnly, status } = req.query;
  let posts = db.communityPosts || [];

  if (reportedOnly === 'true') {
    posts = posts.filter(p => p.reported);
  } else if (status) {
    posts = posts.filter(p => p.status === status);
  } else {
    // Default for tourist app: only active posts
    posts = posts.filter(p => p.status === 'active');
  }

  if (communityId && communityId !== 'all') {
    posts = posts.filter(p => p.communityId === communityId);
  }

  if (destination && destination !== 'all') {
    posts = posts.filter(p => p.destination.toLowerCase() === (destination as string).toLowerCase());
  }

  if (category && category !== 'all') {
    posts = posts.filter(p => p.category === category);
  }

  if (search && typeof search === 'string' && search.trim().length > 0) {
    const q = search.toLowerCase().trim();
    posts = posts.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.authorName.toLowerCase().includes(q) ||
      (p.locationSpot && p.locationSpot.toLowerCase().includes(q))
    );
  }

  // Sort descending by creation date
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(posts);
});

// Create community post
app.post('/api/community-posts', (req, res) => {
  const { communityId, destination, authorId, authorName, authorRole, title, content, category, imageUrl, locationSpot } = req.body;
  const db = loadDatabase();
  if (!db.communityPosts) db.communityPosts = [];

  const newPost: CommunityPost = {
    id: `post_${Date.now()}`,
    communityId: communityId || 'comm_dakar',
    destination: destination || 'Dakar',
    authorId: authorId || 'guest',
    authorName: authorName || 'Voyageur Anonyme',
    authorRole: authorRole || 'tourist',
    title,
    content,
    category: category || 'retours_experience',
    imageUrl: imageUrl || undefined,
    locationSpot: locationSpot || undefined,
    likesCount: 0,
    reported: false,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  db.communityPosts.unshift(newPost);
  saveDatabase(db);
  res.status(201).json(newPost);
});

// Like / Toggle Like a post
app.post('/api/community-posts/:id/like', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  if (!db.communityPosts) db.communityPosts = [];

  const post = db.communityPosts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Publication introuvable.' });
  }

  post.likesCount = (post.likesCount || 0) + 1;
  saveDatabase(db);
  res.json(post);
});

// Report a post
app.post('/api/community-posts/:id/report', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const db = loadDatabase();
  if (!db.communityPosts) db.communityPosts = [];

  const post = db.communityPosts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Publication introuvable.' });
  }

  post.reported = true;
  post.reportReason = reason || 'Signalement utilisateur';
  saveDatabase(db);
  res.json({ message: 'Signalement transmis aux administrateurs.', post });
});

// Admin: Update post status or clear report
app.put('/api/community-posts/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, clearReport } = req.body;
  const db = loadDatabase();
  if (!db.communityPosts) db.communityPosts = [];

  const post = db.communityPosts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Publication introuvable.' });
  }

  if (status) post.status = status;
  if (clearReport) {
    post.reported = false;
    post.reportReason = undefined;
  }

  saveDatabase(db);
  res.json(post);
});

// Admin: Delete post
app.delete('/api/community-posts/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  if (!db.communityPosts) db.communityPosts = [];

  const initialLength = db.communityPosts.length;
  db.communityPosts = db.communityPosts.filter(p => p.id !== id);

  if (db.communityPosts.length === initialLength) {
    return res.status(404).json({ error: 'Publication introuvable.' });
  }

  saveDatabase(db);
  res.json({ message: 'Publication supprimée définitivement.' });
});

// 2. Destinations API
app.get('/api/destinations', (req, res) => {
  res.json(INITIAL_DESTINATIONS);
});

// 3. Establishments API
app.get('/api/establishments', (req, res) => {
  const db = loadDatabase();
  res.json(db.establishments);
});

app.post('/api/establishments', (req, res) => {
  const { 
    name, description, location, type, ownerId, amenities, contactEmail, contactPhone, images,
    status, coordinates, visibility, displayOrder, usageInfo, creatorId
  } = req.body;
  const db = loadDatabase();

  const newEstablishment: Establishment = {
    id: `est_${Date.now()}`,
    name,
    description,
    location: location as SenegalDestination,
    type,
    ownerId,
    status: status || 'pending',
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'],
    rating: 0,
    amenities: amenities || [],
    contactEmail,
    contactPhone,
    coordinates,
    creatorId: creatorId || ownerId,
    modifierId: creatorId || ownerId,
    visibility: visibility || 'public',
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    usageInfo: usageInfo || "Fiche descriptive de l'établissement",
  };

  db.establishments.push(newEstablishment);

  const userIndex = db.users.findIndex(u => u.id === ownerId);
  if (userIndex !== -1) {
    db.users[userIndex].establishmentId = newEstablishment.id;
  }

  saveDatabase(db);
  res.status(201).json({ establishment: newEstablishment });
});

app.put('/api/establishments/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, validatorId } = req.body;
  const db = loadDatabase();

  const estIndex = db.establishments.findIndex(e => e.id === id);
  if (estIndex === -1) {
    return res.status(404).json({ error: 'Établissement non trouvé.' });
  }

  db.establishments[estIndex].status = status;
  if (validatorId) {
    db.establishments[estIndex].validatorId = validatorId;
  }
  saveDatabase(db);
  res.json({ establishment: db.establishments[estIndex] });
});

app.put('/api/establishments/:id', (req, res) => {
  const { id } = req.params;
  const { 
    name, description, amenities, contactEmail, contactPhone, images,
    status, coordinates, visibility, displayOrder, usageInfo, modifierId
  } = req.body;
  const db = loadDatabase();

  const estIndex = db.establishments.findIndex(e => e.id === id);
  if (estIndex === -1) {
    return res.status(404).json({ error: 'Établissement non trouvé.' });
  }

  const est = db.establishments[estIndex];
  if (name !== undefined) est.name = name;
  if (description !== undefined) est.description = description;
  if (amenities !== undefined) est.amenities = amenities;
  if (contactEmail !== undefined) est.contactEmail = contactEmail;
  if (contactPhone !== undefined) est.contactPhone = contactPhone;
  if (images !== undefined) est.images = images;

  if (status !== undefined) est.status = status;
  if (coordinates !== undefined) est.coordinates = coordinates;
  if (visibility !== undefined) est.visibility = visibility;
  if (displayOrder !== undefined) est.displayOrder = Number(displayOrder);
  if (usageInfo !== undefined) est.usageInfo = usageInfo;
  if (modifierId !== undefined) est.modifierId = modifierId;

  if (status === undefined) {
    est.status = 'pending';
  }

  saveDatabase(db);
  res.json({ establishment: est });
});

// 4. Offers API
app.get('/api/offers', (req, res) => {
  const db = loadDatabase();
  res.json(db.offers);
});

app.get('/api/establishments/:id/offers', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  const offers = db.offers.filter(o => o.establishmentId === id);
  res.json(offers);
});

app.post('/api/establishments/:id/offers', (req, res) => {
  const { id } = req.params;
  const { 
    title, description, price, promoPrice, currency, capacity, services, images, availableQuantity,
    status, structuredImages, availabilityCalendar, coordinates, visibility, displayOrder, usageInfo, creatorId
  } = req.body;
  const db = loadDatabase();

  const newOffer: Offer = {
    id: `off_${Date.now()}`,
    establishmentId: id,
    title,
    description,
    price: Number(price),
    promoPrice: promoPrice !== undefined ? Number(promoPrice) : undefined,
    currency: currency || 'FCFA',
    capacity: Number(capacity),
    services: services || [],
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: Number(availableQuantity) || 1,
    status: status || 'pending',
    rejectionReason: '',

    structuredImages: structuredImages || (images || []).map((url: string, index: number) => ({
      url,
      legend: "Photo de l'offre",
      order: index,
      isCover: index === 0
    })),
    availabilityCalendar: availabilityCalendar || [],
    coordinates: coordinates || undefined,
    creatorId: creatorId || undefined,
    modifierId: creatorId || undefined,
    visibility: visibility || 'public',
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    usageInfo: usageInfo || "Offre d'hébergement ou de circuit",
  };

  db.offers.push(newOffer);
  saveDatabase(db);
  res.status(201).json(newOffer);
});

app.put('/api/offers/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, validatorId } = req.body;
  const db = loadDatabase();

  const offerIndex = db.offers.findIndex(o => o.id === id);
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offre non trouvée.' });
  }

  db.offers[offerIndex].status = status;
  if (validatorId) {
    db.offers[offerIndex].validatorId = validatorId;
  }
  if (status === 'rejected') {
    db.offers[offerIndex].rejectionReason = rejectionReason || 'Qualité du contenu insuffisante ou informations incomplètes.';
  } else {
    db.offers[offerIndex].rejectionReason = '';
  }

  saveDatabase(db);
  res.json({ offer: db.offers[offerIndex] });
});

app.put('/api/offers/:id', (req, res) => {
  const { id } = req.params;
  const { 
    title, description, price, promoPrice, currency, capacity, services, availableQuantity, images,
    status, structuredImages, availabilityCalendar, coordinates, visibility, displayOrder, usageInfo, modifierId
  } = req.body;
  const db = loadDatabase();

  const offerIndex = db.offers.findIndex(o => o.id === id);
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offre non trouvée.' });
  }

  const offer = db.offers[offerIndex];
  if (title !== undefined) offer.title = title;
  if (description !== undefined) offer.description = description;
  if (price !== undefined) offer.price = Number(price);
  if (promoPrice !== undefined) offer.promoPrice = promoPrice !== null ? Number(promoPrice) : undefined;
  if (currency !== undefined) offer.currency = currency;
  if (capacity !== undefined) offer.capacity = Number(capacity);
  if (services !== undefined) offer.services = services;
  if (availableQuantity !== undefined) offer.availableQuantity = Number(availableQuantity);
  if (images !== undefined) offer.images = images;

  if (status !== undefined) offer.status = status;
  if (structuredImages !== undefined) offer.structuredImages = structuredImages;
  if (availabilityCalendar !== undefined) offer.availabilityCalendar = availabilityCalendar;
  if (coordinates !== undefined) offer.coordinates = coordinates;
  if (visibility !== undefined) offer.visibility = visibility;
  if (displayOrder !== undefined) offer.displayOrder = Number(displayOrder);
  if (usageInfo !== undefined) offer.usageInfo = usageInfo;
  if (modifierId !== undefined) offer.modifierId = modifierId;

  if (status === undefined) {
    offer.status = 'pending';
    offer.rejectionReason = '';
  }

  saveDatabase(db);
  res.json(offer);
});

app.put('/api/offers/:id/calendar', (req, res) => {
  const { id } = req.params;
  const { availabilityCalendar, availableQuantity } = req.body;
  const db = loadDatabase();

  const offerIndex = db.offers.findIndex(o => o.id === id);
  if (offerIndex === -1) {
    return res.status(404).json({ error: 'Offre non trouvée.' });
  }

  const offer = db.offers[offerIndex];
  if (availabilityCalendar !== undefined) offer.availabilityCalendar = availabilityCalendar;
  if (availableQuantity !== undefined) offer.availableQuantity = Number(availableQuantity);

  saveDatabase(db);
  res.json(offer);
});

// 5. Bookings API
app.get('/api/bookings', (req, res) => {
  const { userId, role, establishmentId } = req.query;
  const db = loadDatabase();

  if (role === 'admin') {
    return res.json(db.bookings);
  }

  if (role === 'professional' && establishmentId) {
    const proBookings = db.bookings.filter(b => b.establishmentId === establishmentId);
    return res.json(proBookings);
  }

  if (role === 'tourist' && userId) {
    const touristBookings = db.bookings.filter(b => b.touristId === userId);
    return res.json(touristBookings);
  }

  res.json([]);
});

app.post('/api/bookings', (req, res) => {
  const { offerId, checkIn, checkOut, guestsCount, touristId } = req.body;
  const db = loadDatabase();

  const offer = db.offers.find(o => o.id === offerId);
  if (!offer) {
    return res.status(404).json({ error: 'Offre non trouvée.' });
  }

  const establishment = db.establishments.find(e => e.id === offer.establishmentId);
  if (!establishment) {
    return res.status(404).json({ error: 'Établissement lié à l\'offre introuvable.' });
  }

  const tourist = db.users.find(u => u.id === touristId);
  if (!tourist) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = offer.price * diffDays;

  const newBooking: Booking = {
    id: `book_${Date.now()}`,
    offerId: offer.id,
    offerTitle: offer.title,
    establishmentId: establishment.id,
    establishmentName: establishment.name,
    touristId: tourist.id,
    touristName: tourist.name,
    touristEmail: tourist.email,
    checkIn,
    checkOut,
    guestsCount: Number(guestsCount),
    totalPrice,
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.bookings.push(newBooking);
  saveDatabase(db);
  res.status(201).json(newBooking);
});

app.put('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDatabase();

  const bookingIndex = db.bookings.findIndex(b => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Réservation introuvable.' });
  }

  db.bookings[bookingIndex].status = status;
  saveDatabase(db);
  res.json(db.bookings[bookingIndex]);
});

// 6. Reviews API
app.get('/api/reviews', (req, res) => {
  const { establishmentId, targetId, verifiedOnly } = req.query;
  const db = loadDatabase();
  let reviews = db.reviews || [];

  if (establishmentId || targetId) {
    const filterId = establishmentId || targetId;
    reviews = reviews.filter(r => r.establishmentId === filterId || r.targetId === filterId);
  }

  if (verifiedOnly === 'true') {
    reviews = reviews.filter(r => r.verified);
  }

  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const { establishmentId, authorName, rating, comment, title, targetType, targetId, verified, stayDate, bookingId, bookingItemId } = req.body;
  const db = loadDatabase();

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    establishmentId: establishmentId || targetId,
    targetId: targetId || establishmentId,
    targetType: targetType || 'ACCOMMODATION',
    authorName,
    touristName: authorName,
    rating: Number(rating),
    title: title || 'Avis sur le séjour',
    comment,
    verified: Boolean(verified),
    stayDate: stayDate || 'Séjour récent',
    bookingId,
    bookingItemId,
    status: 'VISIBLE',
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.reviews.push(newReview);

  const target = targetId || establishmentId;
  const estReviews = db.reviews.filter(r => r.establishmentId === target || r.targetId === target);
  if (estReviews.length > 0) {
    const totalRating = estReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Number((totalRating / estReviews.length).toFixed(1));

    const estIndex = db.establishments.findIndex(e => e.id === target);
    if (estIndex !== -1) {
      db.establishments[estIndex].rating = averageRating;
      db.establishments[estIndex].reviewsCount = estReviews.length;
    }
  }

  saveDatabase(db);
  res.status(201).json(newReview);
});

// ==================== PARCOURS CRITIQUE : DOSSIERS DE VOYAGE COMBINÉS (TRAVEL BOOKINGS) ==================== //

// 6.1. Get travel bookings
app.get('/api/travel-bookings', (req, res) => {
  const { userId, role, establishmentId } = req.query;
  const db = loadDatabase();
  const bookings = db.travelBookings || [];

  if (role === 'admin') {
    return res.json(bookings);
  }

  if (role === 'tourist' && userId) {
    const touristBookings = bookings.filter(b => b.userId === userId);
    return res.json(touristBookings);
  }

  if (role === 'professional' && userId) {
    const proBookings = bookings.filter(b => 
      b.items.some(item => item.providerOwnerId === userId || (establishmentId && item.providerId === establishmentId))
    );
    return res.json(proBookings);
  }

  res.json(bookings);
});

// 6.2. Get single travel booking by ID or reference
app.get('/api/travel-bookings/:id', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  const booking = (db.travelBookings || []).find(b => b.id === id || b.reference === id);

  if (!booking) {
    return res.status(404).json({ error: 'Dossier de voyage introuvable.' });
  }

  res.json(booking);
});

// 6.2.1. Check review eligibility for a booking (GET /api/bookings/:id/review-eligibility)
app.get('/api/travel-bookings/:id/review-eligibility', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  const db = loadDatabase();
  const booking = (db.travelBookings || []).find(b => b.id === id || b.reference === id);

  if (!booking) {
    return res.status(404).json({ error: 'Dossier introuvable.' });
  }

  const isAuthor = !userId || booking.userId === userId;
  const isCompleted = booking.status === 'COMPLETED';
  const eligibleItems = booking.items.filter(item => item.status === 'COMPLETED' && !item.reviewSubmitted);

  res.json({
    eligible: isAuthor && (isCompleted || eligibleItems.length > 0),
    bookingStatus: booking.status,
    eligibleItems,
    completedItemsCount: booking.items.filter(i => i.status === 'COMPLETED').length,
    totalItemsCount: booking.items.length
  });
});

// 6.2.2. Availability check API (POST /api/availability/check) as required by Section 11 & 29
app.post('/api/availability/check', (req, res) => {
  const { 
    accommodationOfferId, accommodationEstablishmentId, 
    guideOfferId, guideEstablishmentId, 
    checkIn, checkOut, guestsCount 
  } = req.body;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ 
      available: false, 
      error: 'Veuillez renseigner les dates d\'arrivée et de départ.' 
    });
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return res.status(400).json({ 
      available: false, 
      error: 'La date de départ doit être postérieure à la date d\'arrivée.' 
    });
  }

  const db = loadDatabase();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const days = nights;

  let accAvailable = true;
  let accDetails: any = null;
  if (accommodationOfferId) {
    const accOffer = db.offers.find(o => o.id === accommodationOfferId);
    const accEst = db.establishments.find(e => e.id === (accommodationEstablishmentId || accOffer?.establishmentId));
    if (!accOffer || !accEst || accEst.status !== 'approved') {
      accAvailable = false;
      accDetails = { available: false, error: 'Hébergement non validé ou introuvable.' };
    } else {
      if (guestsCount && Number(guestsCount) > accOffer.capacity) {
        accAvailable = false;
        accDetails = { available: false, error: `Capacité dépassée (max: ${accOffer.capacity} pers.)` };
      } else {
        accDetails = { 
          available: true, 
          offerTitle: accOffer.title, 
          establishmentName: accEst.name, 
          pricePerNight: accOffer.price, 
          nights, 
          total: accOffer.price * nights 
        };
      }
    }
  }

  let guideAvailable = true;
  let guideDetails: any = null;
  if (guideOfferId) {
    const guideOffer = db.offers.find(o => o.id === guideOfferId);
    const guideEst = db.establishments.find(e => e.id === (guideEstablishmentId || guideOffer?.establishmentId));
    if (!guideOffer || !guideEst || guideEst.status !== 'approved') {
      guideAvailable = false;
      guideDetails = { available: false, error: 'Guide non validé ou introuvable.' };
    } else {
      guideDetails = { 
        available: true, 
        offerTitle: guideOffer.title, 
        guideName: guideEst.name, 
        pricePerDay: guideOffer.price, 
        days, 
        total: guideOffer.price * days 
      };
    }
  }

  const allAvailable = accAvailable && guideAvailable;
  const totalPrice = (accDetails?.total || 0) + (guideDetails?.total || 0);

  res.json({
    available: allAvailable,
    accommodation: accDetails,
    guide: guideDetails,
    nights,
    days,
    totalPrice,
    message: allAvailable 
      ? 'Les disponibilités ont été vérifiées et validées avec succès par le serveur !'
      : 'Certaines prestations sont indisponibles pour les critères sélectionnés.'
  });
});

// 6.2.3. Get accommodation availability calendar
app.get('/api/accommodations/:id/availability', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  const est = db.establishments.find(e => e.id === id);
  if (!est) return res.status(404).json({ error: 'Hébergement introuvable.' });

  const offers = db.offers.filter(o => o.establishmentId === id);
  res.json({
    establishmentId: id,
    name: est.name,
    status: est.status,
    available: est.status === 'approved',
    offersCount: offers.length
  });
});

// 6.2.4. Get guide availability
app.get('/api/guides/:id/availability', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  const guide = db.establishments.find(e => e.id === id);
  if (!guide) return res.status(404).json({ error: 'Guide introuvable.' });

  res.json({
    guideId: id,
    name: guide.name,
    status: guide.status,
    available: guide.status === 'approved',
    specialties: guide.amenities
  });
});

// 6.3. Create combined travel booking (POST /api/travel-bookings)
app.post('/api/travel-bookings', (req, res) => {
  const { 
    userId, destination, checkIn, checkOut, guestsCount, message,
    accommodationOfferId, accommodationEstablishmentId,
    guideOfferId, guideEstablishmentId,
    travelerName, travelerEmail, travelerPhone
  } = req.body;

  const db = loadDatabase();
  if (!db.travelBookings) db.travelBookings = [];
  if (!db.notifications) db.notifications = [];
  if (!db.auditLogs) db.auditLogs = [];

  const user = db.users.find(u => u.id === userId);

  // Calculate nights and days
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const days = nights;

  const bookingId = `tb_${Date.now()}`;
  const randomRef = Math.random().toString(36).substring(2, 7).toUpperCase();
  const reference = `TT-2026-${randomRef}`;
  const items: BookingItem[] = [];
  let totalPrice = 0;

  // Prestation 1: Accommodation (if selected)
  let accEst: any = null;
  let accOffer: any = null;
  if (accommodationOfferId) {
    accOffer = db.offers.find(o => o.id === accommodationOfferId);
    accEst = db.establishments.find(e => e.id === (accommodationEstablishmentId || accOffer?.establishmentId));
    if (!accOffer || !accEst) {
      return res.status(400).json({ error: 'Hébergement sélectionné introuvable.' });
    }
    if (accEst.status !== 'approved') {
      return res.status(400).json({ error: 'L\'hébergement sélectionné n\'est pas encore validé par l\'administration.' });
    }
    const accPrice = accOffer.price * nights;
    totalPrice += accPrice;

    items.push({
      id: `item_acc_${Date.now()}`,
      bookingId,
      type: 'ACCOMMODATION',
      providerId: accEst.id,
      providerName: accEst.name,
      providerOwnerId: accEst.ownerId,
      offerId: accOffer.id,
      offerTitle: accOffer.title,
      price: accPrice,
      details: {
        roomType: accOffer.title,
        nightsCount: nights,
      },
      status: 'PENDING'
    });
  }

  // Prestation 2: Guide (if selected)
  let guideEst: any = null;
  let guideOffer: any = null;
  if (guideOfferId) {
    guideOffer = db.offers.find(o => o.id === guideOfferId);
    guideEst = db.establishments.find(e => e.id === (guideEstablishmentId || guideOffer?.establishmentId));
    if (!guideOffer || !guideEst) {
      return res.status(400).json({ error: 'Guide sélectionné introuvable.' });
    }
    if (guideEst.status !== 'approved') {
      return res.status(400).json({ error: 'Le guide sélectionné n\'est pas encore validé par l\'administration.' });
    }
    const guidePrice = guideOffer.price * days;
    totalPrice += guidePrice;

    items.push({
      id: `item_guide_${Date.now() + 1}`,
      bookingId,
      type: 'GUIDE',
      providerId: guideEst.id,
      providerName: guideEst.name,
      providerOwnerId: guideEst.ownerId,
      offerId: guideOffer.id,
      offerTitle: guideOffer.title,
      price: guidePrice,
      details: {
        guideName: guideEst.name,
        durationDays: days,
        languages: ['Français', 'Wolof'],
      },
      status: 'PENDING'
    });
  }

  if (items.length === 0) {
    return res.status(400).json({ error: 'Veuillez sélectionner au moins un hébergement ou un guide pour composer votre dossier.' });
  }

  const newBooking: TravelBooking = {
    id: bookingId,
    reference,
    userId: user ? user.id : (userId || `tourist_${Date.now()}`),
    travelerName: user ? user.name : (travelerName || 'Voyageur Teranga'),
    travelerEmail: user ? user.email : (travelerEmail || 'voyageur@teranga.sn'),
    travelerPhone: travelerPhone || user?.phone || '+221 77 000 00 00',
    destination: destination || (accEst?.location || guideEst?.location || 'Casamance'),
    checkIn,
    checkOut,
    guestsCount: Number(guestsCount) || 2,
    message: message || '',
    totalPrice,
    status: 'PENDING',
    items,
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.travelBookings.push(newBooking);

  // Send notifications to providers
  if (accEst) {
    db.notifications.push({
      id: `notif_${Date.now()}_1`,
      recipientUserId: accEst.ownerId,
      title: 'Nouvelle demande d\'hébergement',
      message: `${newBooking.travelerName} a envoyé une demande pour ${accOffer.title} du ${checkIn} au ${checkOut} (${nights} nuits). Réf: ${reference}`,
      type: 'booking_request',
      reference,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  if (guideEst) {
    db.notifications.push({
      id: `notif_${Date.now()}_2`,
      recipientUserId: guideEst.ownerId,
      title: 'Nouvelle demande de guidage',
      message: `${newBooking.travelerName} a sélectionné vos services pour ${days} jours du ${checkIn} au ${checkOut}. Réf: ${reference}`,
      type: 'booking_request',
      reference,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  // Notification to traveler
  db.notifications.push({
    id: `notif_${Date.now()}_3`,
    recipientUserId: newBooking.userId,
    title: 'Dossier de voyage créé avec succès !',
    message: `Votre demande combinée (${items.map(i => i.providerName).join(' + ')}) a été transmise aux professionnels. Référence : ${reference}`,
    type: 'info',
    reference,
    read: false,
    createdAt: new Date().toISOString()
  });

  db.auditLogs.push({
    id: `log_${Date.now()}`,
    actorUserId: newBooking.userId,
    actorName: newBooking.travelerName,
    action: 'TOURIST_CREATED_BOOKING',
    entityType: 'TravelBooking',
    entityId: newBooking.id,
    summary: `Création du dossier de voyage combiné ${reference} (${items.map(i => i.providerName).join(' + ')})`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.status(201).json(newBooking);
});

// 6.3.1. Cancel travel booking (POST /api/travel-bookings/:id/cancel)
app.post('/api/travel-bookings/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { userId, role, reason } = req.body;
  const db = loadDatabase();

  const booking = (db.travelBookings || []).find(b => b.id === id || b.reference === id);
  if (!booking) return res.status(404).json({ error: 'Dossier introuvable.' });

  booking.status = 'CANCELLED';
  booking.cancelledBy = userId || role || 'traveler';
  booking.cancellationReason = reason || 'Annulation demandée par l\'utilisateur';

  booking.items.forEach(item => {
    if (item.status !== 'COMPLETED') {
      item.status = 'CANCELLED';
    }
  });

  db.auditLogs.push({
    id: `log_${Date.now()}`,
    actorUserId: userId || 'unknown',
    actorName: role || 'Utilisateur',
    action: 'BOOKING_CANCELLED',
    entityType: 'TravelBooking',
    entityId: booking.id,
    summary: `Annulation du dossier de voyage ${booking.reference} (${booking.cancellationReason})`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json(booking);
});

// 6.4. Accept booking item
app.post('/api/travel-bookings/:id/item/:itemId/accept', (req, res) => {
  const { id, itemId } = req.params;
  const { userId } = req.body;
  const db = loadDatabase();

  const booking = (db.travelBookings || []).find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Dossier introuvable.' });

  const item = booking.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Prestation introuvable.' });

  item.status = 'CONFIRMED';

  const allConfirmed = booking.items.every(i => i.status === 'CONFIRMED');
  if (allConfirmed) {
    booking.status = 'CONFIRMED';
    db.notifications.push({
      id: `notif_${Date.now()}`,
      recipientUserId: booking.userId,
      title: 'Séjour entièrement confirmé ! 🎉',
      message: `Votre hébergement et votre guide ont validé votre voyage à ${booking.destination}. Référence: ${booking.reference}`,
      type: 'booking_confirmed',
      reference: booking.reference,
      read: false,
      createdAt: new Date().toISOString()
    });
  } else {
    booking.status = 'PARTIALLY_CONFIRMED';
    db.notifications.push({
      id: `notif_${Date.now()}`,
      recipientUserId: booking.userId,
      title: 'Prestation confirmée',
      message: `${item.providerName} a validé votre demande. En attente de la seconde confirmation. Réf: ${booking.reference}`,
      type: 'booking_accepted',
      reference: booking.reference,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  db.auditLogs.push({
    id: `log_${Date.now()}`,
    actorUserId: userId || item.providerOwnerId,
    actorName: item.providerName,
    action: item.type === 'ACCOMMODATION' ? 'HOST_ACCEPTED_BOOKING' : 'GUIDE_ACCEPTED_BOOKING',
    entityType: 'BookingItem',
    entityId: item.id,
    summary: `${item.providerName} a accepté la prestation ${item.type} pour le dossier ${booking.reference}`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json(booking);
});

// 6.5. Reject booking item
app.post('/api/travel-bookings/:id/item/:itemId/reject', (req, res) => {
  const { id, itemId } = req.params;
  const { userId, reason } = req.body;
  const db = loadDatabase();

  const booking = (db.travelBookings || []).find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Dossier introuvable.' });

  const item = booking.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Prestation introuvable.' });

  item.status = 'REJECTED';
  item.rejectionReason = reason || 'Indisponibilité sur les dates choisies';

  booking.status = 'REJECTED';

  db.notifications.push({
    id: `notif_${Date.now()}`,
    recipientUserId: booking.userId,
    title: 'Prestation non disponible',
    message: `${item.providerName} ne peut pas assurer la prestation aux dates choisies. Vous pouvez choisir un autre prestataire pour votre dossier ${booking.reference}.`,
    type: 'booking_rejected',
    reference: booking.reference,
    read: false,
    createdAt: new Date().toISOString()
  });

  db.auditLogs.push({
    id: `log_${Date.now()}`,
    actorUserId: userId || item.providerOwnerId,
    actorName: item.providerName,
    action: item.type === 'ACCOMMODATION' ? 'HOST_REJECTED_BOOKING' : 'GUIDE_REJECTED_BOOKING',
    entityType: 'BookingItem',
    entityId: item.id,
    summary: `${item.providerName} a refusé la prestation ${item.type} pour le dossier ${booking.reference} (${item.rejectionReason})`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json(booking);
});

// 6.6. Check-in / Start prestation (IN_PROGRESS)
app.post('/api/travel-bookings/:id/item/:itemId/check-in', (req, res) => {
  const { id, itemId } = req.params;
  const { userId } = req.body;
  const db = loadDatabase();

  const booking = (db.travelBookings || []).find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Dossier introuvable.' });

  const item = booking.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Prestation introuvable.' });

  item.status = 'IN_PROGRESS';
  item.checkInDate = new Date().toISOString().split('T')[0];
  booking.status = 'IN_PROGRESS';

  db.auditLogs.push({
    id: `log_${Date.now()}`,
    actorUserId: userId || item.providerOwnerId,
    actorName: item.providerName,
    action: 'CHECK_IN_CONFIRMED',
    entityType: 'BookingItem',
    entityId: item.id,
    summary: `Arrivée confirmée pour ${item.providerName} (Dossier ${booking.reference})`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json(booking);
});

// 6.7. Complete prestation (COMPLETED)
app.post('/api/travel-bookings/:id/item/:itemId/complete', (req, res) => {
  const { id, itemId } = req.params;
  const { userId } = req.body;
  const db = loadDatabase();

  const booking = (db.travelBookings || []).find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Dossier introuvable.' });

  const item = booking.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Prestation introuvable.' });

  item.status = 'COMPLETED';
  item.completedAt = new Date().toISOString().split('T')[0];

  const allCompleted = booking.items.every(i => i.status === 'COMPLETED');
  if (allCompleted) {
    booking.status = 'COMPLETED';

    db.notifications.push({
      id: `notif_${Date.now()}`,
      recipientUserId: booking.userId,
      title: 'Séjour terminé - Donnez votre avis vérifié ! 🌟',
      message: `Votre voyage à ${booking.destination} est terminé. Vous pouvez déposer un avis vérifié sur votre hébergement et votre guide.`,
      type: 'review_invite',
      reference: booking.reference,
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  db.auditLogs.push({
    id: `log_${Date.now()}`,
    actorUserId: userId || item.providerOwnerId,
    actorName: item.providerName,
    action: 'TRIP_COMPLETED',
    entityType: 'BookingItem',
    entityId: item.id,
    summary: `Prestation ${item.type} terminée pour ${item.providerName} (Dossier ${booking.reference})`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.json(booking);
});

// 6.8. Submit verified review
app.post('/api/travel-bookings/:id/item/:itemId/reviews', (req, res) => {
  const { id, itemId } = req.params;
  const { userId, rating, title, comment } = req.body;
  const db = loadDatabase();

  const booking = (db.travelBookings || []).find(b => b.id === id);
  if (!booking) return res.status(404).json({ error: 'Dossier introuvable.' });

  if (booking.userId !== userId) {
    return res.status(403).json({ error: 'Seul le voyageur ayant effectué le séjour peut déposer un avis vérifié.' });
  }

  const item = booking.items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ error: 'Prestation introuvable.' });

  if (item.status !== 'COMPLETED') {
    return res.status(400).json({ error: 'Un avis ne peut être déposé qu\'une fois la prestation réellement terminée.' });
  }

  if (item.reviewSubmitted) {
    return res.status(400).json({ error: 'Un avis a déjà été déposé pour cette prestation.' });
  }

  const user = db.users.find(u => u.id === userId);
  const monthYear = new Date(booking.checkOut).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const newReview: Review = {
    id: `rev_verified_${Date.now()}`,
    establishmentId: item.providerId,
    bookingId: booking.id,
    bookingItemId: item.id,
    authorUserId: user?.id || userId,
    authorName: user?.name || booking.travelerName,
    touristName: user?.name || booking.travelerName,
    targetType: item.type,
    targetId: item.providerId,
    targetName: item.providerName,
    rating: Number(rating) || 5,
    title: title || 'Avis sur le séjour',
    comment: comment || '',
    verified: true,
    stayDate: `Séjour effectué en ${monthYear}`,
    status: 'VISIBLE',
    createdAt: new Date().toISOString().split('T')[0]
  };

  db.reviews.push(newReview);
  item.reviewSubmitted = true;

  if (booking.items.every(i => i.reviewSubmitted)) {
    booking.status = 'REVIEW_SUBMITTED';
  }

  // Update average rating
  const targetId = item.providerId;
  const estReviews = db.reviews.filter(r => r.establishmentId === targetId || r.targetId === targetId);
  if (estReviews.length > 0) {
    const total = estReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = Number((total / estReviews.length).toFixed(1));
    const estIndex = db.establishments.findIndex(e => e.id === targetId);
    if (estIndex !== -1) {
      db.establishments[estIndex].rating = avg;
      db.establishments[estIndex].reviewsCount = estReviews.length;
    }
  }

  db.auditLogs.push({
    id: `log_${Date.now()}`,
    actorUserId: userId,
    actorName: user?.name || booking.travelerName,
    action: 'TOURIST_SUBMITTED_REVIEW',
    entityType: 'Review',
    entityId: newReview.id,
    summary: `Avis vérifié déposé (${rating}/5) pour ${item.providerName}`,
    createdAt: new Date().toISOString()
  });

  saveDatabase(db);
  res.status(201).json(newReview);
});

// 6.9. Notifications API
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  const db = loadDatabase();
  const notifs = db.notifications || [];
  if (!userId) return res.json(notifs);
  res.json(notifs.filter(n => n.recipientUserId === userId));
});

app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const db = loadDatabase();
  const notif = (db.notifications || []).find(n => n.id === id);
  if (notif) notif.read = true;
  saveDatabase(db);
  res.json({ success: true });
});

// 6.10. Audit Logs API (Admin)
app.get('/api/audit-logs', (req, res) => {
  const db = loadDatabase();
  res.json(db.auditLogs || []);
});

// 7. AI Assistant - Travel Planner using Gemini API
app.post('/api/assistant/itinerary', async (req, res) => {
  const { destination, durationDays, travelerType, budget, interests } = req.body as ItineraryRequest;

  try {
    const ai = getAI();
    const interestsString = interests && interests.length > 0 ? interests.join(', ') : 'visites culturelles, farniente, nature';
    
    const prompt = `Génère un itinéraire de voyage sur mesure et immersif pour le Sénégal avec les spécifications suivantes :
- Destination : ${destination === 'all' ? 'Un combiné des plus belles destinations du Sénégal (Dakar, Sine Saloum, Casamance, Saint-Louis, Kédougou)' : destination}
- Durée : ${durationDays} jours
- Profil voyageur : ${travelerType === 'solo' ? 'Voyageur Solo' : travelerType === 'couple' ? 'Couple' : travelerType === 'family' ? 'Famille avec enfants' : 'Groupe d\'amis'}
- Budget : ${budget === 'budget' ? 'Économique / Authentique (Campements villageois, transports locaux)' : budget === 'medium' ? 'Intermédiaire / Confort (Hôtels confortables, guide local)' : 'Haut de gamme / Premium (Hôtels d\'exception, excursions privées)'}
- Centres d'intérêt : ${interestsString}

Consignes de rédaction :
1. Rédige en français avec un ton chaleureux, enthousiaste et accueillant (la Teranga sénégalaise !).
2. Propose un titre accrocheur pour ce séjour.
3. Fais un résumé d'introduction expliquant l'ambiance et la philosophie de ce voyage.
4. Fournis un plan jour par jour très précis (Matin, Après-midi, Soirée) incluant des activités concrètes, des suggestions de plats sénégalais à goûter (Thieboudienne, Yassa, Mafé, jus de Bissap ou de Bouye) et des conseils pratiques.
5. Inclus des recommandations éco-responsables et de respect de la culture locale (traditions Diola, Bédik, vie de quartier wolof, etc.).
6. Utilise une belle structure Markdown avec des émojis pour rendre la lecture agréable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Tu es 'Teranga Travel AI', un guide touristique expert du Sénégal passionné et chaleureux. Tu connais parfaitement chaque recoin du Sénégal (Dakar, Sine Saloum, Casamance, Saint-Louis, Kédougou). Tu rédiges des propositions d'itinéraires extrêmement engageantes, pleines de détails vécus et de conseils sur la culture sénégalaise, la cuisine et les transports. Tu utilises un format markdown élégant avec des puces claires et des émojis.",
      },
    });

    res.json({ itineraryText: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: 'Impossible de générer l\'itinéraire par l\'IA.',
      details: error.message || 'La clé API Gemini est absente ou invalide.'
    });
  }
});

// Vite middleware integrated for SPA server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Teranga Travel backend server running on http://localhost:${PORT}`);
  });
}

startServer();
