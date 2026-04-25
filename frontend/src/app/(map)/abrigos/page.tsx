"use client";

import Cookies from "js-cookie";
import type { LeafletMouseEvent } from "leaflet";
import { MapIcon } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map as LeafletMap, MapMarker, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import type { PlaceFeature } from "@/components/ui/place-autocomplete";
import { PlaceAutocomplete } from "@/components/ui/place-autocomplete";
import { fetchRequest } from "@/services/request";
import type { Abrigo, ApiEnvelope } from "@/types/api";

interface CreateAbrigoForm {
  nome: string;
  endereco: string;
  latitude: string;
  longitude: string;
  capacidade_total: string;
}

const defaultForm: CreateAbrigoForm = {
  nome: "",
  endereco: "",
  latitude: "",
  longitude: "",
  capacidade_total: "",
};

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function AbrigosPage() {
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [form, setForm] = useState<CreateAbrigoForm>(defaultForm);
  const [perfil, setPerfil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter] = useState<[number, number]>([-30.0346, -51.2177]);

  const canManageAbrigos = perfil === "coordenador";

  useEffect(() => {
    setPerfil(Cookies.get("abrigofacil.perfil") ?? null);
  }, []);

  const loadAbrigos = useCallback(async () => {
    try {
      const response = await fetchRequest<ApiEnvelope<Abrigo[]>>("/api/abrigos", {
        method: "GET",
      });
      setAbrigos(response.data.data ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao carregar abrigos.");
    }
  }, []);

  useEffect(() => {
    void loadAbrigos();
  }, [loadAbrigos]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await fetchRequest<ApiEnvelope<{ id: string }>>("/api/abrigos", {
        method: "POST",
        body: {
          nome: form.nome,
          endereco: form.endereco,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          capacidade_total: Number(form.capacidade_total),
        },
      });

      setMessage("Abrigo cadastrado com sucesso.");
      setForm(defaultForm);
      setShowMapPicker(false);
      await loadAbrigos();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao cadastrar abrigo.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceSelect = (place: PlaceFeature) => {
    const [longitude, latitude] = place.geometry.coordinates;
    const endereco =
      place.properties.name ?? place.properties.street ?? place.properties.city ?? place.properties.state ?? "";

    setForm((prev) => ({
      ...prev,
      endereco,
      latitude: String(latitude),
      longitude: String(longitude),
    }));
    setShowMapPicker(false);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setForm((prev) => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
    }));
  };

  const handleAtualizarVagas = async (abrigo: Abrigo) => {
    const novoValor = window.prompt(
      `Atualizar vagas de ${abrigo.nome}. Valor atual: ${abrigo.vagas_disponiveis}`,
      String(abrigo.vagas_disponiveis),
    );

    if (novoValor === null) {
      return;
    }

    try {
      await fetchRequest(`/api/abrigos/${abrigo.id}/vagas`, {
        method: "PATCH",
        body: { vagas_disponiveis: Number(novoValor) },
      });
      setMessage("Vagas atualizadas com sucesso.");
      await loadAbrigos();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao atualizar vagas.");
    }
  };

  const handleDesativar = async (abrigoId: string) => {
    try {
      await fetchRequest(`/api/abrigos/${abrigoId}/desativar`, {
        method: "PATCH",
      });
      setMessage("Abrigo desativado com sucesso.");
      await loadAbrigos();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao desativar abrigo.");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pt-24 py-6 pb-42">
      <section className="glass-surface rounded-[2rem] p-5">
        <span className="glass-chip inline-flex text-primary uppercase tracking-[0.22em]">Abrigos</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Gestão de abrigos</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Visualize abrigos ativos, atualize vagas e mantenha o código de check-in sempre à mão.
        </p>

        {canManageAbrigos && (
          <div className="mt-4 space-y-4">
            {/* Location Picker */}
            {!showMapPicker ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 gap-2 rounded-full"
                  onClick={() => setShowMapPicker(true)}
                >
                  <MapIcon size={18} />
                  {form.latitude && form.longitude ? "Mudar Localização" : "Selecionar Localização no Mapa"}
                </Button>
                {form.latitude && form.longitude && (
                  <div className="flex flex-col justify-center rounded-[1.25rem] border border-blue-200 bg-blue-50 px-3 py-2 text-xs dark:bg-blue-950">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">Localização</p>
                    <p className="text-blue-600 dark:text-blue-400">
                      {form.latitude.substring(0, 10)}, {form.longitude.substring(0, 10)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative h-96 overflow-hidden rounded-[1.75rem] border border-border/70">
                  <LeafletMap
                    center={
                      form.latitude && form.longitude
                        ? ([Number(form.latitude), Number(form.longitude)] as [number, number])
                        : mapCenter
                    }
                    zoom={14}
                  >
                    <MapTileLayer />
                    <MapZoomControl />
                    <MapClickHandler onMapClick={handleMapClick} />
                    {form.latitude && form.longitude && (
                      <MapMarker position={[Number(form.latitude), Number(form.longitude)]} />
                    )}
                  </LeafletMap>
                </div>
                <Button type="button" className="w-full rounded-full" onClick={() => setShowMapPicker(false)}>
                  Confirmar Localização
                </Button>
              </div>
            )}

            {/* Place Autocomplete */}
            <PlaceAutocomplete
              onPlaceSelect={handlePlaceSelect}
              placeholder="Buscar endereço..."
              className="rounded-full" 
            />

            {/* Form Inputs */}
            <form className="grid gap-2 md:grid-cols-2" onSubmit={handleCreate}>
              <Input
                placeholder="Nome do abrigo"
                value={form.nome}
                onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
                required
                className="rounded-full md:col-span-2"
              />
              <Input
                placeholder="Endereço"
                value={form.endereco}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    endereco: event.target.value,
                  }))
                }
                required
                className="rounded-full md:col-span-2"
                disabled
              />
              <div className="grid grid-cols-2 gap-2 md:col-span-2">
                <Input
                  type="number"
                  step="0.0000001"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      latitude: event.target.value,
                    }))
                  }
                  required
                  className="rounded-full"
                  disabled
                />
                <Input
                  type="number"
                  step="0.0000001"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      longitude: event.target.value,
                    }))
                  }
                  required
                  className="rounded-full"
                  disabled
                />
              </div>
              <Input
                type="number"
                placeholder="Capacidade total"
                value={form.capacidade_total}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    capacidade_total: event.target.value,
                  }))
                }
                required
                className="rounded-full"
              />
              <Button
                type="submit"
                className="rounded-full bg-blue-600 hover:bg-blue-700"
                disabled={loading || !form.latitude || !form.longitude || !form.capacidade_total}
              >
                {loading ? "Salvando..." : "Cadastrar Abrigo"}
              </Button>
            </form>
          </div>
        ) }

        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {abrigos.map((abrigo) => (
          <article key={abrigo.id} className="glass-surface rounded-[1.75rem] p-4">
            <p className="font-semibold text-foreground">{abrigo.nome}</p>
            <p className="mt-1 text-xs text-muted-foreground">{abrigo.endereco}</p>
            <div className="mt-3 space-y-2 rounded-[1.25rem] border border-blue-200 bg-blue-50 p-2 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Código de check-in:</p>
              <p className="font-mono text-sm font-bold text-blue-900 dark:text-blue-100">{abrigo.codigo_checkin}</p>
            </div>
            <p className="mt-2 text-sm">
              Vagas: <strong>{abrigo.vagas_disponiveis}</strong> /{abrigo.capacidade_total}
            </p>
            <p className="text-xs text-muted-foreground">Status: {abrigo.ativo ? "Ativo" : "Desativado"}</p>
            {canManageAbrigos ? (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => void handleAtualizarVagas(abrigo)}
                >
                  Atualizar Vagas
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 rounded-full"
                  onClick={() => void handleDesativar(abrigo.id)}
                >
                  Desativar
                </Button>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
