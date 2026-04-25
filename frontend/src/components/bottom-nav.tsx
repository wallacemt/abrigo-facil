"use client";

import Cookies from "js-cookie";
import { Building2, CheckCircle2, MapPinned, Search, User2, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import { AUTH_AVATAR_COOKIE_NAME, AUTH_NAME_COOKIE_NAME, AUTH_PROFILE_COOKIE_NAME } from "@/lib/auth-cookies";
import { cn } from "@/lib/utils";

// -----------------------------
// Config
// -----------------------------
const navItems = [
  { href: "/", label: "Mapa", icon: MapPinned },
  { href: "/abrigos", label: "Abrigos", icon: Building2 },
  { href: "/checkin", label: "Check-in", icon: CheckCircle2 },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/perfil", label: "Perfil", icon: User2 },
];

// -----------------------------
// Types
// -----------------------------
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

// -----------------------------
// UI Item
// -----------------------------
function BottomMenuItem({
  icon,
  label,
  isActive,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  href: string;
}) {
  return (
    <Link href={href}>
      <button
        className={cn(
          "group flex flex-col items-center gap-1 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <div
          className={cn(
            "p-3 rounded-2xl transition-all",
            isActive ? "bg-primary/10" : "bg-transparent group-hover:bg-secondary",
          )}
        >
          {icon}
        </div>
        <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
      </button>
    </Link>
  );
}

// -----------------------------
// Component
// -----------------------------
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const [session, setSession] = useState<SessionResponse["data"] | null>(null);
  const [loaded, setLoaded] = useState(false);

  const isAuthRoute = pathname?.startsWith("/auth");

  // -----------------------------
  // Session (mantido do antigo)
  // -----------------------------
  useEffect(() => {
    if (isAuthRoute) return;

    const tokenHint = Cookies.get(AUTH_PROFILE_COOKIE_NAME);
    const nameHint = Cookies.get(AUTH_NAME_COOKIE_NAME);
    const avatarHint = Cookies.get(AUTH_AVATAR_COOKIE_NAME);

    if (tokenHint || nameHint || avatarHint) {
      setSession({
        isAuthenticated: true,
        usuario: {
          nome: nameHint ?? null,
          perfil: tokenHint ?? null,
          avatarUrl: avatarHint ?? null,
        },
      });
    }

    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
        });
        const data = (await res.json()) as SessionResponse;
        setSession(data.data ?? null);
      } catch {
        setSession(null);
      } finally {
        setLoaded(true);
      }
    };

    void loadSession();
  }, [isAuthRoute]);

  const isLoggedIn = Boolean(session?.isAuthenticated);

  const initials = useMemo(() => {
    const name = session?.usuario?.nome?.trim() || "U";
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join("");
  }, [session?.usuario?.nome]);

  if (isAuthRoute) return null;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1000]">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-background/80 backdrop-blur-xl border border-white/20 dark:border-white/10 px-6 py-3 rounded-[2.5rem] shadow-xl flex items-center gap-6"
      >
        {/* LEFT ITEMS */}
        <BottomMenuItem icon={<MapPinned size={22} />} label="Mapa" href="/" isActive={pathname === "/"} />

        <BottomMenuItem
          icon={<Building2 size={22} />}
          label="Abrigos"
          href="/abrigos"
          isActive={pathname === "/abrigos"}
        />

        {/* FAB CENTRAL (Buscar) */}
        <div className="-mt-14 relative z-10">
          <button
            onClick={() => router.push("/buscar")}
            className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-xl hover:scale-105 active:scale-95 transition-all border-4 border-background"
          >
            <Search size={28} strokeWidth={2.5} />
          </button>
        </div>

        {/* RIGHT ITEMS */}
        <BottomMenuItem
          icon={<CheckCircle2 size={22} />}
          label="Check-in"
          href="/checkin"
          isActive={pathname === "/checkin"}
        />

        <BottomMenuItem
          icon={
            loaded && isLoggedIn ? (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center justify-center w-6 h-6 bg-background/90 backdrop-blur-md shadow-sm text-foreground hover:bg-secondary/80 overflow-hidden "
              >
                {session?.usuario?.avatarUrl ? (
                  <Image src={session.usuario.avatarUrl} alt="avatar" fill className="object-cover" />
                ) : (
                  <img
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${initials}`}
                    alt="User"
                    className="w-[95%] h-[95%] object-cover rounded-xl"
                  />
                )}
              </motion.div>
            ) : (
              <User2 size={22} />
            )
          }
          label="Perfil"
          href={isLoggedIn ? "/perfil" : "/auth/login?next=/perfil"}
          isActive={pathname === "/perfil"}
        />
      </motion.div>
    </div>
  );
}
