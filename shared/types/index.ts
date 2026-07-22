/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'tourist' | 'professional' | 'admin';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  establishmentId?: string; // Links a professional to their establishment
  phone?: string;
  preferredRegion?: SenegalDestination;
  bio?: string;
  savedOfferIds?: string[];
}

export type SenegalDestination = 'Dakar' | 'Sine Saloum' | 'Casamance' | 'Saint-Louis' | 'Kédougou';

export interface Destination {
  id: string;
  name: SenegalDestination;
  description: string;
  longDescription: string;
  coverImage: string;
  images: string[];
  localTips: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  highlights: string[];
  activities?: string[];
  specialties?: string[];
}

export type EstablishmentType = 'hotel' | 'campement' | 'maison_hotes' | 'agence' | 'guide';

export type EstablishmentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';

export interface Establishment {
  id: string;
  name: string;
  description: string;
  location: SenegalDestination;
  type: EstablishmentType;
  ownerId: string;
  status: EstablishmentStatus;
  images: string[];
  rating: number;
  amenities: string[];
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  reviewsCount?: number;
  
  // Design guide mapping extensions
  coordinates?: {
    lat: number;
    lng: number;
  };
  creatorId?: string;
  modifierId?: string;
  validatorId?: string;
  visibility?: 'public' | 'private';
  displayOrder?: number;
  usageInfo?: string;
}

export type OfferStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';

export interface OfferImage {
  url: string;
  legend: string;
  order: number;
  isCover: boolean;
}

export interface AvailabilityPeriod {
  startDate: string;
  endDate: string;
  available: boolean;
  priceOverride?: number;
}

export interface Offer {
  id: string;
  establishmentId: string;
  title: string;
  description: string;
  price: number; // normal price
  promoPrice?: number; // promotional price
  currency?: string; // e.g. "FCFA" or "XOF"
  capacity: number;
  services: string[];
  images: string[];
  availableQuantity?: number;
  quantity?: number;
  status?: OfferStatus;
  rejectionReason?: string;

  // Design guide mapping extensions
  structuredImages?: OfferImage[];
  availabilityCalendar?: AvailabilityPeriod[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  creatorId?: string;
  modifierId?: string;
  validatorId?: string;
  visibility?: 'public' | 'private';
  displayOrder?: number;
  usageInfo?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  offerId: string;
  offerTitle: string;
  establishmentId: string;
  establishmentName: string;
  touristId: string;
  touristName: string;
  touristEmail: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  establishmentId: string;
  authorName?: string;
  touristName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ItineraryRequest {
  destination: SenegalDestination | 'all';
  durationDays: number;
  travelerType: 'solo' | 'couple' | 'family' | 'friends';
  budget: 'budget' | 'medium' | 'premium';
  interests: string[];
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  content: string;
  createdAt: string;
  read?: boolean;
}

export type CommunityPostCategory = 
  | 'retours_experience'
  | 'conseils'
  | 'questions'
  | 'photos'
  | 'bonnes_adresses';

export interface Community {
  id: string;
  name: string; // Destination name e.g. "Casamance", "Dakar", "Saint-Louis", "Sine Saloum", "Kédougou", "Cap Skirring", "Île de Gorée", "Lac Rose"
  region: string;
  description: string;
  coverImage: string;
  active: boolean;
  postsCount?: number;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  destination: string; // SenegalDestination or extended spot name
  authorId: string;
  authorName: string;
  authorRole?: UserRole;
  title: string;
  content: string;
  category: CommunityPostCategory;
  imageUrl?: string;
  locationSpot?: string; // e.g. "Plage de Cap Skirring", "Île de Gorée"
  likesCount: number;
  reported: boolean;
  reportReason?: string;
  status: 'active' | 'masked' | 'deleted';
  createdAt: string;
}

