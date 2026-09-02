import axios from 'axios';
import { Platform } from 'react-native';

declare const process: any;

// Points to live Cloud Run Backend in production by default, or customizable via environment variable
const DEFAULT_CLOUD_RUN_URL = 'https://petapp-837846168269.europe-west1.run.app';
const API_OVERRIDE = (process.env.PETSOS_API_URL as string | undefined) || '';

export const BASE_API_URL =
  API_OVERRIDE ||
  DEFAULT_CLOUD_RUN_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const setAuthHeader = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// --- Auth API ---
export const AuthApi = {
  login: async (email: string, pass: string) => {
    return (await apiClient.post('/auth/login', { email, password: pass })).data;
  },
  register: async (data: { name: string; email: string; password: string; role?: string; practiceType?: string }) => {
    return (await apiClient.post('/auth/register', data)).data;
  },
  getProfile: async () => {
    return (await apiClient.get('/auth/me')).data;
  },
  applyVerification: async (payload: {
    entityType: 'clinic' | 'store' | 'shelter' | 'sitter';
    practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';
    entityName: string;
    entityAddress: string;
    contactName: string;
    contactPhone: string;
    businessLicense: string;
  }) => {
    return (await apiClient.post('/auth/apply-verification', payload)).data;
  },
};

// --- Emergency & Vet Proximity API ---
export const EmergencyApi = {
  getNearbyClinics: async (lat: number, lon: number, lang = 'en', country = 'Haifa') => {
    try {
      const res = await apiClient.get('/emergency/nearby', {
        params: { lat, lon, lang, country },
        timeout: 6000,
      });
      return res.data;
    } catch {
      return [];
    }
  },
  updateMobileVetLocation: async (userId: string, coords: { lat: number; lng: number; heading?: number; speed?: number; isActive: boolean }) => {
    return (await apiClient.post('/emergency/mobile-vet/location', { userId, ...coords })).data;
  },
  getLiveMobileVets: async () => {
    try {
      return (await apiClient.get('/emergency/mobile-vets/live')).data;
    } catch {
      return [];
    }
  },
  dispatchSosDossier: async (payload: {
    clinicId: string;
    petName: string;
    species: string;
    ownerPhone: string;
    symptoms: string;
    etaMinutes: number;
  }) => {
    return (await apiClient.post('/clinic/dispatch', payload)).data;
  },
};

// --- AI Pet Triage (Gemini) API ---
export const ChatApi = {
  sendTriageMessage: async (message: string, petDetails?: { name?: string; species?: string; age?: string }) => {
    try {
      const res = await apiClient.post('/chat/triage', { message, petDetails });
      return res.data;
    } catch (err: any) {
      return {
        reply: "I'm assessing your pet's situation. For urgent trauma, severe breathing distress, or sudden collapse, please head immediately to the nearest 24/7 ER Vet Clinic.",
        isEmergency: true,
        urgencyLevel: 'high',
      };
    }
  },
};

// --- Pet Passport & Medical EMR API ---
export const PetProfileApi = {
  getPets: async () => {
    try {
      const res = await apiClient.get('/pet-profile');
      return res.data;
    } catch {
      return [];
    }
  },
  createPet: async (data: {
    name: string;
    species: string;
    breed?: string;
    age?: number;
    weight?: number;
    microchipId?: string;
    allergies?: string[];
    vaccines?: Array<{ name: string; date: string; nextDueDate?: string }>;
  }) => {
    return (await apiClient.post('/pet-profile', data)).data;
  },
  uploadReceipt: async (petId: string, receiptData: { rawText: string; clinicName?: string; treatmentDate?: string; cost?: number }) => {
    return (await apiClient.post(`/pet-profile/${petId}/receipts`, receiptData)).data;
  },
};

// --- Marketplace & Pet Supply Stores API ---
export const MarketplaceApi = {
  getShops: async (lat?: number, lon?: number, lang = 'en', country = 'Haifa') => {
    try {
      const res = await apiClient.get('/marketplace/shops', { params: { lat, lon, lang, country } });
      return res.data;
    } catch {
      return [];
    }
  },
  getProducts: async (storeId?: string) => {
    try {
      const res = await apiClient.get('/marketplace/products', { params: { storeId } });
      return res.data;
    } catch {
      return [];
    }
  },
  createOrder: async (orderPayload: {
    storeId: string;
    items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; isEmergencyItem: boolean }>;
    deliveryMode: 'daas_on_demand' | 'pickup';
    deliveryAddress: { street: string; city: string; notes?: string };
    paymentMethodId?: string;
  }) => {
    return (await apiClient.post('/api/orders', orderPayload)).data;
  },
};

// --- Community, Shelters & Sitters API ---
export const CommunityApi = {
  getFeed: async () => {
    try {
      const res = await apiClient.get('/community/feed');
      return res.data;
    } catch {
      return [];
    }
  },
  getMissingPets: async () => {
    try {
      const res = await apiClient.get('/community/missing-pets');
      return res.data;
    } catch {
      return [];
    }
  },
  getSitters: async () => {
    try {
      const res = await apiClient.get('/community/sitters');
      return res.data;
    } catch {
      return [];
    }
  },
  getShelters: async () => {
    try {
      const res = await apiClient.get('/shelters');
      return res.data;
    } catch {
      return [];
    }
  },
  donateToShelter: async (shelterId: string, amount: number, donorName?: string) => {
    return (await apiClient.post(`/shelters/${shelterId}/donate`, { amount, donorName })).data;
  },
};

// --- Clinic Station Portal API ---
export const ClinicPortalApi = {
  getIncomingIntakes: async (clinicId?: string) => {
    try {
      const res = await apiClient.get('/clinic/intakes', { params: { clinicId } });
      return res.data;
    } catch {
      return [];
    }
  },
  updateIntakeStatus: async (intakeId: string, status: 'accepted' | 'in_treatment' | 'discharged') => {
    return (await apiClient.patch(`/clinic/intakes/${intakeId}`, { status })).data;
  },
  getPrescriptionOrders: async () => {
    try {
      const res = await apiClient.get('/store-portal/orders/live?storeType=clinic_pharmacy');
      return res.data;
    } catch {
      return [];
    }
  },
};

// --- Store Merchant Portal API ---
export const StorePortalApi = {
  getLiveOrders: async (storeId?: string) => {
    try {
      const res = await apiClient.get(`/store-portal/orders/live?storeId=${storeId || 'default'}`);
      return res.data;
    } catch {
      return [];
    }
  },
  updateOrderStatus: async (masterOrderId: string, subOrderId: string, action: string, prepMinutes?: number) => {
    return (await apiClient.patch(`/store-portal/orders/${masterOrderId}/sub-orders/${subOrderId}/action`, {
      action,
      prepMinutes,
    })).data;
  },
};

// --- Schedule & Booking API ---
export const ScheduleApi = {
  bookAppointment: async (payload: {
    petId?: string;
    petPassportId?: string;
    petName: string;
    petSpecies?: string;
    providerType: 'veterinarian' | 'groomer' | 'dog_walker' | 'pet_sitter' | 'clinic';
    providerId: string;
    providerName: string;
    serviceName: string;
    serviceCategory?: string;
    price?: number;
    appointmentDate: string;
    timeSlot: string;
    ownerName?: string;
    ownerPhone?: string;
    notes?: string;
  }) => {
    return (await apiClient.post('/schedule/appointments/book', payload)).data;
  },
  getUserAppointments: async (userId: string) => {
    try {
      return (await apiClient.get(`/schedule/appointments/user/${userId}`)).data;
    } catch {
      return [];
    }
  },
  getPetAppointments: async (petId: string) => {
    try {
      return (await apiClient.get(`/schedule/appointments/pet/${petId}`)).data;
    } catch {
      return [];
    }
  },
  cancelAppointment: async (id: string) => {
    return (await apiClient.patch(`/schedule/appointments/${id}/cancel`)).data;
  },
  getUserReminders: async (userId: string) => {
    try {
      return (await apiClient.get(`/schedule/reminders/user/${userId}`)).data;
    } catch {
      return [];
    }
  },
  getPetReminders: async (petId: string) => {
    try {
      return (await apiClient.get(`/schedule/reminders/pet/${petId}`)).data;
    } catch {
      return [];
    }
  },
  createReminder: async (payload: {
    petId: string;
    petName: string;
    title: string;
    type: string;
    dueDate: string;
    dueTime?: string;
    recurrence: string;
    notes?: string;
  }) => {
    return (await apiClient.post('/schedule/reminders', payload)).data;
  },
  toggleReminder: async (id: string) => {
    return (await apiClient.patch(`/schedule/reminders/${id}/toggle`)).data;
  },
  deleteReminder: async (id: string) => {
    return (await apiClient.delete(`/schedule/reminders/${id}`)).data;
  },
};

// --- Co-Parenting & Households API ---
export const CoParentApi = {
  searchUsers: async (q: string) => {
    try {
      return (await apiClient.get(`/pet-profile/co-parent/search?query=${encodeURIComponent(q)}`)).data;
    } catch {
      return [];
    }
  },
  sendInvite: async (petId: string, recipientUserId: string, role = 'co_parent') => {
    return (await apiClient.post(`/pet-profile/${petId}/co-parent/invite`, { recipientUserId, role })).data;
  },
  getInbox: async () => {
    try {
      return (await apiClient.get('/pet-profile/co-parent/requests/inbox')).data;
    } catch {
      return [];
    }
  },
  respondInvite: async (requestId: string, action: 'accept' | 'decline') => {
    return (await apiClient.patch(`/pet-profile/co-parent/requests/${requestId}/respond`, { action })).data;
  },
};

// --- Digital Itemized Receipts API ---
export const ReceiptsApi = {
  getMyReceipts: async () => {
    try {
      return (await apiClient.get('/receipts/my-receipts')).data;
    } catch {
      return [];
    }
  },
};

