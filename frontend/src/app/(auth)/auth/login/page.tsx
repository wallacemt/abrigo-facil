"use client";

import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [nextPath, setNextPath] = useState("/perfil");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    const next = new URLSearchParams(window.location.search).get("next");
    setNextPath(next || "/perfil");
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
    } catch (_error) {
      setMessage("Erro inesperado no login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Entrar na sua conta"
      description="Use sua conta de voluntário ou coordenador para continuar no AbrigoFácil."
      footer={
        <p className="text-sm text-muted-foreground">
          Não tem conta?{" "}
          <a className="font-medium text-primary underline-offset-4 hover:underline" href="/auth/cadastro">
            Criar cadastro
          </a>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="senha" className="text-sm font-medium">
            Senha
          </label>
          <div className="relative flex items-center">
            <Input
              id="senha"
              type={showPass ? "text" : "password"}
              placeholder="Sua senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              className="rounded-full"
            />
            <Button
              variant="ghost"
              className="absolute right-0 rounded-full"
              type="button"
              size="sm"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <Eye className="h-4 w-4" /> : <EyeClosed className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {message ? (
          <p className="rounded-[1.25rem] bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {message}
          </p>
        ) : null}

        <Button type="submit" className="w-full rounded-full" disabled={loading} size="lg">
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
