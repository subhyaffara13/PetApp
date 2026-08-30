import type { LanguageCode } from '../context/LanguageContext';

/**
 * Calculates great-circle distance between two points in kilometers using Haversine formula
 */
export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generates Google Maps turn-by-turn navigation URL with coordinates
 */
export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export interface GeocodedLocation {
  name: string;
  lat: number;
  lng: number;
  countryCode?: string;
}

/**
 * Maps country code or location text to the appropriate native UI LanguageCode
 */
export function mapCountryToLanguage(countryCodeOrText: string): LanguageCode {
  const text = countryCodeOrText.toLowerCase().trim();

  // 1. Israel -> Hebrew
  if (
    text === 'il' ||
    text === 'isr' ||
    text.includes('israel') ||
    text.includes('ישראל') ||
    text.includes('haifa') ||
    text.includes('tel aviv') ||
    text.includes('jerusalem')
  ) {
    return 'he';
  }

  // 2. Arab World -> Arabic
  const arabicCountryCodes = [
    'sa', 'ae', 'eg', 'jo', 'lb', 'iq', 'kw', 'qa', 'bh', 'om', 'ma', 'dz', 'tn', 'ly', 'sd', 'ye', 'sy', 'ps'
  ];
  if (
    arabicCountryCodes.includes(text) ||
    text.includes('saudi') ||
    text.includes('emirates') ||
    text.includes('dubai') ||
    text.includes('egypt') ||
    text.includes('cairo') ||
    text.includes('jordan') ||
    text.includes('amman') ||
    text.includes('beirut')
  ) {
    return 'ar';
  }

  // 3. Spain & Latin America -> Spanish
  const spanishCountryCodes = [
    'es', 'mx', 'ar', 'co', 'pe', 'cl', 've', 'ec', 'gt', 'cu', 'bo', 'do', 'hn', 'py', 'sv', 'ni', 'cr', 'pa', 'uy'
  ];
  if (
    spanishCountryCodes.includes(text) ||
    text.includes('spain') ||
    text.includes('madrid') ||
    text.includes('barcelona') ||
    text.includes('mexico') ||
    text.includes('argentina') ||
    text.includes('colombia')
  ) {
    return 'es';
  }

  // 4. France & Francophone -> French
  const frenchCountryCodes = ['fr', 'be', 'mc', 'sn', 'ci', 'cm'];
  if (
    frenchCountryCodes.includes(text) ||
    text.includes('france') ||
    text.includes('paris') ||
    text.includes('lyon') ||
    text.includes('marseille')
  ) {
    return 'fr';
  }

  // 5. Russia & Cyrillic regions -> Russian
  const russianCountryCodes = ['ru', 'by', 'kz', 'kg', 'uz', 'tj'];
  if (
    russianCountryCodes.includes(text) ||
    text.includes('russia') ||
    text.includes('moscow') ||
    text.includes('petersburg') ||
    text.includes('belarus')
  ) {
    return 'ru';
  }

  // Default to English
  return 'en';
}

/**
 * Fast geographic bounding box fallback to detect country from coordinates
 */
export function getCountryFromCoordinates(lat: number, lng: number): string | null {
  // Israel
  if (lat >= 29.4 && lat <= 33.4 && lng >= 34.2 && lng <= 35.9) return 'il';
  // France
  if (lat >= 41.3 && lat <= 51.1 && lng >= -5.1 && lng <= 9.6) return 'fr';
  // Spain
  if (lat >= 36.0 && lat <= 43.8 && lng >= -9.3 && lng <= 3.3) return 'es';
  // Russia (European)
  if (lat >= 41.1 && lat <= 70.0 && lng >= 27.0 && lng <= 60.0) return 'ru';
  // Saudi / UAE / Gulf
  if (lat >= 16.0 && lat <= 32.0 && lng >= 35.0 && lng <= 60.0) return 'sa';

  return null;
}

/**
 * Reverse geocodes coordinates to identify country and city
 */
export async function reverseGeocodeCountry(
  lat: number,
  lng: number
): Promise<{ countryCode: string; cityName: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`
    );
    const data = await res.json();
    if (data && data.address) {
      return {
        countryCode: data.address.country_code?.toLowerCase() || '',
        cityName:
          data.address.city ||
          data.address.town ||
          data.address.municipality ||
          data.address.state ||
          data.address.country ||
          '',
      };
    }
  } catch (err) {
    console.warn('Reverse geocoding network notice:', err);
  }

  const fallbackCode = getCountryFromCoordinates(lat, lng) || 'il';
  return { countryCode: fallbackCode, cityName: fallbackCode === 'il' ? 'Haifa' : '' };
}

/**
 * Geocodes city or address query using OpenStreetMap Nominatim API globally
 */
export async function searchLocations(query: string): Promise<GeocodedLocation[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        countryCode: item.address?.country_code?.toLowerCase() || '',
      }));
    }
  } catch (err) {
    console.error('Failed to search locations:', err);
  }
  return [];
}

/**
 * Single city direct geocode
 */
export async function geocodeCity(query: string): Promise<{ lat: number; lng: number } | null> {
  const results = await searchLocations(query);
  if (results.length > 0) {
    return { lat: results[0].lat, lng: results[0].lng };
  }
  return null;
}
