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
import { User, Establishment, Offer, Booking, Review, Message, ItineraryRequest, SenegalDestination, Community, CommunityPost } from '../shared/types';

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
  const { email, password } = req.body;
  const db = loadDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Identifiants de connexion incorrects.' });
  }

  // Check password or quick evaluation shortcut
  const isMatch = user.password === password 
    || (password === 'professional' && user.role === 'professional')
    || (password === 'agency' && (user.password === 'agency' || user.email.includes('agency')))
    || (password === 'guide' && (user.password === 'guide' || user.email.includes('guide')));

  if (!isMatch) {
    return res.status(401).json({ error: 'Mot de passe incorrect.' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role } = req.body;
  const db = loadDatabase();

  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Cette adresse e-mail est déjà utilisée.' });
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email: email.toLowerCase(),
    password,
    name,
    role,
  };

  db.users.push(newUser);
  saveDatabase(db);

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({ user: userWithoutPassword });
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
  const { establishmentId } = req.query;
  const db = loadDatabase();

  if (establishmentId) {
    const filtered = db.reviews.filter(r => r.establishmentId === establishmentId);
    return res.json(filtered);
  }

  res.json(db.reviews);
});

app.post('/api/reviews', (req, res) => {
  const { establishmentId, authorName, rating, comment } = req.body;
  const db = loadDatabase();

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    establishmentId,
    authorName,
    rating: Number(rating),
    comment,
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.reviews.push(newReview);

  const estReviews = db.reviews.filter(r => r.establishmentId === establishmentId);
  const totalRating = estReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = Number((totalRating / estReviews.length).toFixed(1));

  const estIndex = db.establishments.findIndex(e => e.id === establishmentId);
  if (estIndex !== -1) {
    db.establishments[estIndex].rating = averageRating;
  }

  saveDatabase(db);
  res.status(201).json(newReview);
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
