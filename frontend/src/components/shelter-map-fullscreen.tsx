"use client";

import { useMemo } from "react";
import { Map as LeafletMap, MapTileLayer } from "@/components/ui/map";
import { MapController } from "./map-control";
import { useShelters } from "@/hooks/useSchelters";
import { useGeolocation } from "@/lib/geolocation";
import { DEFAULT_CENTER } from "@/constants/map-constants";
import { MapStatus } from "./map-status";
import { UserRadius } from "./user-radius";
import { UserMarker } from "./user-marker";
import { ShelterMarker } from "./shelter-marker";

export function ShelterMapFullscreen() {
  const { abrigos, loading, error } = useShelters();
  const { location, isLoading: locating, error: locationError, requestPermission } = useGeolocation();

  const center = useMemo<[number, number]>(() => {
    if (location) return [location.latitude, location.longitude];
    if (abrigos.length) return [abrigos[0].latitude, abrigos[0].longitude];
    return DEFAULT_CENTER;
  }, [location, abrigos]);

  if (loading) return <MapStatus text="Carregando mapa de abrigos..." />;
  if (error) return <MapStatus text={error} error />;

  return (
    <LeafletMap center={center} zoom={location ? 14 : 12} className="overflow-y-hidden">
      <MapTileLayer name="Mapa" />
      <MapController
        location={location}
        locating={locating}
        locationError={locationError}
        requestPermission={requestPermission}
      />

      {location && <UserRadius location={location} />}
      {location && <UserMarker location={location} abrigos={abrigos} />}

      {abrigos.map((abrigo) => (
        <ShelterMarker key={abrigo.id} abrigo={abrigo} userLocation={location} />
      ))}
    </LeafletMap>
  );
}
