import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useGeolocation } from '../../Hooks/useGeolocation';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { reverseGeocodeCountry, mapCountryToLanguage } from '../../utils/geo';
import { MapComponent } from '../../Components/MapComponent/MapComponent';
import { EmergencyHeader } from '../../Components/EmergencyHeader/EmergencyHeader';
import { LocationPrompt, type LocationAccuracyMode } from '../../Components/LocationPrompt/LocationPrompt';
import { ClinicBottomSheet } from '../../Components/ClinicBottomSheet/ClinicBottomSheet';
import type { Clinic, UserLocation } from '../../schemas';
import './EmergencyPage.css';

import { API_URL } from '../../config/api';
const DEFAULT_COORDS: UserLocation = { lat: 32.794, lon: 34.9896 };
const LOCATION_STORAGE_KEY = 'petsos_user_saved_location_v1';
const CITY_NAME_STORAGE_KEY = 'petsos_user_saved_city_name_v1';

export const EmergencyPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { setLang } = useTranslation();

  const { location: geoLoc, error: geoError } = useGeolocation();
  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_COORDS;
  });

  const [cityName, setCityName] = useState<string>(() => {
    try {
      return localStorage.getItem(CITY_NAME_STORAGE_KEY) || 'Haifa';
    } catch {
      return 'Haifa';
    }
  });

  const [accuracyMode, setAccuracyMode] = useState<LocationAccuracyMode>(() => {
    try {
      if (localStorage.getItem(LOCATION_STORAGE_KEY)) return 'city_selected';
    } catch {}
    return 'approximate_default';
  });

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const manualLocationSet = useRef<boolean>(
    Boolean(localStorage.getItem(LOCATION_STORAGE_KEY))
  );

  // Sync geolocation coordinates and detect country language
  useEffect(() => {
    if (manualLocationSet.current) return;
    if (geoLoc) {
      setUserLocation({ lat: geoLoc.lat, lon: geoLoc.lon });
      setAccuracyMode('gps_exact');

      // Auto-detect country from GPS and adapt UI language ONLY on initial visit if user hasn't chosen a language
      reverseGeocodeCountry(geoLoc.lat, geoLoc.lon).then((res) => {
        const isManuallySelected = localStorage.getItem('petsos_lang_manual') === 'true';
        if (!isManuallySelected && res.countryCode) {
          const detectedLang = mapCountryToLanguage(res.countryCode);
          setLang(detectedLang);
        }
        if (res.cityName) {
          setCityName(res.cityName);
        }
      });
    } else if (geoError) {
      setAccuracyMode('approximate_default');
    }
  }, [geoLoc, geoError, setLang]);

  // Fetch backend emergency clinics if available
  const fetchClinics = useCallback(async (loc: UserLocation) => {
    try {
      const response = await axios.get<any[]>(`${API_URL}/emergency/nearby`, {
        params: { lat: loc.lat, lon: loc.lon },
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
          website: item.website || null,
          rating: item.rating || 4.7,
          capacityStatus: item.capacityStatus || 'accepting',
        }));
        setClinics(transformed);
      }
    } catch {
      // Preserve rich INITIAL_PROVIDERS
    }
  }, []);

  useEffect(() => {
    fetchClinics(userLocation);
  }, [userLocation, fetchClinics]);

  const handleClinicSelect = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsSheetExpanded(true);
  };

  const handleLocationFound = (coords: { lat: number; lng: number; name: string }) => {
    manualLocationSet.current = true;
    const newLoc = { lat: coords.lat, lon: coords.lng };
    const shortName = coords.name.split(',')[0];
    setUserLocation(newLoc);
    setCityName(shortName);
    setAccuracyMode('city_selected');
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
      localStorage.setItem(CITY_NAME_STORAGE_KEY, shortName);
    } catch {}
  };

  // Recenter to live browser GPS or default location
  const handleRecenter = () => {
    setSelectedClinic(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const gpsLoc = { lat, lon };
          setUserLocation(gpsLoc);
          setCityName('My Location');
          setAccuracyMode('gps_exact');
          manualLocationSet.current = false;
          try {
            localStorage.removeItem(LOCATION_STORAGE_KEY);
            localStorage.removeItem(CITY_NAME_STORAGE_KEY);
          } catch {}
        },
        () => {
          // fallback to Haifa
          setUserLocation(DEFAULT_COORDS);
          setCityName('Haifa');
          setAccuracyMode('approximate_default');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setUserLocation(DEFAULT_COORDS);
    }
  };

  const verifiedCount = clinics.filter(
    (c) =>
      c.tier === 'verified' ||
      (c.openingHours && c.openingHours.toLowerCase().includes('24'))
  ).length;

  return (
    <div className={`emergency-page ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      {/* Top Header with Eyebrow, Live Summary, Theme Toggle & Chat FAB */}
      <EmergencyHeader
        totalCount={clinics.length}
        verifiedCount={verifiedCount}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Leaflet Interactive Map */}
      <MapComponent
        userLocation={userLocation}
        clinics={clinics}
        theme={theme}
        selectedClinic={selectedClinic}
        onClinicSelect={handleClinicSelect}
      />

      {/* Persistent Location Bar with Dynamic Status, Autocomplete & Recenter button */}
      <LocationPrompt
        currentCityName={cityName}
        accuracyMode={accuracyMode}
        onLocationFound={handleLocationFound}
        onRecenter={handleRecenter}
      />

      {/* Collapsible & Expandable 3-Tier Draggable Bottom Sheet */}
      <ClinicBottomSheet
        clinics={clinics}
        userLocation={userLocation}
        isExpanded={isSheetExpanded}
        onToggleExpand={() => setIsSheetExpanded(!isSheetExpanded)}
        selectedClinicId={selectedClinic ? selectedClinic.id : null}
        onClinicCardClick={handleClinicSelect}
      />
    </div>
  );
};
