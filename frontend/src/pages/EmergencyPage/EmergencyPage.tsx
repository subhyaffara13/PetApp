import { useState, useEffect, useRef } from 'react';
import { useGeolocation } from '../../Hooks/useGeolocation';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../context/LanguageContext';
import { reverseGeocodeCountry, mapCountryToLanguage } from '../../utils/geo';
import { MapComponent } from '../../Components/MapComponent/MapComponent';
import { EmergencyHeader } from '../../Components/EmergencyHeader/EmergencyHeader';
import { LocationPrompt, type LocationAccuracyMode } from '../../Components/LocationPrompt/LocationPrompt';
import { ClinicBottomSheet } from '../../Components/ClinicBottomSheet/ClinicBottomSheet';
import { GlobalCalendarModal } from '../../Components/GlobalCalendarModal/GlobalCalendarModal';
import { useEmergencyClinics } from './Hooks/useEmergencyClinics';
import type { Clinic, UserLocation } from '../../schemas';
import './EmergencyPage.css';

const DEFAULT_COORDS: UserLocation = { lat: 32.794, lon: 34.9896 };
const LOCATION_STORAGE_KEY = 'petsos_user_saved_location_v1';
const CITY_NAME_STORAGE_KEY = 'petsos_user_saved_city_name_v1';

export const EmergencyPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentLang, setLang } = useTranslation();
  const { location: geoLoc, error: geoError } = useGeolocation();

  const [userLocation, setUserLocation] = useState<UserLocation>(() => {
    try {
      const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_COORDS;
  });

  const [cityName, setCityName] = useState<string>(() => {
    try { return localStorage.getItem(CITY_NAME_STORAGE_KEY) || 'Haifa'; } catch { return 'Haifa'; }
  });

  const [accuracyMode, setAccuracyMode] = useState<LocationAccuracyMode>(() => {
    try { if (localStorage.getItem(LOCATION_STORAGE_KEY)) return 'city_selected'; } catch {}
    return 'approximate_default';
  });

  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const manualLocationSet = useRef<boolean>(Boolean(localStorage.getItem(LOCATION_STORAGE_KEY)));

  const { clinics, fetchClinics } = useEmergencyClinics(currentLang, cityName);

  useEffect(() => {
    if (geoLoc && !manualLocationSet.current) {
      const loc: UserLocation = { lat: geoLoc.lat, lon: geoLoc.lon };
      setUserLocation(loc);
      setAccuracyMode('gps_exact');

      reverseGeocodeCountry(geoLoc.lat, geoLoc.lon).then((res) => {
        const isManuallySelected = localStorage.getItem('petsos_lang_manual') === 'true';
        if (!isManuallySelected && res.countryCode) {
          setLang(mapCountryToLanguage(res.countryCode));
        }
        if (res.cityName) {
          setCityName(res.cityName);
        }
      });
    } else if (geoError && !manualLocationSet.current) {
      setAccuracyMode('approximate_default');
    }
  }, [geoLoc, geoError, setLang]);

  useEffect(() => {
    fetchClinics(userLocation);
  }, [userLocation, fetchClinics]);

  const handleLocationResolved = (coords: { lat: number; lng: number; name: string }) => {
    manualLocationSet.current = true;
    const loc: UserLocation = { lat: coords.lat, lon: coords.lng };
    setUserLocation(loc);
    if (coords.name) setCityName(coords.name);
    setAccuracyMode('city_selected');
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
      if (coords.name) localStorage.setItem(CITY_NAME_STORAGE_KEY, coords.name);
    } catch {}
  };

  const handleRecenter = () => {
    manualLocationSet.current = false;
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      localStorage.removeItem(CITY_NAME_STORAGE_KEY);
    } catch {}

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: UserLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          setUserLocation(loc);
          setAccuracyMode('gps_exact');
          reverseGeocodeCountry(loc.lat, loc.lon).then((res) => {
            if (res.cityName) setCityName(res.cityName);
            if (res.countryCode) {
              const isManuallySelected = localStorage.getItem('petsos_lang_manual') === 'true';
              if (!isManuallySelected) setLang(mapCountryToLanguage(res.countryCode));
            }
          });
        },
        () => {
          if (geoLoc) {
            setUserLocation({ lat: geoLoc.lat, lon: geoLoc.lon });
            setAccuracyMode('gps_exact');
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else if (geoLoc) {
      setUserLocation({ lat: geoLoc.lat, lon: geoLoc.lon });
      setAccuracyMode('gps_exact');
    }
  };

  const verifiedCount = clinics.filter((c) => c.tier === 'verified').length;

  return (
    <div className="emergency-page page" id="emergency-page">
      <EmergencyHeader
        totalCount={clinics.length}
        verifiedCount={verifiedCount}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCalendar={() => setShowCalendarModal(true)}
      />

      <div className="location-bar-wrapper">
        <LocationPrompt
          currentCityName={cityName}
          accuracyMode={accuracyMode}
          centerCoordinates={{ lat: userLocation.lat, lng: userLocation.lon }}
          onLocationFound={handleLocationResolved}
          onRecenter={handleRecenter}
        />
      </div>

      <div className="emergency-page__map-wrapper">
        <MapComponent
          userLocation={userLocation}
          clinics={clinics}
          selectedClinic={selectedClinic}
          onClinicSelect={(clinic) => {
            setSelectedClinic(clinic);
            setIsSheetExpanded(true);
          }}
        />
      </div>

      <ClinicBottomSheet
        clinics={clinics}
        userLocation={userLocation}
        isExpanded={isSheetExpanded}
        onToggleExpand={() => setIsSheetExpanded((prev) => !prev)}
        selectedClinicId={selectedClinic?.id || null}
        onClinicCardClick={(clinic) => setSelectedClinic(clinic)}
      />

      <GlobalCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
      />
    </div>
  );
};
