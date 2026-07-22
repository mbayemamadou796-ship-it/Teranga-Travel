/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Destination, Establishment, Offer, Review } from '../shared/types';

export const INITIAL_DESTINATIONS: Destination[] = [
  {
    id: 'dest_dakar',
    name: 'Dakar',
    description: 'Capitale vibrante entre culture, histoire et océan.',
    longDescription: 'Dakar, la capitale du Sénégal, est une métropole dynamique bâtie sur une péninsule face à l\'océan Atlantique. Elle offre un contraste fascinant entre la modernité urbaine et la mémoire historique de l\'île de Gorée, classée à l\'UNESCO. Connue pour ses marchés animés, son art contemporain florissant et son ambiance musicale légendaire, Dakar est le point de départ idéal pour tout voyageur.',
    coverImage: 'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80'
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
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80'
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
    coverImage: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Les plages sauvages et paradisiaques de Cap Skirring',
      'L\'architecture unique des cases à impluvium d\'Enampore',
      'Randonnée à vélo entre de majestueux arbres fromagers géants',
      'Le musée de la culture Diola à Carabane',
      'Rencontre et salutation avec le Roi d\'Oussouye'
    ],
    activities: [
      'Détente et baignade sur les plages de Cap Skirring',
      'Circuit VTT à travers les rizières et forêts d\'Enampore',
      'Kayak de mer dans les méandres du fleuve Casamance',
      'Cérémonies culturelles et danses traditionnelles Kumpo',
      'Dégustation du vin de palme frais récolté le matin'
    ],
    specialties: [
      'Poulet Yassa (Poulet mariné au citron vert et aux oignons)',
      'Caldou (Poisson mijoté à l\'huile de palme et légumes)',
      'Jus de Ditakh (Fruit tropical rafraîchissant)',
      'Riz local aromatique de Casamance',
      'Crevettes géantes de Ziguinchor'
    ],
    localTips: [
      'Prenez le temps d\'échanger avec les villageois, l\'accueil casamanceais est légendaire.',
      'Si vous visitez Oussouye, respectez les règles coutumières lors de la rencontre avec le Roi.',
      'Goutez au Yassa préparé sur place, son goût est incomparable avec le riz local.'
    ],
    coordinates: { lat: 12.5833, lng: -16.2667 }
  },
  {
    id: 'dest_saint_louis',
    name: 'Saint-Louis',
    description: 'Charme colonial, fleuve majestueux et festival de Jazz.',
    longDescription: 'Ancienne capitale du Sénégal et de l\'Afrique Occidentale Française (AOF), Saint-Louis (Ndar en wolof) est une ville insulaire chargée d\'histoire, classée à l\'UNESCO. Relée au continent par le célèbre pont Faidherbe conçu par Eiffel, elle captive par ses façades coloniales colorées, ses calèches nostalgiques, sa scène artistique bouillonnante et sa proximité avec les parcs naturels.',
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'Le centre historique sur l\'île et le Pont Faidherbe',
      'Le Parc National des Oiseaux du Djoudj (UNESCO)',
      'La Langue de Barbarie et ses plages de pêcheurs',
      'Le quartier coloré des pêcheurs de Guet Ndar',
      'Le célèbre Festival International de Jazz de Saint-Louis'
    ],
    activities: [
      'Visite de la ville coloniale en calèche traditionnelle',
      'Safari ornithologique en pirogue au Parc du Djoudj',
      'Balade en bateau sur le fleuve Sénégal',
      'Exploration du quartier vibrant des pêcheurs de Guet Ndar',
      'Soirées musicales jazz dans les résidences d\'artistes'
    ],
    specialties: [
      'Thiéboudienne Penda Mbaye (Variant rouge du plat national né à Saint-Louis)',
      'Thiary (Dessert à base de semoule de mil et lait caillé)',
      'Poisson grillé à la braise de Guet Ndar',
      'Boules de Mousse de Mango'
    ],
    localTips: [
      'Réservez vos places longtemps à l\'avance si vous venez pendant le Festival de Jazz en mai.',
      'Le Parc du Djoudj se visite idéalement entre novembre et avril lors de la migration des oiseaux.',
      'Faites un tour en calèche en fin d\'après-midi pour capturer la douce lumière sur le fleuve.'
    ],
    coordinates: { lat: 16.0333, lng: -16.5 }
  },
  {
    id: 'dest_kedougou',
    name: 'Kédougou',
    description: 'Reliefs sauvages, cascades spectaculaires et traditions Bassari.',
    longDescription: 'Située à l\'extrême sud-est du Sénégal, Kédougou est la porte d\'entrée d\'un univers montagneux d\'une beauté sauvage à couper le souffle. Dominée par les contreforts du Fouta Djallon, cette région abrite la plus haute cascade du pays (Dindéfélo) et les paysages culturels uniques des peuples Bassari, Bédik et Coniagui, classés au patrimoine mondial de l\'UNESCO.',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1434394354979-a235cd36269d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
    ],
    highlights: [
      'La majestueuse cascade de Dindéfélo (100 mètres de hauteur)',
      'Le village perché Bédik d\'Ibel et Bandafassi',
      'Le Parc National du Niokolo-Koba (faune sauvage)',
      'Les villages traditionnels Bassari isolés dans les montagnes',
      'Les orpailleuses traditionnelles le long du fleuve Gambie'
    ],
    activities: [
      'Randonnée Pédestre et trekking dans les collines Bédik et Bassari',
      'Baignade rafraîchissante dans le bassin naturel de la cascade de Dindéfélo',
      'Safari photo au Parc National du Niokolo-Koba',
      'Rencontre interculturelle avec les communautés villageoises',
      'Orpaillage artisanal d\'apprentissage sur les berges'
    ],
    specialties: [
      'Mafé d\'arachide sauvage (Sauce de pâte d\'arachide locale riche)',
      'Fondé (Bouillie de mil traditionnelle du matin)',
      'Miel de forêt de montagne',
      'Jus de Gingembre sauvage et Tamarindo'
    ],
    localTips: [
      'Prévoyez de bonnes chaussures de marche/trekking pour l\'ascension des villages Bédik.',
      'Un guide local homologué est indispensable pour aborder avec respect les coutumes Bassari.',
      'Emportez un vêtement chaud pour les nuits fraîches en altitude pendant la saison sèche.'
    ],
    coordinates: { lat: 12.55, lng: -12.1833 }
  }
];

export const INITIAL_ESTABLISHMENTS: Establishment[] = [
  {
    id: 'est_1',
    name: 'Hôtel Teranga & Spa Almadies',
    type: 'hotel',
    description: 'Un havre de paix éco-responsable surplombant l\'océan Atlantique à la pointe des Almadies. Profitez de chambres spacieuses décorées par des artisans locaux, d\'une piscine à débordement et d\'une cuisine raffinée aux saveurs de la mer.',
    location: 'Dakar',
    address: 'Pointe des Almadies, BP 12000, Dakar',
    status: 'approved',
    contactEmail: 'contact@hotel-teranga-almadies.sn',
    contactPhone: '+221 33 820 12 34',
    rating: 4.8,
    reviewsCount: 24,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wifi Haut Débit', 'Piscine Océanique', 'Restaurant Gastronomique', 'Spa & Massage', 'Climatisation Éco', 'Parking Sécurisé'],
    ownerId: 'user_prof_dakar'
  },
  {
    id: 'est_2',
    name: 'Ecolodge du Saloum',
    type: 'campement',
    description: 'Sanctuaire naturel niché au bord d\'un bolong calme. Logez dans des bungalows traditionnels sur pilotis construits en matériaux locaux. Observation privilégiée des oiseaux et immersion totale dans la sérénité du delta.',
    location: 'Sine Saloum',
    address: 'Village de Toubacouta, Delta du Saloum',
    status: 'approved',
    contactEmail: 'reservation@ecolodge-saloum.sn',
    contactPhone: '+221 33 948 55 10',
    rating: 4.9,
    reviewsCount: 18,
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Pirogues Solaires', 'Restaurant Produits Frais', 'Panneaux Solaires 100%', 'Excursions Ornithologiques', 'Bar de Mangrove'],
    ownerId: 'user_prof_saloum'
  },
  {
    id: 'est_3',
    name: 'Maison d\'Hôtes Les Bougainvilliers',
    type: 'maison_hotes',
    description: 'Une grande demeure coloniale restaurée avec passion au cœur de l\'île historique de Gorée. Jardin tropical ombragé, terrasses avec vue sur la baie et petit-déjeuner fait maison à base de fruits frais locaux.',
    location: 'Dakar',
    address: 'Rue de la Compagnie, Île de Gorée, Dakar',
    status: 'approved',
    contactEmail: 'contact@bougainvilliers-goree.sn',
    contactPhone: '+221 33 821 44 22',
    rating: 4.7,
    reviewsCount: 31,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Wifi Gratuit', 'Jardin Tropical', 'Petit Déjeuner Inclus', 'Terrasse Végétalisée', 'Service de Guide Historien'],
    ownerId: 'user_prof_dakar'
  },
  {
    id: 'est_4',
    name: 'Cap Skirring Ocean Lodge',
    type: 'hotel',
    description: 'Bungalows de charme sous une cocoteraie luxuriante au bord de la plage de sable fin de Cap Skirring. Idéal pour des vacances de détente entre océan Atlantique et forêts de Casamance.',
    location: 'Casamance',
    address: 'Route des Plages, Cap Skirring',
    status: 'pending',
    contactEmail: 'info@cap-ocean-lodge.sn',
    contactPhone: '+221 33 993 50 00',
    rating: 4.6,
    reviewsCount: 12,
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Plage Privée', 'Restaurant Grill Océan', 'Piscine', 'Activité Pêche & Kayak'],
    ownerId: 'user_prof_saloum'
  },
  {
    id: 'est_agence_1',
    name: 'Dakar Teranga Tours & Excursions',
    type: 'agence',
    description: 'Agence de voyages réceptive agréée par le Ministère du Tourisme. Spécialisée dans l\'organisation de circuits personnalisés à Dakar, Gorée, le Lac Rose et le Sine Saloum avec chauffeurs et guides professionnels.',
    location: 'Dakar',
    address: 'Avenue Léopold Sédar Senghor, Dakar Plateau',
    status: 'approved',
    contactEmail: 'contact@dakarterangatours.sn',
    contactPhone: '+221 33 823 88 00',
    rating: 4.9,
    reviewsCount: 42,
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Véhicules Climatisés VIP', 'Guides Bilingues FR/EN', 'Circuits Sur Mesure', 'Assurance Voyage Incluse'],
    ownerId: 'user_agency_dakar'
  },
  {
    id: 'est_agence_2',
    name: 'Saloum Eco-Aventures & Pirogues',
    type: 'agence',
    description: 'Opérateur local engagé dans l\'écotourisme communautaire dans le delta du Sine Saloum. Excursions en pirogues traditionnelles, safaris ornithologiques et nuits chez l\'habitant dans les îles.',
    location: 'Sine Saloum',
    address: 'Embarcadère Principal, Ndangane Campement',
    status: 'approved',
    contactEmail: 'contact@saloum-ecoaventures.sn',
    contactPhone: '+221 33 949 11 22',
    rating: 4.8,
    reviewsCount: 29,
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Piroguiers Certifiés', 'Gilets de Sauvetage Enfants/Adultes', 'Repas Grillades Pêche du Jour', 'Matériel de Pêche'],
    ownerId: 'user_agency_saloum'
  },
  {
    id: 'est_agence_3',
    name: 'Casamance Evasion & Randonnées',
    type: 'agence',
    description: 'Spécialiste du tourisme d\'aventure solidaire en Casamance. Circuits à vélo VTT, randonnées dans les cases à impluvium et balades en kayak dans les bolongs d\'Oussouye.',
    location: 'Casamance',
    address: 'Quartier Escale, Ziguinchor',
    status: 'approved',
    contactEmail: 'info@casamance-evasion.sn',
    contactPhone: '+221 33 991 33 44',
    rating: 4.9,
    reviewsCount: 35,
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['VTT Récents Fournis', 'Guides Locaux Diolas', 'Hébergement en Campements Villageois', 'Assurance Rapatriement'],
    ownerId: 'user_agency_casamance'
  },
  {
    id: 'est_guide_1',
    name: 'Ousmane Sow - Guide National Diplômé',
    type: 'guide',
    description: 'Guide touristique officiel passionné par l\'histoire de la Sénégambie et la culture wolof. 12 ans d\'expérience dans l\'accompagnement de groupes, familles et voyageurs solo à Gorée, Dakar et Saint-Louis.',
    location: 'Dakar',
    address: 'Dakar & Gorée (Disponible sur tout le Sénégal)',
    status: 'approved',
    contactEmail: 'ousmane.guide@teranga.sn',
    contactPhone: '+221 77 654 32 10',
    rating: 5.0,
    reviewsCount: 58,
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    ],
    amenities: ['Carte Officielle Ministère du Tourisme', 'Français / Anglais / Wolof', 'Expertise Histoire & Patrimoine', 'Personnalisation d\'Itinéraires'],
    ownerId: 'user_guide_ousmane'
  },
  {
    id: 'est_guide_2',
    name: 'Awa Sané - Guide Écotourisme & Nature Casamance',
    type: 'guide',
    description: 'Native d\'Enampore, Awa vous emmène à la découverte des secrets de la forêt casamançaise, de la médecine traditionnelle par les plantes et des traditions mystiques du royaume d\'Oussouye.',
    location: 'Casamance',
    address: 'Oussouye & Cap Skirring, Casamance',
    status: 'approved',
    contactEmail: 'awa.sane@teranga.sn',
    contactPhone: '+221 77 512 89 90',
    rating: 4.9,
    reviewsCount: 22,
    images: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    ],
    amenities: ['Botanique & Ethnobotanique', 'Français / Wolof / Diola', 'Circuit Éco-Solidaire', 'Atelier Cuisine Traditionnelle'],
    ownerId: 'user_guide_awa'
  }
];

export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'off_1',
    establishmentId: 'est_1',
    title: 'Suite Junior Vue Océan & Balcon Private',
    description: 'Superbe suite climatisée avec lit King Size, salle de bain en marbre local, coin salon et vaste balcon privé offrant une vue panoramique directe sur le coucher de soleil des Almadies.',
    price: 65000,
    quantity: 4,
    capacity: 2,
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
    ],
    services: ['Petit Déjeuner Buffet Inclus', 'Accès Spa & Hammam', 'Cocktail de Bienvenue Au Bissap', 'Wifi Premium Direct line'],
    status: 'approved'
  },
  {
    id: 'off_2',
    establishmentId: 'est_1',
    title: 'Chambre Deluxe Jardin Tropical',
    description: 'Chambre cocon au calme donnant sur les bougainvilliers du jardin intérieur. Décoration soignée mêlant bois de teck et tissus africains contemporains.',
    price: 45000,
    quantity: 8,
    capacity: 2,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
    ],
    services: ['Petit Déjeuner Inclus', 'Piscine Accessible 24/7', 'Machine à Café Espresso'],
    status: 'approved'
  },
  {
    id: 'off_3',
    establishmentId: 'est_2',
    title: 'Bungalow Traditionnel Sur Pilotis (Eco-lodge)',
    description: 'Bungalow individuel construit en paille de typha et bois flotté avec terrasse au-dessus de l\'eau. Endormez-vous au doux clapotis des bolongs et réveillez-vous au chant des martins-pêcheurs.',
    price: 35000,
    quantity: 6,
    capacity: 3,
    images: [
      'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80'
    ],
    services: ['Demi-Pension (Dîner du Soir & Petit Déjeuner)', 'Balade en Pirogue Découverte (1h)', 'Électricité Solaire 220V'],
    status: 'approved'
  },
  {
    id: 'off_4',
    establishmentId: 'est_3',
    title: 'Chambre Historique "Maison Coloniale"',
    description: 'Chambre de charme aux hauts plafonds et parquets en bois ancien. Fenêtres ouvrant sur le jardin ombragé de la cour intérieure de Gorée.',
    price: 38000,
    quantity: 3,
    capacity: 2,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    services: ['Petit Déjeuner Gourmand', 'Thé à la Menthe & Jus Frais à Volonté', 'Billet de Chaloupe Assistance'],
    status: 'approved'
  },
  {
    id: 'off_ag1_1',
    establishmentId: 'est_agence_1',
    title: 'Circuit "Journée Histoire & Culture" : Gorée & Dakar Vibrant',
    description: 'Une journée d\'immersion complète guidée : traversée en chaloupe pour Gorée, visite guidée de la Maison des Esclaves, déjeuner traditionnel de Thiéboudienne face à la mer, puis tour de ville de Dakar (Monument de la Renaissance, Marché Soumbédioune, Almadies).',
    price: 35000,
    quantity: 10,
    capacity: 15,
    images: [
      'https://images.unsplash.com/photo-1596120244118-19fa90de504c?auto=format&fit=crop&w=800&q=80'
    ],
    services: ['Billets Chaloupe Aller-Retour', 'Guide Historien Agréé', 'Déjeuner Complet + Boisson Local', 'Transport Privé Climatisé'],
    status: 'approved'
  },
  {
    id: 'off_ag1_2',
    establishmentId: 'est_agence_1',
    title: 'Stage Surf & Escapade Artistique à l\'Île de Ngor',
    description: 'Journée tonique comprenant un cours de surf de 2h sur la presqu\'île des Almadies avec moniteur diplômé, matériel fourni, suivi d\'une traversée en pirogue vers l\'île de Ngor pour une visite des ateliers d\'artistes et un déjeuner poisson grillé.',
    price: 28000,
    quantity: 8,
    capacity: 8,
    images: [
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80'
    ],
    services: ['Planche & Combinaison Fournies', 'Moniteur de Surf Certifié', 'Traversée Pirogue Ngor', 'Photos Souvenirs de la Session'],
    status: 'approved'
  },
  {
    id: 'off_ag2_1',
    establishmentId: 'est_agence_2',
    title: 'Excursion Pirogue Bolongs & Île aux Coquillages de Fadiouth',
    description: 'Au départ de Ndangane ou Toubacouta, glissez en pirogue silencieuse au cœur de la mangrove. Observation des flamants roses et hérons, puis escale à Joal-Fadiouth pour visiter l\'île bâtie sur des coquillages et son cimetière mixte unique.',
    price: 25000,
    quantity: 5,
    capacity: 12,
    images: [
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
    ],
    services: ['Pirogue Traditionnelle & Piroguier Guide', 'Jumelles d\'Observation d\'Oiseaux', 'Déjeuner Grillades Pêche du Jour', 'Droit d\'Entrée Fadiouth'],
    status: 'approved'
  },
  {
    id: 'off_ag3_1',
    establishmentId: 'est_agence_3',
    title: 'Randonnée VTT & Nuit en Case à Impluvium d\'Enampore (2 jours / 1 nuit)',
    description: 'Circuit aventure éco-responsable à vélo à travers les pistes ocre de Casamance. Traversez des forêts de fromagers géants, découvrez le village d\'Enampore et dormez dans une case à impluvium traditionnelle avec dîner au feu de bois.',
    price: 55000,
    quantity: 4,
    capacity: 10,
    images: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
    ],
    services: ['VTT Tout-Terrain & Casque', 'Guide Accompanateur Diola', 'Nuitée en Case Traditionnelle', 'Tous les Repas du Circuit (Caldou/Yassa)'],
    status: 'approved'
  },
  {
    id: 'off_guide1_1',
    establishmentId: 'est_guide_1',
    title: 'Accompagnement Guide Privé à la Journée (Dakar / Gorée / Lac Rose)',
    description: 'Service d\'accompagnement sur mesure par Ousmane Sow. Conception personnalisée de votre itinéraire de la journée selon vos centres d\'intérêt (art, histoire, gastronomie, marchés).',
    price: 20000,
    quantity: 1,
    capacity: 6,
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    ],
    services: ['Guide Exclusif pour Votre Groupe', 'Conseils & Négociations Marchés', 'Explications Historiques Approfondies'],
    status: 'approved'
  },
  {
    id: 'off_guide2_1',
    establishmentId: 'est_guide_2',
    title: 'Journée Immersion Botanique & Culturelle en Casamance',
    description: 'Une journée immersive avec Awa Sané à Oussouye. Visite du village, initiation aux plantes médicinales de la forêt sacrée, rencontre respectueuse autour des traditions locales et atelier cuisine Yassa.',
    price: 18000,
    quantity: 1,
    capacity: 6,
    images: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    ],
    services: ['Guide Femme Locale Diola', 'Dégustation Jus de Fruits Sauvages', 'Atelier Cuisine & Repas Partagé'],
    status: 'approved'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    establishmentId: 'est_1',
    touristName: 'Marie & Thomas (France)',
    rating: 5,
    comment: 'Un séjour inoubliable ! Le personnel est d\'une gentillesse rare, la piscine avec vue sur le coucher de soleil est magique. Nous avons adoré la cuisine au restaurant.',
    createdAt: '2025-02-10'
  },
  {
    id: 'rev_2',
    establishmentId: 'est_1',
    touristName: 'Ibrahima K. (Sénégal)',
    rating: 4,
    comment: 'Très bel établissement aux Almadies. Idéal pour un week-end de détente au calme tout en restant à Dakar. Chambre très propre.',
    createdAt: '2025-01-28'
  },
  {
    id: 'rev_3',
    establishmentId: 'est_2',
    touristName: 'Sophie L. (Belgique)',
    rating: 5,
    comment: 'Un véritable paradis pour les amoureux de nature. Se réveiller dans un bungalow sur l\'eau avec le chant des oiseaux n\'a pas de prix. Mention spéciale pour le capitaine de pirogue !',
    createdAt: '2025-02-14'
  },
  {
    id: 'rev_4',
    establishmentId: 'est_agence_1',
    touristName: 'David & Clara (Suisse)',
    rating: 5,
    comment: 'Excursion à Gorée fantastique avec Dakar Teranga Tours ! Le guide historien connaissait chaque pierre de l\'île. Le déjeuner au bord de l\'eau était succulent.',
    createdAt: '2025-02-18'
  },
  {
    id: 'rev_5',
    establishmentId: 'est_guide_1',
    touristName: 'Antoine M. (Canada)',
    rating: 5,
    comment: 'Ousmane est le meilleur guide qu\'on puisse espérer au Sénégal ! Passionné, prévenant et d\'une culture immense. Il nous a fait découvrir des endroits secrets de Dakar.',
    createdAt: '2025-02-01'
  }
];
