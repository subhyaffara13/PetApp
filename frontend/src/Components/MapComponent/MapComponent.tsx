import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';
import type { Clinic, UserLocation } from '../../schemas';

// --- Custom DivIcons matching prototype ---
const userIcon = L.divIcon({
  className: '',
  html: '<div class="user-dot"><div class="user-dot-pulse"></div></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const createClinicIcon = (isVerified: boolean, isMobileVet?: boolean) => {
  if (isMobileVet) {
    return L.divIcon({
      className: '',
      html: `<div style="background: linear-gradient(135deg, #ec4899, #d946ef); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 14px rgba(236,72,153,0.7); border: 2px solid #fff; animation: pulse-shadow 2s infinite;">🚐</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  return L.divIcon({
    className: '',
    html: `<div class="pin ${isVerified ? 'pin-verified' : 'pin-unverified'}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// --- Map Center & Viewport Synchronizer ---
interface MapUpdaterProps {
  center: [number, number];
  selectedClinicLocation?: { lat: number; lng: number } | null;
}

const MapUpdater = ({ center, selectedClinicLocation }: MapUpdaterProps) => {
  const map = useMap();
  const isFirstCenter = useRef(true);

  useEffect(() => {
    if (selectedClinicLocation) {
      map.flyTo([selectedClinicLocation.lat, selectedClinicLocation.lng], 14, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [map, selectedClinicLocation]);

  // Only auto-center on the FIRST real location update, not on every change
  useEffect(() => {
    if (!selectedClinicLocation) {
      if (isFirstCenter.current) {
        map.setView(center, 13);
        isFirstCenter.current = false;
      } else {
        // Smooth fly for subsequent location changes (e.g. manual city search)
        map.flyTo(center, 13, { animate: true, duration: 1.0 });
      }
    }
  }, [map, center, selectedClinicLocation]);

  return null;
};

interface MapProps {
  userLocation: UserLocation;
  clinics: Clinic[];
  theme?: 'dark' | 'light';
  selectedClinic?: Clinic | null;
  onClinicSelect?: (clinic: Clinic) => void;
}

export const MapComponent = ({
  userLocation,
  clinics,
  theme = 'dark',
  selectedClinic,
  onClinicSelect,
}: MapProps) => {
  const position: [number, number] = [userLocation.lat, userLocation.lon];

  // OpenStreetMap tiles — always free, no API key, no watermark
  // Dark mode is achieved via CSS filter on the tile layer
  const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className={`map-container ${theme === 'dark' ? 'dark-map' : 'light-map'}`}>
      <MapContainer
        center={position}
        zoom={13}
        className="full-height-map"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          key={theme}
          url={tileUrl}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <MapUpdater
          center={position}
          selectedClinicLocation={selectedClinic ? selectedClinic.location : null}
        />

        {/* User Location Pulsing Dot */}
        <Marker position={position} icon={userIcon} zIndexOffset={1000} />

        {/* Provider Markers (Verified Glowing Pins vs Unverified Rings) */}
        {clinics.map((clinic) => {
          const isVerified =
            clinic.tier === 'verified' ||
            (clinic.openingHours && clinic.openingHours.toLowerCase().includes('24'));

          return (
            <Marker
              key={clinic.id}
              position={[clinic.location.lat, clinic.location.lng]}
              icon={createClinicIcon(Boolean(isVerified), Boolean(clinic.isMobileVet || clinic.practiceType === 'mobile_vet'))}
              eventHandlers={{
                click: () => onClinicSelect?.(clinic),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};