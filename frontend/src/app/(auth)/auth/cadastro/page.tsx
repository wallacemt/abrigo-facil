"use client";

import { Eye, EyeClosed } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RegisterResponse {
  status: "success" | "error";
  message?: string;
}

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<"voluntario" | "coordenador">("voluntario");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, perfil }),
      });
      const data = (await response.json()) as RegisterResponse;

      if (!response.ok || data.status !== "success") {
        setMessage(data.message ?? "Falha ao cadastrar usuário.");
        return;
      }

      setMessage("Usuário cadastrado com sucesso. Redirecionado para login...");
      setNome("");
      setEmail("");
      setSenha("");
      setPerfil("voluntario");

      router.push("/auth/login");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Criar cadastro"
      description="Cadastre voluntários e coordenadores com a mesma experiência visual da página de login."
      footer={
        <p className="text-sm text-muted-foreground">
          Já possui conta?{" "}
          <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/auth/login">
            Fazer login
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome
          </label>
          <Input
            id="nome"
            placeholder="Nome completo"
            value={nome}
            onChange={(event) => setNome(event.target.value)}
            required
            className="rounded-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cadastro-email" className="text-sm font-medium">
            E-mail
          </label>
          <Input
            id="cadastro-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="rounded-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cadastro-senha" className="text-sm font-medium">
            Senha
          </label>
          <div className="relative flex items-center">
            <Input
              id="cadastro-senha"
              type={showPass ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
              className="rounded-full"
            />
            <Button
              variant="ghost"
              className="absolute right-0 rounded-full"
              type="button"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <Eye /> : <EyeClosed />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="perfil" className="text-sm font-medium">
            Perfil
          </label>
          <select
            id="perfil"
            className="h-11 w-full rounded-full border border-input bg-background px-3 text-sm"
            value={perfil}
            onChange={(event) => setPerfil(event.target.value as "voluntario" | "coordenador")}
          >
            <option value="voluntario">Voluntário</option>
            <option value="coordenador">Coordenador</option>
          </select>
        </div>

        {message ? (
          <p className="rounded-[1.25rem] bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
            {message}
          </p>
        ) : null}

        <Button type="submit" className="w-full rounded-full" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>
      </form>
    </AuthShell>
  );
}
