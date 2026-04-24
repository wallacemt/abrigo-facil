"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchRequest } from "@/services/request";
import type { ApiEnvelope } from "@/types/api";

export default function CheckinPage() {
  const [pessoaId, setPessoaId] = useState("");
  const [codigoAbrigo, setCodigoAbrigo] = useState("");
  const [checkinIdSaida, setCheckinIdSaida] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCode = (value: string): string => {
    const normalized = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);

    if (normalized.length <= 3) {
      return normalized;
    }

    return `${normalized.slice(0, 3)}-${normalized.slice(3)}`;
  };

  const handleCheckin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetchRequest<ApiEnvelope<{ id: string }>>("/api/checkin", {
        method: "POST",
        body: {
          pessoa_id: pessoaId,
          codigo_abrigo: codigoAbrigo,
        },
      });

      setMessage(`Check-in realizado com sucesso. ID: ${response.data.data.id}`);
      setCodigoAbrigo("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao registrar check-in.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await fetchRequest(`/api/checkin/${checkinIdSaida}/saida`, {
        method: "PATCH",
      });
      setMessage("Check-out registrado com sucesso.");
      setCheckinIdSaida("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao registrar check-out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-6">
      <section className="rounded-2xl border border-blue-200 bg-card p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Check-in por Código</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Digite o código de 6 caracteres fornecido pelo abrigo para concluir o check-in.
        </p>
        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <form className="rounded-2xl border bg-card p-4 space-y-3" onSubmit={handleCheckin}>
          <h2 className="text-lg font-semibold">Registrar entrada</h2>
          <Input
            placeholder="ID da pessoa"
            value={pessoaId}
            onChange={(event) => setPessoaId(event.target.value)}
            required
          />
          <Input
            placeholder="Código do abrigo (ex: AD4-GR4)"
            value={codigoAbrigo}
            onChange={(event) => setCodigoAbrigo(formatCode(event.target.value))}
            required
            maxLength={7}
            pattern="[A-Z0-9]{3}-[A-Z0-9]{3}"
          />
          <p className="text-xs text-muted-foreground">Exemplo válido: AD4-GR4</p>
          <Button type="submit" className="rounded-lg bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Registrando..." : "Confirmar Check-in"}
          </Button>
        </form>

        <form className="rounded-2xl border bg-card p-4 space-y-2" onSubmit={handleCheckout}>
          <h2 className="text-lg font-semibold">Registrar saída (equipe)</h2>
          <Input
            placeholder="ID do check-in"
            value={checkinIdSaida}
            onChange={(event) => setCheckinIdSaida(event.target.value)}
            required
          />
          <Button type="submit" className="rounded-lg" variant="outline" disabled={loading}>
            {loading ? "Registrando..." : "Confirmar Check-out"}
          </Button>
        </form>
      </section>
    </main>
  );
}
