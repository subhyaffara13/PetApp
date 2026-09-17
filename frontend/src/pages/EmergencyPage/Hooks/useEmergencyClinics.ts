import { useState, useCallback } from 'react';
import axios from 'axios';
import type { Clinic, UserLocation } from '../../../schemas';
import { API_URL } from '../../../config/api';
import { isPlaceOpenNow } from '../../../utils/opening-hours.util';

export function useEmergencyClinics(currentLang: string, cityName: string) {
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const fetchClinics = useCallback(async (loc: UserLocation) => {
    const doFetch = async (retryCount = 0): Promise<void> => {
      try {
        const response = await axios.get<any[]>(`${API_URL}/emergency/nearby`, {
          params: {
            lat: loc.lat,
            lon: loc.lon,
            lang: currentLang,
            country: cityName,
          },
          timeout: 15000,
        });

        if (response.data && Array.isArray(response.data)) {
          const transformed = response.data.map((item: any) => {
            const nameLower = (item.name || '').toLowerCase();
            const is24HourER =
              Boolean(item.is24HourER) ||
              nameLower.includes('emergency') ||
              nameLower.includes('er') ||
              nameLower.includes('24/7') ||
              nameLower.includes('24 שעות') ||
              nameLower.includes('מיון') ||
              nameLower.includes('חירום') ||
              nameLower.includes('בית חולים');

            const openNow = isPlaceOpenNow({
              openingHours: item.openingHours,
              isOpenNow: item.isOpenNow,
              isDeclaredOpen: item.isDeclaredOpen,
              portalStatusOverride: item.portalStatusOverride,
              capacityStatus: item.capacityStatus,
              isClaimed: item.isClaimed,
              is24HourER,
              name: item.name,
            });

            const openingHours =
              item.openingHours ||
              (is24HourER
                ? 'Open 24/7 Emergency Care'
                : openNow
                  ? 'Sun-Thu 08:30-19:30 • Open Now'
                  : 'Sun-Thu 08:30-19:30 • Closed Tonight');

            return {
              id: String(item.id || item._id),
              name: item.name,
              address: item.address || 'Address unavailable',
              isOpenNow: openNow,
              location: item.location || { lat: loc.lat, lng: loc.lon },
              tier: item.tier || 'unverified',
              isClaimed: item.isClaimed === true,
              phoneNum: item.phone ? String(item.phone) : '+97245550100',
              openingHours,
              rating: item.rating || (item.tier === 'verified' ? 4.9 : 4.5),
              capacityStatus: item.capacityStatus || 'accepting',
              practiceType: item.practiceType || 'stationary_clinic',
              isMobileVet: item.isMobileVet || item.practiceType === 'mobile_vet',
              distance: item.distance,
            };
          });
          setClinics(transformed);
        }
      } catch (err) {
        // Cold start retry: if the first request fails due to Cloud Run container wakeup, retry once after 2s
        if (retryCount === 0) {
          setTimeout(() => {
            doFetch(1);
          }, 2000);
        }
      }
    };

    await doFetch(0);
  }, [currentLang, cityName]);

  return { clinics, setClinics, fetchClinics };
}
