"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";

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

      router.push('/auth/login')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
      <section className="rounded-2xl border bg-card p-5">
        <h1 className="text-2xl font-bold">Cadastro de Usuário</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cadastre voluntários e coordenadores para operar o sistema.
        </p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <Input placeholder="Nome" value={nome} onChange={(event) => setNome(event.target.value)} required />
          <Input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <div className="flex items-center relative">
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              required
            />
            <Button variant={"ghost"} className="absolute right-0" type="button" onClick={() => setShowPass(!showPass)}>
              {showPass ? <Eye /> : <EyeClosed />}
            </Button>
          </div>
          <select
            className="h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 text-sm"
            value={perfil}
            onChange={(event) => setPerfil(event.target.value as "voluntario" | "coordenador")}
          >
            <option value="voluntario">Voluntário</option>
            <option value="coordenador">Coordenador</option>
          </select>

          <Button type="submit" className="w-full rounded-lg" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
      </section>
    </main>
  );
}
