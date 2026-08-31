import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import type { Clinic, UserLocation } from '../../schemas';

// Fix Leaflet's default marker asset paths for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// --- Custom DivIcons for Vets & Stores ---
const userIcon = L.divIcon({
  className: '',
  html: '<div class="user-dot"><div class="user-dot-pulse"></div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export const createClinicIcon = (isVerified: boolean, isMobileVet?: boolean) => {
  if (isMobileVet) {
    return L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div class="mobile-vet-pin">
          <span class="mobile-vet-emoji">🚐</span>
          <div class="mobile-vet-pulse"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="vet-heart-pin ${isVerified ? 'verified' : 'unverified'}">
        <svg viewBox="0 0 24 24" class="vet-heart-svg">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span class="vet-paw-glyph">🐾</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 24],
  });
};

export const createStoreIcon = (category?: string) => {
  const emoji = category === 'pharmacy' ? '💊' : '🛍️';
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div class="store-map-pin ${category === 'pharmacy' ? 'pharmacy' : ''}">
        <span class="store-pin-emoji">${emoji}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 24],
  });
};

// --- Map Center & Viewport Synchronizer with Mobile Auto-Invalidate ---
interface MapUpdaterProps {
  center: [number, number];
  selectedLocation?: { lat: number; lng: number } | null;
}

const MapUpdater = ({ center, selectedLocation }: MapUpdaterProps) => {
  const map = useMap();
  const isFirstCenter = useRef(true);

  // Critical for Mobile: Force Leaflet to calculate correct viewport size
  useEffect(() => {
    const invalidate = () => {
      if (map) {
        map.invalidateSize();
      }
    };

    // Run immediate + staged checks for mobile browser address-bar transitions
    invalidate();
    const t1 = setTimeout(invalidate, 150);
    const t2 = setTimeout(invalidate, 400);
    const t3 = setTimeout(invalidate, 1000);

    window.addEventListener('resize', invalidate);
    window.addEventListener('orientationchange', invalidate);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('orientationchange', invalidate);
    };
  }, [map]);

  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [map, selectedLocation]);

  // Only auto-center on the FIRST real location update or fly smoothly on new search
  useEffect(() => {
    if (!selectedLocation) {
      if (isFirstCenter.current) {
        map.setView(center, 13);
        isFirstCenter.current = false;
      } else {
        map.flyTo(center, 13, { animate: true, duration: 1.0 });
      }
    }
  }, [map, center, selectedLocation]);

  return null;
};

export interface MapItem {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  tier?: 'verified' | 'unverified';
  isMobileVet?: boolean;
  practiceType?: string;
  openingHours?: string;
  itemType?: 'clinic' | 'store';
  category?: string;
  [key: string]: any;
}

interface MapProps {
  userLocation: UserLocation;
  clinics?: Clinic[];
  items?: MapItem[];
  theme?: 'dark' | 'light';
  selectedClinic?: Clinic | null;
  selectedItem?: MapItem | null;
  onClinicSelect?: (clinic: Clinic) => void;
  onItemSelect?: (item: MapItem) => void;
  mode?: 'emergency' | 'marketplace';
}

export const MapComponent = ({
  userLocation,
  clinics = [],
  items = [],
  theme = 'dark',
  selectedClinic,
  selectedItem,
  onClinicSelect,
  onItemSelect,
  mode = 'emergency',
}: MapProps) => {
  const position: [number, number] = [userLocation.lat, userLocation.lon];

  // Standard pure OpenStreetMap tile servers with zero watermarks and multi-subdomain loading
  const isDark = theme === 'dark';
  const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const activeSelectedLocation = selectedClinic
    ? selectedClinic.location
    : selectedItem
    ? selectedItem.location
    : null;

  return (
    <div className={`map-container ${isDark ? 'dark-map' : 'light-map'}`}>
      <MapContainer
        center={position}
        zoom={13}
        className="full-height-map"
        zoomControl={false}
        attributionControl={false}
        preferCanvas={true}
      >
        <TileLayer
          key={theme}
          url={tileUrl}
          subdomains="abc"
          maxZoom={19}
        />

        <MapUpdater
          center={position}
          selectedLocation={activeSelectedLocation}
        />

        {/* User Location Pulsing Dot */}
        <Marker position={position} icon={userIcon} zIndexOffset={1000} />

        {/* Emergency Clinic Markers */}
        {mode === 'emergency' &&
          clinics.map((clinic) => {
            const isVerified =
              clinic.tier === 'verified' ||
              (clinic.openingHours && clinic.openingHours.toLowerCase().includes('24'));

            return (
              <Marker
                key={clinic.id}
                position={[clinic.location.lat, clinic.location.lng]}
                icon={createClinicIcon(
                  Boolean(isVerified),
                  Boolean(clinic.isMobileVet || clinic.practiceType === 'mobile_vet')
                )}
                eventHandlers={{
                  click: () => onClinicSelect?.(clinic),
                }}
              />
            );
          })}

        {/* Marketplace / Store Markers */}
        {mode === 'marketplace' &&
          items.map((item) => (
            <Marker
              key={item.id}
              position={[item.location.lat, item.location.lng]}
              icon={createStoreIcon(item.category)}
              eventHandlers={{
                click: () => onItemSelect?.(item),
              }}
            />
          ))}
      </MapContainer>
    </div>
  );
};