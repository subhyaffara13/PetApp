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
  distance?: number; // in km
  pimsProvider?: string;
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
  id: string;
  date: string;
  type: 'vaccination' | 'checkup' | 'surgery' | 'illness' | 'medication' | 'other';
  title: string;
  description: string;
  vetName?: string;
}

export interface PetProfile {
  _id?: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'reptile' | 'small_mammal' | 'other';
  breed: string;
  age: number; // in years (legacy/fallback)
  dateOfBirth?: string; // ISO date format YYYY-MM-DD
  weight: number; // in kg
  gender: 'male' | 'female';
  photoUrl?: string;
  knownConditions: string[];
  allergies: string[];
  medications: string[];
  medicalHistory: MedicalEvent[];
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
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

// --- Marketplace Types ---

export interface PetShop {
  _id?: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  phone: string;
  tags: string[];
  rating?: number;
  isRegistered: boolean; // true = monetized partner, false = API backfill
  isOpen?: boolean;
  deliveryAvailable: boolean;
  pickupOnly: boolean;
  products?: Product[];
  imageUrl?: string;
  photoUrl?: string;
  distance?: number;
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

// --- Community Types ---

export interface StoryItem {
  _id: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorBadge?: 'vet' | 'merchant' | 'none';
  authorRole?: string;
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
  authorBadge?: 'vet' | 'merchant' | 'none';
  authorRole?: string;
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
