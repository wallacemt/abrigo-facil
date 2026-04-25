"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchRequest } from "@/services/request";
import type { ApiEnvelope } from "@/types/api";

interface SearchPerson {
  id: string;
  nome: string;
  status: "desaparecida" | "em_abrigo" | "encontrada";
  checkin_id?: string | null;
  abrigo_atual?: {
    id: string;
    nome: string;
    endereco: string;
  };
}

const PAGE_SIZE = 6;

export default function CheckinPage() {
  const [pessoaId, setPessoaId] = useState("");
  const [codigoAbrigo, setCodigoAbrigo] = useState("");
  const [checkinIdSaida, setCheckinIdSaida] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchPerson[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);

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

  useEffect(() => {
    const timer = setTimeout(async () => {
      const query = searchQuery.trim();

      if (query.length < 2) {
        setSearchResults([]);
        setSearchPage(1);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);

      try {
        const response = await fetchRequest<ApiEnvelope<SearchPerson[]>>(
          `/api/pessoas/buscar?nome=${encodeURIComponent(query)}`,
          { method: "GET" },
        );

        setSearchResults(response.data.data ?? []);
        setSearchPage(1);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro ao buscar pessoas.");
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalPages = Math.max(1, Math.ceil(searchResults.length / PAGE_SIZE));
  const pagedResults = useMemo(
    () => searchResults.slice((searchPage - 1) * PAGE_SIZE, searchPage * PAGE_SIZE),
    [searchPage, searchResults],
  );

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
      setPessoaId("");
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

  const handleSelectPerson = (person: SearchPerson) => {
    setPessoaId(person.id);
    if (person.checkin_id) {
      setCheckinIdSaida(person.checkin_id);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pt-24 py-6 pb-32 sm:pb-20">
      <section className="glass-surface rounded-[2rem] p-5">
        <span className="glass-chip inline-flex text-primary uppercase tracking-[0.22em]">Check-in</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Check-in por código</h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Busque a pessoa, selecione com um toque e conclua a entrada ou saída sem perder tempo.
        </p>
        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </section>

      <section className="glass-surface rounded-[2rem] p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">Buscar usuários</h2>
            <p className="text-sm text-muted-foreground">
              Digite ao menos 2 caracteres para listar pessoas com paginação.
            </p>
          </div>
          <div className="w-full sm:max-w-sm">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por nome..."
              className="rounded-full"
            />
          </div>
        </div>

        {searchLoading ? <p className="text-sm text-muted-foreground">Buscando pessoas...</p> : null}

        {pagedResults.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pagedResults.map((person) => (
              <article key={person.id} className="glass-surface rounded-[1.5rem] p-4">
                <p className="font-semibold">{person.nome}</p>
                <p className="text-xs text-muted-foreground">ID: {person.id}</p>
                <div className="mt-2 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  {person.status}
                </div>
                {person.abrigo_atual ? (
                  <p className="mt-2 text-xs text-muted-foreground">Abrigo atual: {person.abrigo_atual.nome}</p>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Sem abrigo ativo.</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => handleSelectPerson(person)}
                  >
                    Usar na Entrada
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => {
                      setPessoaId(person.id);
                      if (person.checkin_id) {
                        setCheckinIdSaida(person.checkin_id);
                      }
                    }}
                    disabled={!person.checkin_id}
                  >
                    {person.checkin_id ? "Usar na Saída" : "Sem check-in ativo"}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : searchQuery.trim().length >= 2 ? (
          <p className="text-sm text-muted-foreground">Nenhuma pessoa encontrada para essa busca.</p>
        ) : null}

        {searchResults.length > PAGE_SIZE ? (
          <div className="mt-4 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setSearchPage((page) => Math.max(1, page - 1))}
              disabled={searchPage === 1}
            >
              Anterior
            </Button>
            <p className="text-xs text-muted-foreground">
              Página {searchPage} de {totalPages}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setSearchPage((page) => Math.min(totalPages, page + 1))}
              disabled={searchPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <form
          className="space-y-3 rounded-[2rem] border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur"
          onSubmit={handleCheckin}
        >
          <h2 className="text-lg font-semibold">Registrar entrada</h2>
          <Input
            placeholder="ID da pessoa"
            value={pessoaId}
            onChange={(event) => setPessoaId(event.target.value)}
            required
            className="rounded-full"
          />
          <Input
            placeholder="Código do abrigo (ex: AD4-GR4)"
            value={codigoAbrigo}
            onChange={(event) => setCodigoAbrigo(formatCode(event.target.value))}
            required
            maxLength={7}
            pattern="[A-Z0-9]{3}-[A-Z0-9]{3}"
            className="rounded-full"
          />
          <p className="text-xs text-muted-foreground">Exemplo válido: AD4-GR4</p>
          <Button type="submit" className="rounded-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? "Registrando..." : "Confirmar Check-in"}
          </Button>
        </form>

        <form
          className="space-y-3 rounded-[2rem] border border-border/70 bg-background/70 p-4 shadow-sm backdrop-blur"
          onSubmit={handleCheckout}
        >
          <h2 className="text-lg font-semibold">Registrar saída (equipe)</h2>
          <Input
            placeholder="ID do check-in"
            value={checkinIdSaida}
            onChange={(event) => setCheckinIdSaida(event.target.value)}
            required
            className="rounded-full"
          />
          <p className="text-xs text-muted-foreground">
            Use a busca acima para preencher automaticamente quando a pessoa estiver em abrigo.
          </p>
          <Button type="submit" className="rounded-full" variant="outline" disabled={loading}>
            {loading ? "Registrando..." : "Confirmar Check-out"}
          </Button>
        </form>
      </section>
    </main>
  );
}
