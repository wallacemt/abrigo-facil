"use client";

import type { LeafletMouseEvent } from "leaflet";
import { MapIcon } from "lucide-react";
import { useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map as LeafletMap, MapMarker, MapTileLayer, MapZoomControl } from "@/components/ui/map";
import type { PlaceFeature } from "@/components/ui/place-autocomplete";
import { PlaceAutocomplete } from "@/components/ui/place-autocomplete";

export interface CreateAbrigoFormValues {
  nome: string;
  endereco: string;
  latitude: string;
  longitude: string;
  capacidade_total: string;
}

interface AbrigoFormProps {
  form: CreateAbrigoFormValues;
  loading: boolean;
  showMapPicker: boolean;
  mapCenter: [number, number];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onToggleMapPicker: (value: boolean) => void;
  onPlaceSelect: (place: PlaceFeature) => void;
  onMapClick: (lat: number, lng: number) => void;
  onFormChange: (next: CreateAbrigoFormValues) => void;
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export function AbrigoForm({
  form,
  loading,
  showMapPicker,
  mapCenter,
  onSubmit,
  onToggleMapPicker,
  onPlaceSelect,
  onMapClick,
  onFormChange,
}: AbrigoFormProps) {
  const hasCoordinates = Boolean(form.latitude && form.longitude);
  const capacity = Number(form.capacidade_total);
  const canSubmit =
    form.nome.trim().length >= 2 &&
    form.endereco.trim().length >= 5 &&
    hasCoordinates &&
    Number.isFinite(capacity) &&
    capacity > 0;

  return (
    <div className="space-y-4">
      {!showMapPicker ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2 rounded-full"
            onClick={() => onToggleMapPicker(true)}
          >
            <MapIcon size={18} />
            {hasCoordinates ? "Mudar Localização" : "Selecionar Localização no Mapa"}
          </Button>
          {hasCoordinates ? (
            <div className="flex flex-col justify-center rounded-[1.25rem] border border-blue-200 bg-blue-50 px-3 py-2 text-xs dark:bg-blue-950">
              <p className="font-semibold text-blue-700 dark:text-blue-300">Localização</p>
              <p className="text-blue-600 dark:text-blue-400">
                {form.latitude.substring(0, 10)}, {form.longitude.substring(0, 10)}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative h-96 overflow-hidden rounded-[1.75rem] border border-border/70">
            <LeafletMap
              center={
                hasCoordinates ? ([Number(form.latitude), Number(form.longitude)] as [number, number]) : mapCenter
              }
              zoom={14}
            >
              <MapTileLayer />
              <MapZoomControl />
              <MapClickHandler onMapClick={onMapClick} />
              {hasCoordinates ? <MapMarker position={[Number(form.latitude), Number(form.longitude)]} /> : null}
            </LeafletMap>
          </div>
          <Button type="button" className="w-full rounded-full" onClick={() => onToggleMapPicker(false)}>
            Confirmar Localização
          </Button>
        </div>
      )}

      <PlaceAutocomplete onPlaceSelect={onPlaceSelect} placeholder="Buscar endereço..." className="rounded-full" />

      <form className="grid gap-2 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
        <Input
          placeholder="Nome do abrigo"
          value={form.nome}
          onChange={(event) => onFormChange({ ...form, nome: event.target.value })}
          required
          className="rounded-full md:col-span-2"
        />
        <Input
          placeholder="Endereço"
          value={form.endereco}
          onChange={(event) => onFormChange({ ...form, endereco: event.target.value })}
          required
          className="rounded-full md:col-span-2"
        />
        <div className="grid grid-cols-2 gap-2 md:col-span-2">
          <Input
            type="number"
            step="0.0000001"
            placeholder="Latitude"
            value={form.latitude}
            onChange={(event) => onFormChange({ ...form, latitude: event.target.value })}
            required
            className="rounded-full"
          />
          <Input
            type="number"
            step="0.0000001"
            placeholder="Longitude"
            value={form.longitude}
            onChange={(event) => onFormChange({ ...form, longitude: event.target.value })}
            required
            className="rounded-full"
          />
        </div>
        <Input
          type="number"
          placeholder="Capacidade total"
          value={form.capacidade_total}
          onChange={(event) => onFormChange({ ...form, capacidade_total: event.target.value })}
          required
          className="rounded-full"
          min={1}
        />
        <Button type="submit" className="rounded-full bg-blue-600 hover:bg-blue-700" disabled={loading || !canSubmit}>
          {loading ? "Salvando..." : "Cadastrar Abrigo"}
        </Button>
      </form>

      {!canSubmit ? (
        <p className="text-xs text-muted-foreground">
          Preencha nome, endereço, coordenadas e capacidade para cadastrar.
        </p>
      ) : null}
    </div>
  );
}
