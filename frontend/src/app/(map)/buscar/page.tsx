"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchRequest } from "@/services/request";
import type { ApiEnvelope, PessoaSearchResult } from "@/types/api";

export default function BuscarPessoaPage() {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [results, setResults] = useState<PessoaSearchResult[]>([]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetchRequest<ApiEnvelope<PessoaSearchResult[]>>(
        `/api/pessoas/buscar?nome=${encodeURIComponent(nome)}`,
        { method: "GET" },
      );
      setResults(response.data.data ?? []);
      if ((response.data.data ?? []).length === 0) {
        setMessage("Nenhuma pessoa encontrada para este nome.");
      }
    } catch (error) {
      setResults([]);
      setMessage(error instanceof Error ? error.message : "Erro na busca.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
      <section className="rounded-2xl border bg-card p-5">
        <h1 className="text-2xl font-bold">Buscar Pessoa</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Busca pública de pessoas desaparecidas e localizadas em abrigos.
        </p>

        <form className="mt-4 flex gap-2" onSubmit={handleSearch}>
          <Input
            placeholder="Digite o nome da pessoa"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
          />
          <Button type="submit" disabled={loading} className="rounded-lg">
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </form>

        {message ? (
          <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        ) : null}
      </section>

      <section className="grid gap-3">
        {results.map((person) => (
          <article key={person.id} className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold">{person.nome}</p>
            <p className="text-xs text-muted-foreground">
              Status: {person.status}
            </p>
            {person.abrigo_atual ? (
              <p className="mt-2 text-xs">
                Abrigo: <strong>{person.abrigo_atual.nome}</strong> -{" "}
                {person.abrigo_atual.endereco}
              </p>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
