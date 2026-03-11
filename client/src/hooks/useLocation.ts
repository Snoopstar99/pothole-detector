import { useState, useCallback } from "react";

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        // Try to get address from coordinates using reverse geocoding
        let address: string | undefined;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          address = data.address?.road || data.address?.street || data.display_name?.split(",")[0];
        } catch (err) {
          console.warn("Could not fetch address:", err);
        }

        const locationData: LocationData = {
          latitude,
          longitude,
          accuracy,
          address,
        };

        setLocation(locationData);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to get location");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, isLoading, error, getLocation };
}
