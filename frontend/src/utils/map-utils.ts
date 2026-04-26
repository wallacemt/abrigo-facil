import { Abrigo } from "@/types/api";

export const getMarkerColor = (abrigo: Abrigo): string => {
  if (!abrigo.ativo) return "text-gray-500";
  if (abrigo.vagas_disponiveis <= 0) return "text-red-500";

  const ratio = abrigo.vagas_disponiveis / abrigo.capacidade_total;
  if (ratio < 0.2) return "text-amber-500";

  return "text-emerald-500";
};
