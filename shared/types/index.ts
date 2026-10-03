/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'tourist' | 'professional' | 'admin';

export type PortalType = 'tourist' | 'hebergeurs' | 'circuits_guides' | 'admin';

export type ProfessionalSubType = 'hotel' | 'campement' | 'maison_hotes' | 'agence' | 'guide';

export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  userType?: 'tourist' | 'host' | 'agency' | 'guide' | 'admin';
  subType?: ProfessionalSubType;
  status?: UserStatus;
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

// ==================== PARCOURS CRITIQUE : DOSSIER DE VOYAGE COMBINÉ ==================== //

export type TravelBookingStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'PARTIALLY_CONFIRMED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REVIEW_ELIGIBLE'
  | 'REVIEW_SUBMITTED'
  | 'CANCELLED'
  | 'REJECTED';

export type BookingItemType = 'ACCOMMODATION' | 'GUIDE';

export type BookingItemStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export interface BookingItem {
  id: string;
  bookingId: string;
  type: BookingItemType;
  providerId: string; // establishmentId for host or guide
  providerName: string;
  providerOwnerId: string; // userId of the professional
  offerId: string;
  offerTitle: string;
  price: number; // in FCFA
  details: {
    roomType?: string;
    nightsCount?: number;
    durationDays?: number;
    guideName?: string;
    languages?: string[];
    specialty?: string;
  };
  status: BookingItemStatus;
  rejectionReason?: string;
  checkInDate?: string;
  completedAt?: string;
  reviewSubmitted?: boolean;
}

export interface TravelBooking {
  id: string;
  reference: string; // format TT-2026-XXXXX
  userId: string; // tourist userId
  travelerName: string;
  travelerEmail: string;
  travelerPhone?: string;
  destination: SenegalDestination;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  message?: string;
  totalPrice: number; // Total combined in FCFA
  status: TravelBookingStatus;
  items: BookingItem[];
  createdAt: string;
  updatedAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface Notification {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_rejected' | 'booking_confirmed' | 'stay_reminder' | 'stay_completed' | 'review_invite' | 'info';
  reference?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorName: string;
  action: string;
  entityType: 'TravelBooking' | 'BookingItem' | 'Review' | 'Establishment' | 'Offer';
  entityId: string;
  oldValue?: string;
  newValue?: string;
  summary: string;
  createdAt: string;
}

export interface Review {
  id: string;
  establishmentId?: string;
  bookingId?: string;
  bookingItemId?: string;
  authorUserId?: string;
  authorName?: string;
  touristName?: string;
  targetType?: 'ACCOMMODATION' | 'GUIDE';
  targetId?: string; // establishmentId or guide establishmentId
  targetName?: string;
  rating: number;
  title?: string;
  comment: string;
  verified?: boolean; // true if linked to a completed booking
  stayDate?: string; // e.g. "Séjour effectué en décembre 2026"
  status?: 'VISIBLE' | 'REPORTED' | 'HIDDEN';
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

