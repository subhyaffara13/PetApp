import axios from 'axios';
import { Platform } from 'react-native';

// In local Android emulator, localhost is 10.0.2.2. In iOS simulator or production, use domain/IP.
// Override at build time with the PETSOS_API_URL variable (e.g. "http://203.0.113.10:3000" for a real device/server).
const API_OVERRIDE =
  (process.env.PETSOS_API_URL as string | undefined) || '';

export const BASE_API_URL =
  API_OVERRIDE ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

export const apiClient = axios.create({
  baseURL: BASE_API_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const EmergencyApi = {
  getNearbyClinics: async (lat: number, lon: number) => {
    try {
      const res = await apiClient.get('/emergency/nearby', { params: { lat, lon } });
      return res.data;
    } catch {
      return [];
    }
  },
  dispatchSosDossier: async (payload: any) => {
    return (await apiClient.post('/clinic/dispatch', payload)).data;
  },
};

export const PetProfileApi = {
  getPets: async () => {
    return (await apiClient.get('/pet-profile')).data;
  },
  createPet: async (data: any) => {
    return (await apiClient.post('/pet-profile', data)).data;
  },
};

export const CommunityApi = {
  getStories: async () => {
    return (await apiClient.get('/community/stories')).data;
  },
  getFeed: async () => {
    return (await apiClient.get('/community/feed')).data;
  },
};

export const MarketplaceApi = {
  getShops: async () => {
    return (await apiClient.get('/api/stores/claimable')).data;
  },
  placeOrder: async (orderPayload: any) => {
    return (await apiClient.post('/api/orders', orderPayload)).data;
  },
};
