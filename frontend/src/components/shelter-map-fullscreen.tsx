"use client";

import { LoaderCircleIcon, MapPinIcon, NavigationIcon } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Map as LeafletMap,
  MapCircle,
  MapControlContainer,
  MapMarker,
  MapPopup,
  MapTileLayer,
  MapZoomControl,
} from "@/components/ui/map";
import { calculateDistance, useGeolocation } from "@/lib/geolocation";
import { cn } from "@/lib/utils";
import { fetchRequest } from "@/services/request";
import type { Abrigo, ApiEnvelope } from "@/types/api";
import { MapController } from "./map-control";
import Image from "next/image";

const DEFAULT_CENTER: [number, number] = [-30.0346, -51.2177];
export const PROXIMITY_RADIUS_KM = 10;

// -----------------------------
// Helpers
// -----------------------------
const getMarkerColor = (abrigo: Abrigo): string => {
  if (!abrigo.ativo) return "text-gray-500";
  if (abrigo.vagas_disponiveis <= 0) return "text-red-500";

  const ratio = abrigo.vagas_disponiveis / abrigo.capacidade_total;
  if (ratio < 0.2) return "text-amber-500";

  return "text-emerald-500";
};

// -----------------------------
// Hook de dados (extraído)
// -----------------------------
function useShelters() {
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShelters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchRequest<ApiEnvelope<Abrigo[]>>("/api/abrigos", { method: "GET" });

      setAbrigos(response.data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os abrigos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShelters();
  }, [loadShelters]);

  return { abrigos, loading, error, reload: loadShelters };
}

// -----------------------------
// Component principal
// -----------------------------
export function ShelterMapFullscreen() {
  const { abrigos, loading, error } = useShelters();

  const { location, isLoading: locating, error: locationError, requestPermission } = useGeolocation();

  // -----------------------------
  // Memoizações
  // -----------------------------
  const center = useMemo<[number, number]>(() => {
    if (location) return [location.latitude, location.longitude];
    if (abrigos.length) return [abrigos[0].latitude, abrigos[0].longitude];
    return DEFAULT_CENTER;
  }, [location, abrigos]);

  const proximityAbrigos = useMemo(() => {
    if (!location) return [];

    return abrigos.filter((abrigo) => {
      const distance = calculateDistance(location.latitude, location.longitude, abrigo.latitude, abrigo.longitude);
      return distance <= PROXIMITY_RADIUS_KM;
    });
  }, [location, abrigos]);

  // -----------------------------
  // Estados de UI
  // -----------------------------
  if (loading) return <MapStatus text="Carregando mapa de abrigos..." />;

  if (error) return <MapStatus text={error} error />;
  
  // -----------------------------
  // Render
  // -----------------------------
  return (
    <LeafletMap center={center} className=" overflow-y-hidden" zoom={location ? 14 : 12}>
      <MapTileLayer name="Mapa" />
      <MapController
        location={location}
        locating={locating}
        locationError={locationError}
        requestPermission={requestPermission}
        proximityCount={proximityAbrigos.length}
      />


      {location && <UserRadius location={location} />}

      {location && <UserMarker location={location} proximityCount={proximityAbrigos.length} />}

      {abrigos.map((abrigo) => (
        <ShelterMarker key={abrigo.id} abrigo={abrigo} userLocation={location} />
      ))}
    </LeafletMap>
  );
}

// -----------------------------
// Subcomponentes (clean UI)
// -----------------------------
function MapStatus({ text, error }: { text: string; error?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background flex-col gap-3">
      <Image src={"/logo.png"} width={100} height={100} alt="app logo" className="animate-spin" />
      <p className={cn("text-sm", error && "text-destructive")}>{text}</p>
    </div>
  );
}



function UserRadius({ location }: any) {
  return (
    <MapCircle
      center={[location.latitude, location.longitude]}
      radius={PROXIMITY_RADIUS_KM * 1000}
      className="fill-blue-500/10 stroke-blue-500"
      pathOptions={{ dashArray: "5, 5", weight: 2 }}
    />
  );
}

function UserMarker({ location, proximityCount }: any) {
  return (
    <MapMarker
      position={[location.latitude, location.longitude]}
      icon={
        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-100">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
        </div>
      }
    >
      <MapPopup>
        <div className="space-y-1">
          <p className="font-semibold">Sua localização</p>
          <p className="text-xs text-muted-foreground">Precisão: {Math.round(location.accuracy)}m</p>
          {proximityCount > 0 && (
            <p className="text-xs font-semibold text-blue-600">{proximityCount} abrigo(s) próximo(s)</p>
          )}
        </div>
      </MapPopup>
    </MapMarker>
  );
}

function ShelterMarker({ abrigo, userLocation }: any) {
  return (
    <MapMarker
      position={[abrigo.latitude, abrigo.longitude]}
      icon={<MapPinIcon className={cn("size-8 drop-shadow-sm", getMarkerColor(abrigo))} />}
    >
      <MapPopup>
        <div className="space-y-1">
          <p className="font-semibold">{abrigo.nome}</p>
          <p className="text-xs text-muted-foreground">{abrigo.endereco}</p>
          <p className="text-xs font-semibold text-blue-700">Código: {abrigo.codigo_checkin}</p>
          <p className="text-xs">
            Vagas: <strong>{abrigo.vagas_disponiveis}</strong> /{abrigo.capacidade_total}
          </p>

          {userLocation && (
            <p className="mt-2 text-xs font-semibold text-emerald-600">
              {calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                abrigo.latitude,
                abrigo.longitude,
              ).toFixed(1)}{" "}
              km de distância
            </p>
          )}
        </div>
      </MapPopup>
    </MapMarker>
  );
}
