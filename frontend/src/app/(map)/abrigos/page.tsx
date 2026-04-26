"use client";

import Cookies from "js-cookie";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AbrigoForm, type CreateAbrigoFormValues } from "@/components/abrigos/abrigo-form";
import { AbrigoList } from "@/components/abrigos/abrigo-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PlaceFeature } from "@/components/ui/place-autocomplete";
import { FetchError, fetchRequest } from "@/services/request";
import type { Abrigo, ApiEnvelope } from "@/types/api";

const defaultForm: CreateAbrigoFormValues = {
  nome: "",
  endereco: "",
  latitude: "",
  longitude: "",
  capacidade_total: "",
};

const extractApiErrorMessage = (error: unknown): string => {
  if (error instanceof FetchError) {
    const payload = error.response as
      | {
          message?: string;
          errors?: Array<{ field: string; message: string }>;
        }
      | undefined;

    if (payload?.errors?.length) {
      return payload.errors.map((item) => `${item.field}: ${item.message}`).join(" | ");
    }

    if (payload?.message) {
      return payload.message;
    }
  }

  return error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
};

export default function AbrigosPage() {
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [form, setForm] = useState<CreateAbrigoFormValues>(defaultForm);
  const [perfil, setPerfil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"listar" | "adicionar">("listar");
  const [mapCenter] = useState<[number, number]>([-30.0346, -51.2177]);

  const canManageAbrigos = perfil === "coordenador";

  const visibleAbrigos = useMemo(() => {
    if (!canManageAbrigos) {
      return abrigos.filter((abrigo) => abrigo.ativo);
    }

    return abrigos;
  }, [abrigos, canManageAbrigos]);

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
      setMessage(extractApiErrorMessage(error));
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
      setActiveTab("listar");
      await loadAbrigos();
    } catch (error) {
      setMessage(extractApiErrorMessage(error));
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
      setMessage(extractApiErrorMessage(error));
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
      setMessage(extractApiErrorMessage(error));
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-6 pb-42 pt-24">
      <section className="glass-surface rounded-[2rem] p-5">
        <span className="glass-chip inline-flex text-primary uppercase tracking-[0.22em]">Abrigos</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Gestão de abrigos</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Visualize abrigos ativos, atualize vagas e mantenha o código de check-in sempre à mão.
        </p>
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "listar" | "adicionar")}>
            <TabsList>
              <TabsTrigger value="listar">Listar abrigos</TabsTrigger>
              {canManageAbrigos ? <TabsTrigger value="adicionar">Adicionar abrigo</TabsTrigger> : null}
            </TabsList>

            <TabsContent value="listar">
              <AbrigoList
                abrigos={visibleAbrigos}
                canManageAbrigos={canManageAbrigos}
                onUpdateVagas={handleAtualizarVagas}
                onDeactivate={handleDesativar}
              />
            </TabsContent>

            {canManageAbrigos ? (
              <TabsContent value="adicionar">
                <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
                  <AbrigoForm
                    form={form}
                    loading={loading}
                    showMapPicker={showMapPicker}
                    mapCenter={mapCenter}
                    onSubmit={handleCreate}
                    onToggleMapPicker={setShowMapPicker}
                    onPlaceSelect={handlePlaceSelect}
                    onMapClick={handleMapClick}
                    onFormChange={setForm}
                  />
                </div>
              </TabsContent>
            ) : null}
          </Tabs>
        </div>

        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </section>
    </main>
  );
}
