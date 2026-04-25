import { useState } from "react";

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface UseGeolocationResult {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => void;
}

export function useGeolocation(): UseGeolocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocalização não suportada pelo navegador.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoading(false);
      },
      (err) => {
        let errorMessage = "Erro ao obter localização.";
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage =
            "Permissão de localização negada. Verifique as configurações do navegador.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMessage = "Informação de localização indisponível.";
        } else if (err.code === err.TIMEOUT) {
          errorMessage = "Timeout ao obter localização.";
        }
        setError(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  return { location, isLoading, error, requestPermission };
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
