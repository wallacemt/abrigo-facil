"use client";

import Cookies from "js-cookie";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function AbrigosPage() {
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [form, setForm] = useState<CreateAbrigoForm>(defaultForm);
  const [perfil, setPerfil] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      await loadAbrigos();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao cadastrar abrigo.");
    } finally {
      setLoading(false);
    }
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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-6">
      <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <h1 className="text-2xl font-bold">Abrigos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visualize os abrigos ativos e seu código de check-in.</p>

        {canManageAbrigos ? (
          <form className="mt-4 grid gap-2 md:grid-cols-2" onSubmit={handleCreate}>
            <Input
              placeholder="Nome do abrigo"
              value={form.nome}
              onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
              required
            />
            <Input
              placeholder="Endereço"
              value={form.endereco}
              onChange={(event) => setForm((prev) => ({ ...prev, endereco: event.target.value }))}
              required
            />
            <Input
              type="number"
              step="0.0000001"
              placeholder="Latitude"
              value={form.latitude}
              onChange={(event) => setForm((prev) => ({ ...prev, latitude: event.target.value }))}
              required
            />
            <Input
              type="number"
              step="0.0000001"
              placeholder="Longitude"
              value={form.longitude}
              onChange={(event) => setForm((prev) => ({ ...prev, longitude: event.target.value }))}
              required
            />
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
            />
            <Button type="submit" className="rounded-lg bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Salvando..." : "Cadastrar Abrigo"}
            </Button>
          </form>
        ) : (
          <div className="mt-4 rounded-lg border border-orange-500/30 bg-orange-50 px-3 py-2 text-sm text-orange-800">
            Apenas usuários coordenadores podem cadastrar, atualizar vagas e desativar abrigos.
          </div>
        )}

        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </section>

      <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {abrigos.map((abrigo) => (
          <article key={abrigo.id} className="rounded-xl border bg-card p-4">
            <p className="font-semibold text-gray-900">{abrigo.nome}</p>
            <p className="mt-1 text-xs text-muted-foreground">{abrigo.endereco}</p>
            <p className="mt-2 text-xs font-semibold text-blue-700">Código de check-in: {abrigo.codigo_checkin}</p>
            <p className="mt-2 text-sm">
              Vagas: <strong>{abrigo.vagas_disponiveis}</strong> / {abrigo.capacidade_total}
            </p>
            <p className="text-xs text-muted-foreground">Status: {abrigo.ativo ? "Ativo" : "Desativado"}</p>
            {canManageAbrigos ? (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => void handleAtualizarVagas(abrigo)}
                >
                  Atualizar Vagas
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-lg"
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
