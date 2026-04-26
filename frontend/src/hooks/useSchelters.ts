"use client";
import { fetchRequest } from "@/services/request";
import { Abrigo, ApiEnvelope } from "@/types/api";
import { useCallback, useEffect, useState } from "react";

export function useShelters() {
  const [abrigos, setAbrigos] = useState<Abrigo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadShelters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchRequest<ApiEnvelope<Abrigo[]>>("/api/abrigos", { method: "GET" });
      setAbrigos(response.data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os abrigos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadShelters();
  }, [loadShelters]);

  return { abrigos, loading, error, reload: loadShelters };
}
