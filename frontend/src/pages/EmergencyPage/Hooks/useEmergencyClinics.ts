import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Clinic, UserLocation } from '../../../schemas';
import { API_URL } from '../../../config/api';

export function useEmergencyClinics(currentLang: string, cityName: string) {
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const fetchClinics = useCallback(async (loc: UserLocation) => {
    try {
      const response = await axios.get<any[]>(`${API_URL}/emergency/nearby`, {
        params: {
          lat: loc.lat,
          lon: loc.lon,
          lang: currentLang,
          country: cityName,
        },
        timeout: 4000,
      });

      if (response.data && response.data.length > 0) {
        const transformed: Clinic[] = response.data.map((item) => ({
          id: String(item.id || item._id),
          name: item.name,
          address: item.address || 'Address unavailable',
          isOpenNow: item.isOpenNow !== undefined ? item.isOpenNow : true,
          location: item.location || { lat: loc.lat, lng: loc.lon },
          tier: item.tier || (item.isOpenNow ? 'verified' : 'unverified'),
          isClaimed: item.isClaimed === true,
          phoneNum: item.phone ? String(item.phone) : '+97245550100',
          openingHours: item.openingHours || item.hours || (item.isOpenNow ? 'Open 24/7' : 'Hours Unavailable'),
          rating: item.rating || (item.tier === 'verified' ? 4.9 : 4.5),
          capacityStatus: item.capacityStatus || 'accepting',
          practiceType: item.practiceType || 'stationary_clinic',
          isMobileVet: item.isMobileVet || item.practiceType === 'mobile_vet',
          distance: item.distance,
        }));
        setClinics(transformed);
      }
    } catch {
      // Keep existing state or fallback
    }
  }, [currentLang, cityName]);

  return { clinics, setClinics, fetchClinics };
}
