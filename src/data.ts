/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Destination, Establishment, Offer, Review } from './types';

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'dest_dakar',
    name: 'Dakar',
    description: 'Capitale vibrante entre culture, histoire et océan.',
    longDescription: 'Dakar, la capitale du Sénégal, est une métropole dynamique bâtie sur une péninsule face à l\'océan Atlantique. Elle offre un contraste fascinant entre la modernité urbaine et la mémoire historique de l\'île de Gorée, classée à l\'UNESCO. Connue pour ses marchés animés, son art contemporain florissant et son ambiance musicale légendaire, Dakar est le point de départ idéal pour tout voyageur.',
    coverImage: 'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=1200&q=80', // Beautiful coastal sunset
    images: [
      'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=600&q=80', // Dakar Coast
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80', // Goree vibe placeholder (Ocean View)
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'  // African Renaissance placeholder
    ],
    highlights: [
      'Île de Gorée et la Maison des Esclaves',
      'Le Monument de la Renaissance Africaine',
      'Les plages et les spots de surf des Almadies',
      'Le marché Sandaga et le marché Soumbédioune',
      'L\'île de Ngor pour une escapade artistique et calme'
    ],
    activities: [
      'Surf et plongée sur la presqu\'île des Almadies',
      'Visites guidées historiques à l\'île de Gorée',
      'Exploration des galeries d\'art contemporain du Plateau',
      'Ateliers de percussions traditionnelles (Djembé/Sabar)',
      'Balades en pirogue vers l\'île de Ngor'
    ],
    specialties: [
      'Thiéboudienne (Riz au poisson, plat national)',
      'Jus de Bouye (Boisson onctueuse à base de fruit du Baobab)',
      'Pastels (Beignets farcis de poisson épicé)',
      'Dibi (Viande d\'agneau grillée au feu de bois)',
      'Jus de Bissap (Infusion de fleurs d\'hibiscus)'
    ],
    localTips: [
      'Prenez la chaloupe tôt le matin pour visiter Gorée afin d\'éviter la foule.',
      'N\'hésitez pas à négocier poliment dans les marchés, cela fait partie de la Teranga !',
      'Dégustez un bon Thiéboudienne (riz au poisson) au déjeuner près du port de pêche.'
    ],
    coordinates: { lat: 14.7167, lng: -17.4677 }
  },
  {
    id: 'dest_saloum',
    name: 'Sine Saloum',
    description: 'Un labyrinthe sauvage de mangroves et d\'îles fluviales.',
    longDescription: 'Le delta du Sine Saloum est une merveille naturelle classée réserve de biosphère. Formé par la confluence de deux fleuves, il abrite des centaines d\'îles, de forêts de mangroves denses et d\'impressionnants cordons dunaires. C\'est un sanctuaire ornithologique de premier ordre et un havre de paix où le temps semble suspendu, idéal pour les amoureux de nature sauvage et de calme.',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', // Mangroves/Waterway
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80', // Serene water
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80'  // Lush green / river
    ],
    highlights: [
      'Balade en pirogue traditionnelle dans le dédale des bolongs (canaux)',
      'Observation des milliers d\'oiseaux migrateurs',
      'Visite de l\'île aux coquillages de Fadiouth',
      'Rencontre chaleureuse avec les pêcheurs Niominka',
      'Le gigantesque baobab sacré de Fadial'
    ],
    activities: [
      'Excursion en pirogue dans les bolongs (forêts de palétuviers)',
      'Observation ornithologique guidée (Pélicans, Hérons, Martin-pêcheurs)',
      'Pêche sportive traditionnelle avec des pêcheurs locaux',
      'Randonnée pédestre ou en VTT vers le Baobab sacré de Fadial',
      'Visite du cimetière de coquillages mixte à Joal-Fadiouth'
    ],
    specialties: [
      'Crevettes grillées du delta fraîchement pêchées',
      'Huîtres de palétuviers cuites au feu de bois',
      'Poisson fumé traditionnel (Kétiakh)',
      'Miel sauvage de mangrove',
      'Thiéboudienne local préparé au feu de bois'
    ],
    localTips: [
      'Prévoyez un bon répulsif anti-moustiques pour les soirées au bord de l\'eau.',
      'Une excursion en pirogue au coucher du soleil offre des lumières absolument magiques.',
      'Achetez du miel local de mangrove, il a un goût unique !'
    ],
    coordinates: { lat: 13.9167, lng: -16.5 }
  },
  {
    id: 'dest_casamance',
    name: 'Casamance',
    description: 'Forêts luxuriantes, traditions mystiques et plages de rêve.',
    longDescription: 'Séparée du nord du Sénégal par la Gambie, la Casamance est la région verte du pays. Elle séduit par sa végétation luxuriante, ses forêts de fromagers géants et ses vergers fertiles. Entre fleuve et océan, la Casamance conserve des traditions mystiques fortes au sein du peuple Diola et propose certaines des plus belles plages de sable blanc d\'Afrique de l\'Ouest à Cap Skirring.',
    coverImage: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80', // Beautiful Cap Skirring beach style
    images: [
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80', // Deep green forest
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80'  // Lush trees
    ],
    highlights: [
      'Les plages sauvages et paradisiaques de Cap Skirring',
      'L\'architecture unique des cases à impluvium d\'Enampore',
      'L\'île historique de Karabane',
      'Observation des dauphins dans l\'embouchure du fleuve Casamance',
      'Visite d\'Oussouye et rencontre respectueuse avec le Roi d\'Oussouye'
    ],
    activities: [
      'Baignade et sports nautiques sur les plages de Cap Skirring',
      'Rencontre respectueuse avec le Roi d\'Oussouye pour comprendre les rites Diola',
      'Dauphins-safari en pirogue à l\'embouchure du fleuve Casamance',
      'Balade à vélo sous les manguiers et forêts de fromagers',
      'Visite guidée historique de l\'île de Karabane'
    ],
    specialties: [
      'Caldou (Poisson cuit au citron vert, servi avec du riz et de l\'huile de palme rouge)',
      'Vin de palme frais recueilli à l\'aube',
      'Mangues fraîches locales (plusieurs variétés d\'une douceur exceptionnelle)',
      'Riz cuisiné à la mode casamançaise',
      'Jus de Madd (fruit forestier sauvage acidulé)'
    ],
    localTips: [
      'Louez un vélo pour vous balader de village en village sous l\'ombre des manguiers.',
      'Respectez scrupuleusement les rites locaux et demandez toujours avant de photographier les objets sacrés.',
      'Goûtez au vin de palme frais récolté le matin même.'
    ],
    coordinates: { lat: 12.6, lng: -16.2667 }
  },
  {
    id: 'dest_saint_louis',
    name: 'Saint-Louis',
    description: 'La Venise africaine au charme colonial et artistique.',
    longDescription: 'Ancienne capitale du Sénégal et de l\'Afrique Occidentale Française (AOF), Saint-Louis (Ndar en wolof) is bâtie sur une île étroite au milieu du fleuve Sénégal. Reliée au continent par le célèbre pont Faidherbe conçu par Nouguier (associé d\'Eiffel), elle dégage un charme nostalgique envoûtant avec ses maisons coloniales aux façades colorées, ses balcons en fer forgé et ses festivals de jazz réputés.',
    coverImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', // Old colonial building/sunset vibe
    images: [
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=600&q=80', // Colorful streets
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=600&q=80'  // Bridge/city scape
    ],
    highlights: [
      'Traversée à pied du majestueux Pont Pont Faidherbe',
      'Balade en calèche à travers l\'île coloniale endormie',
      'Le quartier des pêcheurs de Guet Ndar, fourmillant de pirogues colorées',
      'Le Parc National des Oiseaux du Djoudj (octobre à avril)',
      'Le festival international Saint-Louis Jazz en mai'
    ],
    activities: [
      'Visite romantique de l\'île en calèche traditionnelle',
      'Safari ornithologique extraordinaire au Parc du Djoudj (3ème réserve mondiale)',
      'Observation du retour spectaculaire des pirogues de pêcheurs à Guet Ndar',
      'Navigation sur le fleuve Sénégal en pirogue ou à bord du Bou el Mogdad',
      'Soirée musicale Jazz dans les établissements culturels de l\'île'
    ],
    specialties: [
      'Thiéboudienne Penda Mbaye (version historique et raffinée du riz au poisson)',
      'Thiakry (Dessert onctueux de couscous de mil au yaourt sucré)',
      'Jus de Gingembre épicé et rafraîchissant',
      'Beignets de mil locaux',
      'Poisson braisé du fleuve Saint-Louisien'
    ],
    localTips: [
      'Le parc du Djoudj est la 3ème réserve ornithologique au monde. Un spectacle incontournable de pélicans et de flamants roses !',
      'Faites un tour au coucher du soleil sur la Langue de Barbarie.',
      'Sirotez un jus de bissap frais sur une terrasse face au fleuve.'
    ],
    coordinates: { lat: 16.0178, lng: -16.5028 }
  },
  {
    id: 'dest_kedougou',
    name: 'Kédougou',
    description: 'Terre d\'aventure, de cascades et de montagnes majestueuses.',
    longDescription: 'Située à l\'extrême sud-est du Sénégal, Kédougou est une région de relief et de forêts, tout en contrastes avec les plaines du nord. C\'est la terre d\'élection du tourisme d\'aventure. Ici, les pistes ocre serpentent à travers les contreforts du Fouta Djallon, menant à des cascades spectaculaires et à des villages isolés habités par les minorités ethniques Bédik et Bassari, aux traditions millénaires préservées.',
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80', // Waterfall forest lookalike
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=600&q=80', // Natural stream
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'  // Green hills
    ],
    highlights: [
      'La vertigineuse cascade de Dindéfélo (plus de 100m de hauteur)',
      'Randonnée dans les villages de montagne Bédik (Ibel, Bandafassi)',
      'Observation des chimpanzés sauvages près de Fongolimbi',
      'Le parc national du Niokolo-Koba, dernier refuge des grands fauves',
      'Traversée à pied ou en VTT des paysages vallonnés uniques'
    ],
    activities: [
      'Trek de montagne jusqu\'au village bédik d\'Ibel et Bandafassi',
      'Baignade fraîche dans la vasque de la cascade de Dindéfélo',
      'Randonnée d\'observation des chimpanzés sauvages à Fongolimbi',
      'Safari 4x4 ou pédestre dans le Parc National du Niokolo-Koba',
      'Visite d\'un site traditionnel de lavage d\'or artisanal'
    ],
    specialties: [
      'Mafé (Ragoût de viande de bœuf ou de poulet à la pâte d\'arachide crémeuse)',
      'Bouillie de Fonio sauvage forestier',
      'Miel sauvage naturel de la forêt de Kédougou',
      'Thiéboudienne de viande de brousse locale',
      'Jus de Ditakh (fruit vert sauvage de brousse)'
    ],
    localTips: [
      'Prenez de bonnes chaussures de marche, les randonnées bédiks grimpent sec sur de la caillasse !',
      'Baignez-vous au pied de la cascade de Dindéfélo, l\'eau y est fraîche et revigorante toute l\'année.',
      'Faites appel à un guide local agréé pour bien comprendre l\'histoire et la culture complexe des communautés montagnardes.'
    ],
    coordinates: { lat: 12.55, lng: -12.1833 }
  }
];

export const INITIAL_ESTABLISHMENTS: Establishment[] = [
  {
    id: 'est_1',
    name: 'L\'Hôtel Teranga les Almadies',
    description: 'Un luxueux hôtel de bord de mer offrant une vue imprenable sur l\'océan et un service cinq étoiles digne de l\'hospitalité sénégalaise.',
    location: 'Dakar',
    type: 'hotel',
    ownerId: 'user_prof_dakar',
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    amenities: ['Piscine à débordement', 'Plage privée', 'Spa & Massage', 'Restaurant gastronomique', 'Wi-Fi ultra-rapide', 'Climatisation'],
    contactEmail: 'contact@teranga-almadies.sn',
    contactPhone: '+221 33 820 12 12'
  },
  {
    id: 'est_2',
    name: 'Ecolodge des Collines de Ndangane',
    description: 'Niché au cœur du delta du Sine Saloum, cet écolodge propose des bungalows en paille traditionnels au bord de l\'eau, alimentés à 100% à l\'énergie solaire.',
    location: 'Sine Saloum',
    type: 'campement',
    ownerId: 'user_prof_saloum',
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6,
    amenities: ['Énergie Solaire', 'Pirogues privées', 'Repas inclus (locavore)', 'Excursions oiseaux', 'Pas de Wi-Fi (Déconnexion)', 'Ventilateur éco'],
    contactEmail: 'contact@ecolodge-ndangane.sn',
    contactPhone: '+221 77 550 44 33'
  },
  {
    id: 'est_3',
    name: 'Maison d\'hôtes Dialaw Cap Skirring',
    description: 'Une maison d\'hôtes familiale et paisible à 2 minutes à pied de la plus belle plage de sable blanc de la Casamance.',
    location: 'Casamance',
    type: 'maison_hotes',
    ownerId: 'user_prof_casamance',
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    amenities: ['Accès direct plage', 'Jardin tropical', 'Cuisine partagée', 'Location de vélos', 'Climatisation', 'Wi-Fi gratuit'],
    contactEmail: 'dialaw.cap@gmail.com',
    contactPhone: '+221 78 120 40 50'
  },
  {
    id: 'est_4',
    name: 'Hôtel Résidence Ndar',
    description: 'Une ancienne bâtisse coloniale restaurée avec goût au cœur de l\'île historique de Saint-Louis, alliant confort moderne et charme d\'époque.',
    location: 'Saint-Louis',
    type: 'hotel',
    ownerId: 'user_prof_stlouis',
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.5,
    amenities: ['Patio intérieur fleuri', 'Bibliothèque historique', 'Climatisation', 'Restaurant sur le fleuve', 'Wi-Fi gratuit', 'Navette aéroport'],
    contactEmail: 'residence.ndar@orange.sn',
    contactPhone: '+221 33 961 15 15'
  },
  {
    id: 'est_5',
    name: 'Campement Éco-Trek Dindéfélo',
    description: 'Bâtis en matériaux locaux par l\'association villageoise, nos bungalows vous installent au plus près de la magnifique cascade et de la forêt de chimpanzés.',
    location: 'Kédougou',
    type: 'campement',
    ownerId: 'user_prof_kedougou',
    status: 'approved',
    images: [
      'https://images.unsplash.com/photo-14441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.4,
    amenities: ['Guides de trek agrées', 'Source d\'eau naturelle', 'Repas traditionnels', 'Camp de feu de bois', 'Douches écologiques', 'Proche de la cascade'],
    contactEmail: 'dindefelo.ecotrek@gmail.com',
    contactPhone: '+221 77 123 45 67'
  },
  {
    id: 'est_6',
    name: 'Le Baobab Bleu',
    description: 'Nouvel hôtel d\'affaires et de loisirs à Dakar Plateau, en cours d\'enregistrement pour apporter une touche sénégalaise contemporaine.',
    location: 'Dakar',
    type: 'hotel',
    ownerId: 'user_prof_dakar2',
    status: 'pending', // Unapproved, requires admin validation
    images: [
      'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 0.0,
    amenities: ['Climatisation', 'Wi-Fi', 'Salle de conférence', 'Rooftop Bar'],
    contactEmail: 'contact@baobabbleu.sn',
    contactPhone: '+221 33 899 99 99'
  },
  {
    id: 'est_agence_1',
    name: 'Dakar Horizons (Agence)',
    description: 'Agence de référence pour explorer Dakar, l\'île de Gorée et les spots de surf. Circuits culturels et de glisse encadrés par des guides professionnels locaux.',
    location: 'Dakar',
    type: 'agence',
    ownerId: 'user_agency_dakar',
    status: 'approved',
    images: ['https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    amenities: ['Guides multilingues', 'Pirogues privées', 'Équipements de surf', 'Véhicule 4x4 Climatisé', 'Navette hôtelière'],
    contactEmail: 'contact@dakar-horizons.sn',
    contactPhone: '+221 77 121 21 21'
  },
  {
    id: 'est_agence_2',
    name: 'Sine Saloum Eco-Voyages (Agence)',
    description: 'Spécialiste du tourisme vert et responsable dans le delta du Sine Saloum. Nous organisons des randonnées en pirogue à rames et des observations ornithologiques silencieuses.',
    location: 'Sine Saloum',
    type: 'agence',
    ownerId: 'user_agency_saloum',
    status: 'approved',
    images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8,
    amenities: ['Pirogues traditionnelles', 'Jumelles d\'observation', 'Guides écolos agrées', 'Repas forestiers bio', 'Immersion villageoise'],
    contactEmail: 'contact@saloum-ecovoyages.sn',
    contactPhone: '+221 77 232 32 32'
  },
  {
    id: 'est_agence_3',
    name: 'Casamance Découverte (Agence)',
    description: 'Une agence locale pour une immersion totale et respectueuse au cœur des royaumes Diola, entre forêts de fromagers et bolongs préservés.',
    location: 'Casamance',
    type: 'agence',
    ownerId: 'user_agency_casamance',
    status: 'approved',
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'],
    rating: 4.7,
    amenities: ['Vélos tout terrain', 'Pirogues motorisées', 'Rencontre du Roi d\'Oussouye', 'Hébergement chez l\'habitant', 'Musique Diola'],
    contactEmail: 'casamance.decouverte@gmail.com',
    contactPhone: '+221 77 343 43 43'
  },
  {
    id: 'est_agence_4',
    name: 'Ndar History & Nature (Agence)',
    description: 'Parcourez l\'histoire coloniale de Saint-Louis en calèche et découvrez le sanctuaire exceptionnel des oiseaux du Djoudj.',
    location: 'Saint-Louis',
    type: 'agence',
    ownerId: 'user_agency_stlouis',
    status: 'approved',
    images: ['https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    amenities: ['Calèche privée', 'Guide historien certifié', '4x4 climatisé pour le Djoudj', 'Matériel de repérage d\'oiseaux', 'Boissons locales fraîches'],
    contactEmail: 'contact@ndar-history.sn',
    contactPhone: '+221 77 454 54 54'
  },
  {
    id: 'est_agence_5',
    name: 'Kédougou Trekking & Safari (Agence)',
    description: 'L\'aventure par excellence : treks sportifs dans les contreforts du Fouta Djallon, découverte des villages Bédik et Bassari, et safaris mémorables.',
    location: 'Kédougou',
    type: 'agence',
    ownerId: 'user_agency_kedougou',
    status: 'approved',
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'],
    rating: 4.6,
    amenities: ['Guides de montagne', 'Sacs et bâtons de marche', 'Logistique camp de brousse', 'Véhicule tout-terrain de safari', 'Porteurs locaux'],
    contactEmail: 'contact@kedougou-trekking.sn',
    contactPhone: '+221 77 565 65 65'
  }
];

export const INITIAL_OFFERS: Offer[] = [
  // For est_1 (Hôtel Teranga les Almadies)
  {
    id: 'off_1_1',
    establishmentId: 'est_1',
    title: 'Suite Junior Vue Océan',
    description: 'Une suite spacieuse de 45m² équipée d\'un lit King-size, d\'un balcon privé donnant sur l\'Atlantique et d\'une salle de bain luxueuse.',
    price: 120000, // in XOF
    capacity: 2,
    services: ['Petit-déjeuner buffet inclus', 'Accès spa gratuit', 'Climatisation', 'Service de chambre 24h/24', 'Cafetière Nespresso'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 4
  },
  {
    id: 'off_1_2',
    establishmentId: 'est_1',
    title: 'Chambre Double Premium',
    description: 'Chambre confortable équipée d\'un lit Queen-size, coin bureau, minibar et accès gratuit à la plage privée et aux piscines.',
    price: 85000,
    capacity: 2,
    services: ['Wi-Fi haut débit', 'Climatisation', 'Bouteille d\'eau quotidienne', 'Chaînes satellite'],
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 8
  },

  // For est_2 (Ecolodge Sine Saloum)
  {
    id: 'off_2_1',
    establishmentId: 'est_2',
    title: 'Bungalow Traditionnel sur l\'Eau',
    description: 'Cabane en bois et chaume bâtie sur pilotis au-dessus des eaux calmes du fleuve. Réveillez-vous au chant des oiseaux migrateurs.',
    price: 45000,
    capacity: 2,
    services: ['Pension complète incluse', 'Transfert en pirogue gratuit', 'Moustiquaire double', 'Terrasse d\'observation'],
    images: ['https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 3
  },
  {
    id: 'off_2_2',
    establishmentId: 'est_2',
    title: 'Bungalow Familial des Collines',
    description: 'Idéal pour les familles, ce grand bungalow abrite 1 lit double et 2 lits simples. Vue imprenable sur la brousse et les forêts de palmiers.',
    price: 65000,
    capacity: 4,
    services: ['Pension complète incluse', 'Excursion guidée gratuite', 'Éclairage solaire durable'],
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 2
  },

  // For est_3 (Dialaw Cap Skirring)
  {
    id: 'off_3_1',
    establishmentId: 'est_3',
    title: 'Chambre Double Côté Jardin',
    description: 'Chambre lumineuse ouverte sur un magnifique jardin tropical de manguiers et de bougainvilliers. Climatisation écologique.',
    price: 32000,
    capacity: 2,
    services: ['Petit-déjeuner continental', 'Wi-Fi gratuit', 'Service de ménage', 'Moustiquaire'],
    images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 5
  },

  // For est_4 (Hôtel Ndar)
  {
    id: 'off_4_1',
    establishmentId: 'est_4',
    title: 'Chambre Coloniale Historique',
    description: 'Meublée avec d\'authentiques meubles d\'époque en bois précieux, cette chambre de caractère surplombe le patio intérieur fleuri.',
    price: 50000,
    capacity: 2,
    services: ['Petit-déjeuner inclus', 'Climatisation', 'Télévision écran plat', 'Eau chaude'],
    images: ['https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 4
  },

  // For est_5 (Eco-Trek Dindéfélo)
  {
    id: 'off_5_1',
    establishmentId: 'est_5',
    title: 'Bungalow Case Traditionnelle',
    description: 'Un logement simple mais propre et authentique en briques de latérite et toit en paille, situé à quelques minutes à pied de la cascade.',
    price: 20000,
    capacity: 2,
    services: ['Dîner traditionnel inclus', 'Service de guide forestier', 'Eau fraîche de source'],
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 6
  },

  // AGENCY CIRCUITS
  // For est_agence_1 (Dakar Horizons)
  {
    id: 'off_ag1_1',
    establishmentId: 'est_agence_1',
    title: 'Circuit Teranga Dakar & Gorée',
    description: 'Circuit d\'une journée complète : traversée en chaloupe, visite émouvante de la Maison des Esclaves de Gorée avec guide historien, déjeuner Thieboudienne face au port, puis montée du Monument de la Renaissance et coucher de soleil aux Almadies.',
    price: 45000,
    capacity: 8,
    services: ['Billet chaloupe inclus', 'Guide historien certifié', 'Déjeuner traditionnel & jus locaux', 'Entrée aux monuments', 'Transport climatisé'],
    images: ['https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 15
  },
  {
    id: 'off_ag1_2',
    establishmentId: 'est_agence_1',
    title: 'Dakar Surf Camp & Ngor',
    description: 'Découvrez les meilleurs spots de glisse du Sénégal ! Initiation au surf sur la plage des Almadies, puis après-midi tranquille et artistique sur l\'île de Ngor.',
    price: 55000,
    capacity: 4,
    services: ['Planche de surf & combinaison', 'Moniteur breveté', 'Pirogues aller-retour pour Ngor', 'Snack bio', 'Photos du circuit'],
    images: ['https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 10
  },

  // For est_agence_2 (Sine Saloum Eco-Voyages)
  {
    id: 'off_ag2_1',
    establishmentId: 'est_agence_2',
    title: 'Rando-Pirogue & Bolongs Sauvages',
    description: 'Une journée de pure déconnexion écologique. Glissez silencieusement dans les bolongs du Sine Saloum, observez les hérons et pélicans, visitez l\'île aux coquillages de Joal-Fadiouth et admirez le baobab géant de Fadial.',
    price: 35000,
    capacity: 10,
    services: ['Pirogue traditionnelle à rames', 'Guide éco-responsable', 'Jumelles de rechange', 'Déjeuner grillades sur une île déserte', 'Miel sauvage offert'],
    images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 12
  },

  // For est_agence_3 (Casamance Découverte)
  {
    id: 'off_ag3_1',
    establishmentId: 'est_agence_3',
    title: 'Trek Mystique des cases à impluvium',
    description: 'Découvrez l\'incroyable ingénierie locale Diola. Randonnée guidée à vélo d\'Enampore à Oussouye, nuit dans une case traditionnelle, rencontre respectueuse avec le Roi d\'Oussouye pour comprendre la Teranga sacrée de la Casamance.',
    price: 40000,
    capacity: 6,
    services: ['VTT haut de gamme fourni', 'Nuitée en case d\'hôte', 'Repas Caldou authentique', 'Cérémonie d\'accueil', 'Vin de palme matinal'],
    images: ['https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 8
  },

  // For est_agence_4 (Ndar History & Nature)
  {
    id: 'off_ag4_1',
    establishmentId: 'est_agence_4',
    title: 'Safari Ornithologique au Parc du Djoudj',
    description: 'Vivez le spectacle de la 3e réserve ornithologique au monde. Excursion en pirogue à moteur au cœur de la héronnière et du reposoir des pélicans. Retour historique de l\'île coloniale de Ndar en calèche.',
    price: 50000,
    capacity: 12,
    services: ['Véhicule 4x4 Climatisé', 'Pirogue motorisée au Djoudj', 'Entrée du parc national', 'Balade en calèche de Saint-Louis', 'Boisson au bissap'],
    images: ['https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 20
  },

  // For est_agence_5 (Kédougou Trekking & Safari)
  {
    id: 'off_ag5_1',
    establishmentId: 'est_agence_5',
    title: 'Trek de la Cascade de Dindéfélo & Sommets Bédik',
    description: 'Le circuit d\'aventure suprême du Sénégal. Trek d\'Ibel à travers la caillasse pour atteindre les cases traditionnelles de Bandafassi, puis immersion sous la fraîcheur de la vertigineuse cascade de Dindéfélo pour une baignade bien méritée.',
    price: 30000,
    capacity: 10,
    services: ['Guide de trekking certifié', 'Bâtons de randonnée', 'Repas Mafé sous les fromagers', 'Frais d\'accès aux villages', 'Assurance assistance'],
    images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'],
    availableQuantity: 15
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    establishmentId: 'est_1',
    authorName: 'Jean-Pierre L.',
    rating: 5,
    comment: 'Un séjour exceptionnel ! Le personnel est incroyablement attentionné. La vue sur la plage des Almadies depuis la suite junior est incroyable. La véritable Teranga.',
    createdAt: '2026-06-15'
  },
  {
    id: 'rev_2',
    establishmentId: 'est_1',
    authorName: 'Mariama D.',
    rating: 4,
    comment: 'Magnifique plage privée, petit-déjeuner très varié avec d\'excellents jus de bissap et bouye locaux. Seul petit bémol, le service au restaurant est parfois un peu lent.',
    createdAt: '2026-06-20'
  },
  {
    id: 'rev_3',
    establishmentId: 'est_2',
    authorName: 'Amadou S.',
    rating: 5,
    comment: 'Une déconnexion totale et nécessaire. Vivre au rythme du fleuve et des oiseaux dans ce delta est magique. La nourriture était délicieuse et cuisinée localement.',
    createdAt: '2026-05-28'
  },
  {
    id: 'rev_4',
    establishmentId: 'est_3',
    authorName: 'Sarah K.',
    rating: 4,
    comment: 'Très bon accueil chaleureux. La plage est immense et presque pour nous seuls. Les vélos de location permettent de jolies promenades.',
    createdAt: '2026-06-10'
  },
  {
    id: 'rev_5',
    establishmentId: 'est_4',
    authorName: 'Abdoulaye N.',
    rating: 5,
    comment: 'Magnifique résidence historique au cœur de Saint-Louis. Le patio est un havre de calme après une journée de calèche sous le soleil.',
    createdAt: '2026-06-02'
  }
];
