/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_DESTINATIONS, INITIAL_ESTABLISHMENTS, INITIAL_OFFERS, INITIAL_REVIEWS } from './data';
import { User, Establishment, Offer, Booking, Review, ItineraryRequest, SenegalDestination } from '../shared/types';

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

      if (changed) {
        saveDatabase(db);
      }
      return db;
    } catch (err) {
      console.error('Error reading database, resetting...', err);
    }
  }

  const db: DatabaseSchema = {
    users: defaultUsers,
    establishments: INITIAL_ESTABLISHMENTS,
    offers: INITIAL_OFFERS,
    bookings: [],
    reviews: INITIAL_REVIEWS,
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
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Identifiants de connexion incorrects.' });
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
