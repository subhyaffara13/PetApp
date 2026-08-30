import { useState, useEffect } from 'react';
import type { LocationState } from '../schemas';

export const useGeolocation = () => {
    const [location, setLocation] = useState<LocationState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        const onSuccess = (position: GeolocationPosition) => {
            const { latitude: lat, longitude: lon, accuracy } = position.coords;

            // Global valid coordinate range validation (rejects invalid null island or corrupt GPS)
            const isValidCoordinates =
                lat >= -90 &&
                lat <= 90 &&
                lon >= -180 &&
                lon <= 180 &&
                !(Math.abs(lat) < 0.001 && Math.abs(lon) < 0.001);

            if (!isValidCoordinates) {
                console.warn(`[useGeolocation] Rejected invalid GPS coordinates: lat=${lat}, lon=${lon}, accuracy=${accuracy}m`);
                setError('Browser geolocation returned invalid coordinates.');
                return;
            }

            setLocation({
                lat,
                lon,
            });
        };

        const onError = (err: GeolocationPositionError) => {
            setError(`Failed to get location: ${err.message}`);
        };

        // Request high-accuracy GPS
        navigator.geolocation.getCurrentPosition(onSuccess, onError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
        });

    }, []);

    return { location, error };
};
