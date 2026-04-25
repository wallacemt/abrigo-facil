"use client";

import Cookies from "js-cookie";
import { CameraIcon, LogOutIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { AppBrand } from "@/components/app-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_AVATAR_COOKIE_NAME, AUTH_NAME_COOKIE_NAME, AUTH_PROFILE_COOKIE_NAME } from "@/lib/auth-cookies";
import { getSupabaseBrowserClient, SUPABASE_AVATAR_BUCKET } from "@/lib/supabase";

interface SessionResponse {
  status: string;
  data?: {
    isAuthenticated?: boolean;
    usuario?: {
      nome?: string | null;
      perfil?: string | null;
      avatarUrl?: string | null;
    } | null;
  };
}

interface UserState {
  nome?: string;
  perfil?: string | null;
  avatarUrl?: string | null;
}

const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ProfilePage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [usuario, setUsuario] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const data = (await response.json()) as SessionResponse;

        if (!data.data?.isAuthenticated) {
          router.replace("/auth/login?next=/perfil");
          return;
        }

        const nomeFromSession = data.data?.usuario?.nome ?? Cookies.get("abrigofacil.nome") ?? "Usuário";
        const perfilFromSession = data.data?.usuario?.perfil ?? Cookies.get(AUTH_PROFILE_COOKIE_NAME) ?? null;
        const avatarFromSession = data.data?.usuario?.avatarUrl ?? Cookies.get(AUTH_AVATAR_COOKIE_NAME) ?? null;

        setUsuario({
          nome: nomeFromSession,
          perfil: perfilFromSession,
          avatarUrl: avatarFromSession,
        });
        setNome(nomeFromSession);
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, [router]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      Cookies.remove("abrigofacil.token");
      Cookies.remove(AUTH_PROFILE_COOKIE_NAME);
      Cookies.remove(AUTH_NAME_COOKIE_NAME);
      Cookies.remove(AUTH_AVATAR_COOKIE_NAME);
      router.push("/auth/login");
      router.refresh();
    } catch (_error) {
      setMensagem("Erro ao fazer logout.");
    }
  };

  const handleSaveName = async () => {
    if (!nome.trim()) {
      setMensagem("Nome não pode estar vazio.");
      return;
    }

    try {
      Cookies.set(AUTH_NAME_COOKIE_NAME, nome);
      setUsuario((prev) => (prev ? { ...prev, nome } : null));
      setEditing(false);
      setMensagem("Nome atualizado com sucesso!");
      setTimeout(() => setMensagem(null), 3000);
    } catch (_error) {
      setMensagem("Erro ao atualizar nome.");
    }
  };

  const handleAvatarSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      return;
    }

    if (!ACCEPTED_AVATAR_TYPES.includes(selectedFile.type)) {
      setMensagem("Use uma imagem JPG, PNG ou WEBP.");
      event.target.value = "";
      return;
    }

    setMensagem(null);
    setAvatarFile(selectedFile);
    setAvatarPreview((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return URL.createObjectURL(selectedFile);
    });
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !usuario) {
      setMensagem("Escolha uma imagem antes de enviar.");
      return;
    }

    setSavingAvatar(true);
    setMensagem(null);

    try {
      const supabaseBrowserClient = getSupabaseBrowserClient();
      const fileExtension = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `public/avatars/${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

      const { error: uploadError } = await supabaseBrowserClient.storage
        .from(SUPABASE_AVATAR_BUCKET)
        .upload(filePath, avatarFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: avatarFile.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabaseBrowserClient.storage.from(SUPABASE_AVATAR_BUCKET).getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      Cookies.set(AUTH_AVATAR_COOKIE_NAME, avatarUrl, { expires: 7 });
      setUsuario((current) => (current ? { ...current, avatarUrl } : current));
      setAvatarFile(null);
      setAvatarPreview((currentPreview) => {
        if (currentPreview) {
          URL.revokeObjectURL(currentPreview);
        }

        return null;
      });
      if (avatarInputRef.current) {
        avatarInputRef.current.value = "";
      }
      setMensagem("Foto de perfil atualizada com sucesso!");
      setTimeout(() => setMensagem(null), 3000);
    } catch (_error) {
      setMensagem("Não foi possível enviar a foto. Verifique o bucket do Supabase Storage.");
    } finally {
      setSavingAvatar(false);
    }
  };

  const avatarDisplayUrl = avatarPreview ?? usuario?.avatarUrl ?? null;

  if (loading) {
    return (
      <main className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando perfil...</p>
      </main>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 pb-32 sm:pb-20">
      <div className="flex items-center justify-between gap-4">
        <AppBrand compact />
        <ThemeToggle />
      </div>

      <div className="space-y-2">
        <span className="glass-chip inline-flex text-primary uppercase tracking-[0.22em]">Perfil</span>
        <h1 className="text-3xl font-semibold tracking-tight">Meu Perfil</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Ajuste suas informações e finalize a sessão quando quiser.
        </p>
      </div>

      <section className="glass-surface rounded-[2rem] p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10">
            {avatarDisplayUrl ? (
              <Image
                src={avatarDisplayUrl}
                alt={usuario.nome || "Foto do perfil"}
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <UserIcon className="text-primary" size={32} />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Usuário</p>
            <p className="font-semibold">{usuario.nome || "Sem nome"}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {usuario.perfil === "coordenador" ? "Coordenador de Abrigo" : "Voluntário"}
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-[1.5rem] border border-dashed border-border/80 bg-background/60 p-4">
          <div>
            <p className="text-sm font-medium">Foto de perfil</p>
            <p className="text-xs text-muted-foreground">
              Envie uma imagem para salvar no Supabase Storage e reutilizar em todo o app.
            </p>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarSelect}
            className="hidden"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => avatarInputRef.current?.click()}
            >
              <CameraIcon className="mr-2 h-4 w-4" />
              Escolher foto
            </Button>
            <Button
              type="button"
              className="rounded-full"
              onClick={handleAvatarUpload}
              disabled={!avatarFile || savingAvatar}
            >
              {savingAvatar ? "Enviando..." : "Salvar foto"}
            </Button>
          </div>
          {avatarFile ? <p className="text-xs text-muted-foreground">Arquivo selecionado: {avatarFile.name}</p> : null}
        </div>

        {/* Editable Name Section */}
        {!editing ? (
          <Button variant="outline" className="w-full rounded-full" onClick={() => setEditing(true)}>
            Editar Nome
          </Button>
        ) : (
          <div className="space-y-3">
            <Input type="text" placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <div className="flex gap-2">
              <Button className="flex-1 rounded-full" onClick={handleSaveName} disabled={!nome.trim()}>
                Salvar
              </Button>
              <Button
                variant="outline"
                className="flex-1 rounded-full"
                onClick={() => {
                  setEditing(false);
                  setNome(usuario.nome || "");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {mensagem ? <p className="mt-3 text-sm text-emerald-600">{mensagem}</p> : null}
      </section>

      <section className="glass-surface rounded-[2rem] p-6">
        <h2 className="mb-4 text-lg font-semibold">Configurações</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-[1.25rem] border border-border/70 bg-background/70 p-3">
            <span className="text-sm">Tema Escuro</span>
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900 dark:bg-red-950">
        <h2 className="mb-4 text-lg font-semibold text-red-800 dark:text-red-200">Sair</h2>
        <Button variant="destructive" className="w-full gap-2 rounded-full" onClick={handleLogout}>
          <LogOutIcon size={18} />
          Fazer Logout
        </Button>
      </section>
    </main>
  );
}
