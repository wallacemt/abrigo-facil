"use client";

import { Button } from "@/components/ui/button";
import type { Abrigo } from "@/types/api";

interface AbrigoListProps {
  abrigos: Abrigo[];
  canManageAbrigos: boolean;
  onUpdateVagas: (abrigo: Abrigo) => Promise<void>;
  onDeactivate: (abrigoId: string) => Promise<void>;
}

export function AbrigoList({ abrigos, canManageAbrigos, onUpdateVagas, onDeactivate }: AbrigoListProps) {
  if (abrigos.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/60 p-6 text-center text-sm text-muted-foreground">
        Nenhum abrigo cadastrado até o momento.
      </div>
    );
  }

  return (
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
                onClick={() => void onUpdateVagas(abrigo)}
              >
                Atualizar Vagas
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 rounded-full"
                onClick={() => void onDeactivate(abrigo.id)}
              >
                Desativar
              </Button>
            </div>
          ) : null}
        </article>
      ))}
    </section>
  );
}
