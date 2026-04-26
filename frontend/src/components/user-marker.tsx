"use client";

import { MapMarker, MapPopup } from "@/components/ui/map";
import { PROXIMITY_RADIUS_KM } from "@/constants/map-constants";
import { calculateDistance } from "@/lib/geolocation";
import { Abrigo } from "@/types/api";

export function UserMarker({
  location,
  abrigos,
}: {
  location: { latitude: number; longitude: number; accuracy: number };
  abrigos: Abrigo[];
}) {
  const proximityCount = abrigos.filter((abrigo: any) => {
    const distance = calculateDistance(location.latitude, location.longitude, abrigo.latitude, abrigo.longitude);
    return distance <= PROXIMITY_RADIUS_KM;
  }).length;

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
