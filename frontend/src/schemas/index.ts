// --- Core Data Types ---

export interface Clinic {
  id: string;
  name: string;
  address: string;
  isOpenNow: boolean;
  openingHours: string;
  phoneNum: string;
  location: { lat: number; lng: number };
  tier?: 'verified' | 'unverified';
  isClaimed?: boolean;
  website?: string | null;
  rating?: number;
  capacityStatus?: 'accepting' | 'limited' | 'at_capacity';
  practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';
  isMobileVet?: boolean;
  isLiveLocation?: boolean;
  heading?: number;
  speed?: number;
  distance?: number; // in km
}

export interface UserLocation {
  lat: number;
  lon: number;
}

export interface LocationState {
  lat: number;
  lon: number;
}

// --- Pet Profile Types ---

export interface MedicalEvent {
  id?: string;
  _id?: string;
  date: string;
  type: 'vaccination' | 'checkup' | 'surgery' | 'illness' | 'medication' | 'other' | string;
  title: string;
  description: string;
  vetName?: string;
  clinic?: string;
  cost?: number;
}

export interface CoParentMember {
  userId: string;
  name: string;
  email?: string;
  role: 'co_parent' | 'family_member' | 'caretaker';
  addedAt: string;
}

export interface PetProfile {
  _id?: string;
  petId?: string; // Human-readable Unique Pet ID (e.g. "PET-8942-A1")
  ownerId?: string;
  ownerName?: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'reptile' | 'small_mammal' | 'other';
  breed: string;
  age: number; // in years (legacy/fallback)
  dateOfBirth?: string; // ISO date format YYYY-MM-DD
  weight: number; // in kg
  gender: 'male' | 'female';
  photoUrl?: string;
  microchipNumber?: string;
  nfcTagId?: string;
  coParents?: CoParentMember[];
  knownConditions: string[];
  allergies: string[];
  medications: string[];
  medicalHistory: MedicalEvent[];
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoParentRequest {
  _id: string;
  petId: string;
  petPassportId: string;
  petName: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  toUserId: string;
  toUserName: string;
  toUserEmail: string;
  role: 'co_parent' | 'family_member' | 'caretaker';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export function calculatePetAge(dateOfBirth?: string, fallbackAge?: number): string {
  if (!dateOfBirth) {
    return fallbackAge !== undefined ? `${fallbackAge} yrs` : 'Age unknown';
  }

  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) {
    return fallbackAge !== undefined ? `${fallbackAge} yrs` : 'Age unknown';
  }

  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0 && months <= 0) {
    return 'Less than 1 mo';
  }

  if (years === 0) {
    return `${months} ${months === 1 ? 'mo' : 'mos'}`;
  }

  if (months === 0) {
    return `${years} ${years === 1 ? 'yr' : 'yrs'}`;
  }

  return `${years} ${years === 1 ? 'yr' : 'yrs'}, ${months} ${months === 1 ? 'mo' : 'mos'}`;
}

// --- Chat Types ---

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isEmergency?: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

// --- Marketplace & Invoices Types ---

export interface PetShop {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  phone: string;
  tags: string[];
  rating?: number;
  isRegistered: boolean; // true = monetized partner, false = API backfill
  isClaimed?: boolean;
  isOpen?: boolean;
  deliveryAvailable: boolean;
  pickupOnly: boolean;
  products?: Product[];
  imageUrl?: string;
  photoUrl?: string;
  distance?: number;
  distanceKm?: number;
}

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  inStock: boolean;
  shopId: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id?: string;
  items: CartItem[];
  shopId: string;
  shopName: string;
  subtotal: number;
  serviceFee: number; // 2-3%
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  createdAt?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  description?: string;
}

export interface Receipt {
  _id?: string;
  receiptNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  type: 'marketplace' | 'grooming' | 'telehealth' | 'service' | 'emergency_deposit';
  providerName: string;
  providerAddress?: string;
  items: ReceiptItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  currency: string;
  paymentMethod: {
    type: string;
    cardBrand?: string;
    last4?: string;
    transactionId?: string;
  };
  paymentStatus: 'paid' | 'refunded';
  paidAt: string;
  createdAt?: string;
}

// --- Grooming Types ---

export interface GroomingServiceItem {
  _id?: string;
  groomerId?: string;
  name: string;
  category: 'bath_brush' | 'full_groom' | 'hygiene' | 'specialty' | 'teeth_ears';
  price: number;
  durationMinutes: number;
  description: string;
  isAvailable: boolean;
}

export interface GroomingAppointment {
  _id?: string;
  groomerId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  petId: string;
  petName: string;
  petBreed: string;
  services: Array<{ name: string; price: number; durationMinutes?: number }>;
  totalPrice: number;
  status: 'confirmed' | 'in_tub' | 'styling' | 'ready' | 'completed' | 'cancelled';
  appointmentDate: string;
  timeSlot: string;
  coatConditionNotes?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  receiptId?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt?: string;
}

// --- Community Types ---

export type UserRole =
  | 'customer'
  | 'clinic_admin'
  | 'store_merchant'
  | 'groomer_pro'
  | 'dog_walker'
  | 'shelter_org'
  | 'superadmin';

export type VerificationBadge =
  | 'none'
  | 'veterinarian'
  | 'pet_store'
  | 'pet_groomer'
  | 'dog_walker'
  | 'animal_shelter'
  | 'platform_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  handle?: string;
  isVerified?: boolean;
  verificationBadge?: VerificationBadge;
  organizationName?: string;
}

export interface StoryItem {
  _id: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorBadge?: VerificationBadge;
  authorRole?: UserRole;
  petId?: string;
  petName: string;
  petAvatar: string;
  mediaUrl: string;
  caption: string;
  type: 'moment' | 'lost_pet_sos' | 'hazard_alert' | 'playdate' | 'vet_tip' | 'store_promo';
  locationName?: string;
  contactPhone?: string;
  createdAt?: string;
  expiresAt?: string;
}

export interface PostComment {
  _id?: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt?: string | Date;
}

export interface PostItem {
  _id: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorBadge?: VerificationBadge;
  authorRole?: UserRole;
  petId?: string;
  petName: string;
  petBreed?: string;
  petAvatar: string;
  mediaUrl: string;
  caption: string;
  locationTag?: string;
  contactPhone?: string;
  category: 'cute' | 'playdate' | 'lost_found' | 'health_tip' | 'adoption' | 'vet_update' | 'promo';
  likesCount: number;
  likedBy: string[];
  comments: PostComment[];
  isFollowing?: boolean;
  createdAt?: string;
}

// --- Legacy compat ---
export interface ClinicCardListProps {
  clinics: Clinic[];
  isLoading: boolean;
}

// --- Appointments & Unified Schedule Types ---

export interface Appointment {
  _id?: string;
  petId: string;
  petPassportId?: string;
  petName: string;
  petSpecies?: string;
  petColor?: string;
  ownerId?: string;
  coParentIds?: string[];
  providerType: 'veterinarian' | 'groomer' | 'dog_walker' | 'pet_sitter' | 'clinic';
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  providerPhone?: string;
  serviceName: string;
  serviceCategory?: string;
  price?: number;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:30 AM"
  ownerName?: string;
  ownerPhone?: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  createdAt?: string;
}

export interface Reminder {
  _id?: string;
  petId: string;
  petName: string;
  petColor?: string;
  userId: string;
  coParentIds?: string[];
  title: string;
  type: 'food' | 'vaccine' | 'medication' | 'vet_visit' | 'grooming' | 'walking' | 'sitting' | 'custom';
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  notes?: string;
  isCompleted: boolean;
  isAutoGenerated?: boolean;
  completedAt?: string;
  createdAt?: string;
}
