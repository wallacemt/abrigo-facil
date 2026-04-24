import Link from "next/link";
import { ShelterMap } from "@/components/shelter-map";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-5">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-emerald-50 p-5 shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">AbrigoFácil</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-700">
          Encontre abrigos no mapa em tempo real. Para usar funcionalidades operacionais como cadastro de abrigo,
          check-in e busca avançada, faça login.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/auth/login?next=/abrigos">
            <Button size="sm" className="min-h-11 rounded-lg bg-blue-600 hover:bg-blue-700">
              Gerenciar Abrigos
            </Button>
          </Link>
          <Link href="/auth/login?next=/checkin">
            <Button size="sm" variant="outline" className="min-h-11 rounded-lg border-blue-200">
              Fazer Check-in
            </Button>
          </Link>
          <Link href="/auth/login?next=/buscar">
            <Button size="sm" variant="outline" className="min-h-11 rounded-lg border-blue-200">
              Buscar Pessoa
            </Button>
          </Link>
        </div>
      </section>

      <ShelterMap />
    </main>
  );
}
