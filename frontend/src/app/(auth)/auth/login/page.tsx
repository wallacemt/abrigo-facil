"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeClosed } from "lucide-react";

interface LoginResponse {
  status: "success" | "error";
  message?: string;
  data?: {
    usuario?: {
      id: string;
      nome: string;
      perfil: "voluntario" | "coordenador";
    };
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nextPath, setNextPath] = useState("/abrigos");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next) {
      setNextPath(next);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = (await response.json()) as LoginResponse;

      if (!response.ok || data.status !== "success") {
        setMessage(data.message ?? "Falha ao autenticar usuário.");
        return;
      }

      setMessage(`Bem-vindo(a), ${data.data?.usuario?.nome ?? "usuário"}!`);
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
      <section className="rounded-2xl border bg-card p-5">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use o login de voluntário/coordenador para operar o sistema.
        </p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <div className="relative flex items-center">
            <Input
              type={showPass ?"text" :"password"}
              placeholder="Senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />

            <Button variant={"ghost"} className="absolute right-0" type="button" onClick={() => setShowPass(!showPass)}>
              {showPass ? <Eye /> : <EyeClosed />}
            </Button>
          </div>
          <Button type="submit" className="w-full rounded-lg" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Link href="/auth/cadastro" className="block">
            <Button type="button" variant="outline" className="w-full rounded-lg">
              Ir para cadastro
            </Button>
          </Link>
        </form>

        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </section>
    </main>
  );
}
