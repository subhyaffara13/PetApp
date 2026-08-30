import { useState, useEffect, useRef } from 'react';
import { searchLocations, mapCountryToLanguage, type GeocodedLocation } from '../../utils/geo';
import { useTranslation } from '../../context/LanguageContext';
import { Search, MapPin, LocateFixed, Check, AlertCircle, Sparkles } from 'lucide-react';
import './LocationPrompt.css';

export type LocationAccuracyMode = 'gps_exact' | 'city_selected' | 'approximate_default';

interface LocationPromptProps {
  currentCityName?: string;
  accuracyMode: LocationAccuracyMode;
  onLocationFound: (coords: { lat: number; lng: number; name: string }) => void;
  onRecenter: () => void;
}

export const LocationPrompt = ({
  currentCityName,
  accuracyMode,
  onLocationFound,
  onRecenter,
}: LocationPromptProps) => {
  const { t, setLang } = useTranslation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchError, setSearchError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<number | undefined>(undefined);

  // Debounced auto-complete query fetcher
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError('');
      try {
        const results = await searchLocations(trimmed);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchError('Search failed');
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => window.clearTimeout(debounceTimer.current);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc: GeocodedLocation) => {
    onLocationFound({
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
    });
    setQuery('');
    setShowDropdown(false);

    if (loc.countryCode) {
      const detectedLang = mapCountryToLanguage(loc.countryCode);
      if (detectedLang) {
        setLang(detectedLang);
      }
    }
  };

  const getStatusBadge = () => {
    if (accuracyMode === 'gps_exact') {
      return (
        <span className="location-status-badge status-exact">
          <Check size={11} /> {t('location.gps_active', 'Exact GPS active')} · {currentCityName || t('location.near_you', 'Near you')}
        </span>
      );
    }
    if (accuracyMode === 'city_selected') {
      return (
        <span className="location-status-badge status-custom">
          <Sparkles size={11} /> {currentCityName || 'Haifa'}
        </span>
      );
    }
    return (
      <span className="location-status-badge status-approx">
        <AlertCircle size={11} /> {currentCityName || 'Haifa'}
      </span>
    );
  };

  return (
    <div id="location-bar-container" className="location-bar-container" ref={dropdownRef}>
      {/* Top Status Pill */}
      <div className="location-status-row">
        {getStatusBadge()}
      </div>

      {/* Main Search Input & Recenter Button */}
      <div className="location-search-row">
        <div className="location-input-wrapper">
          <Search size={15} className="location-search-icon" />
          <input
            type="text"
            id="location-search-input"
            className="location-search-input"
            placeholder={t('emergency.search_placeholder', 'Search city...')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
          />
          {isSearching && <span className="location-spinner" />}
        </div>

        {/* Recenter Button */}
        <button
          type="button"
          id="recenter-gps-btn"
          className="recenter-btn"
          onClick={onRecenter}
          title="Recenter to my location"
          aria-label="Recenter map"
        >
          <LocateFixed size={18} />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="location-dropdown glass-card animate-fade-in" id="location-suggestions-list">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className="location-dropdown-item"
              onClick={() => handleSelectLocation(item)}
            >
              <MapPin size={14} className="dropdown-pin-icon" />
              <div className="dropdown-item-text">
                <strong>{item.name.split(',')[0]}</strong>
                <span>{item.name.split(',').slice(1).join(', ')}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {searchError && <p className="location-prompt-error">{searchError}</p>}
    </div>
  );
};
