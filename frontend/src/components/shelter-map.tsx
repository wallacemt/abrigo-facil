"use client";

import { MapPinIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Map as LeafletMap, MapMarker, MapPopup, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import { cn } from "@/lib/utils";
import { fetchRequest } from "@/services/request";
import type { Abrigo, ApiEnvelope } from "@/types/api";

const DEFAULT_CENTER: [number, number] = [-30.0346, -51.2177];

const getMarkerColor = (abrigo: Abrigo): string => {
  if (!abrigo.ativo) {
    return "text-gray-500";
  }

  if (abrigo.vagas_disponiveis <= 0) {
    return "text-red-500";
  }

  const ratio = abrigo.vagas_disponiveis / abrigo.capacidade_total;
  if (ratio < 0.2) {
    return "text-amber-500";
  }

  return "text-emerald-500";
};

export function ShelterMap() {
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadShelters = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchRequest<ApiEnvelope<Abrigo[]>>("/api/abrigos", {
          method: "GET",
        });
        setAbrigos(response.data.data ?? []);
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : "Não foi possível carregar os abrigos.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void loadShelters();
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (abrigos.length === 0) {
      return DEFAULT_CENTER;
    }

    return [abrigos[0].latitude, abrigos[0].longitude];
  }, [abrigos]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Carregando mapa de abrigos...</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
          Com vagas
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-700">
          Poucas vagas
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-700">Lotado</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-gray-700">
          Desativado
        </span>
      </div>

      <div className="h-[68vh] w-full overflow-hidden rounded-2xl border border-blue-100 bg-card p-2 shadow-sm sm:h-[74vh]">
        <LeafletMap center={center} className="h-full w-full rounded-xl" zoom={12}>
          <MapTileLayer name="Mapa" />
          <MapZoomControl />
          {abrigos.map((abrigo) => (
            <MapMarker
              key={abrigo.id}
              position={[abrigo.latitude, abrigo.longitude]}
              icon={<MapPinIcon className={cn("size-8 drop-shadow-sm", getMarkerColor(abrigo))} />}
            >
              <MapPopup>
                <div className="space-y-1">
                  <p className="font-semibold">{abrigo.nome}</p>
                  <p className="text-xs text-muted-foreground">{abrigo.endereco}</p>
                  <p className="text-xs">
                    Vagas: <strong>{abrigo.vagas_disponiveis}</strong> / {abrigo.capacidade_total}
                  </p>
                </div>
              </MapPopup>
            </MapMarker>
          ))}
        </LeafletMap>
      </div>
    </section>
  );
}
