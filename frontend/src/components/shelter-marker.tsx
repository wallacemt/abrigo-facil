"use client";

import { MapMarker, MapPopup } from "@/components/ui/map";
import { calculateDistance, UserLocation } from "@/lib/geolocation";
import { cn } from "@/lib/utils";
import { Abrigo } from "@/types/api";
import { getMarkerColor } from "@/utils/map-utils";
import { MapPinIcon } from "lucide-react";
export function ShelterMarker({ abrigo, userLocation }: { abrigo: Abrigo; userLocation: UserLocation | null }) {
  return (
    <MapMarker
      position={[abrigo.latitude, abrigo.longitude]}
      icon={<MapPinIcon className={cn("size-8 drop-shadow-sm", getMarkerColor(abrigo))} />}
    >
      <MapPopup>
        <div className="flex flex-col gap-3 w-64 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
          {/* Header */}
          <div className="flex flex-col">
            <p className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate">{abrigo.nome}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{abrigo.endereco}</p>
          </div>

          {/* Código e Status */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs font-semibold text-foreground">Código: {abrigo.codigo_checkin}</span>
            <span
              className={`px-2 py-1 text-xs rounded-full font-semibold ${
                !abrigo.ativo
                  ? "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  : abrigo.vagas_disponiveis <= 0
                    ? "bg-red-100 text-red-700"
                    : abrigo.vagas_disponiveis / abrigo.capacidade_total < 0.2
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-700"
              }`}
            >
              {abrigo.ativo ? (abrigo.vagas_disponiveis > 0 ? "Aberto" : "Lotado") : "Fechado"}
            </span>
          </div>

          {/* Vagas */}
          <div className="flex justify-between mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
            <span>Vagas:</span>
            <span>
              {abrigo.vagas_disponiveis} / {abrigo.capacidade_total}
            </span>
          </div>

          {/* Distância do usuário */}
          {userLocation && (
            <div className="flex justify-between mt-2 text-xs font-medium text-emerald-600">
              <span>Distância:</span>
              <span>
                {calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  abrigo.latitude,
                  abrigo.longitude,
                ).toFixed(1)}{" "}
                km
              </span>
            </div>
          )}
        </div>
      </MapPopup>
    </MapMarker>
  );
}
