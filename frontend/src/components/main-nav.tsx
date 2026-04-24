"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

const links = [
  { href: "/", label: "Mapa" },
  { href: "/abrigos", label: "Abrigos" },
  { href: "/checkin", label: "Check-in" },
  { href: "/buscar", label: "Buscar Pessoa" },
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-blue-100 bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-2 text-sm font-semibold text-blue-700">
        <Image src={"/logo.png"} height={100} width={100} alt="app-logo"/>
 
        </Link>

        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button
              variant={pathname === link.href ? "default" : "outline"}
              size="sm"
              className={cn(
                "min-h-11 rounded-lg",
                pathname === link.href ? "bg-blue-600 hover:bg-blue-700" : "border-blue-200",
              )}
            >
              {link.label}
            </Button>
          </Link>
        ))}

        <Link href="/auth/login" className="ml-auto">
          <Button type="button" variant="outline" size="sm" className="min-h-11 rounded-lg border-blue-200">
            Login
          </Button>
        </Link>

        <Link href="/auth/cadastro">
          <Button type="button" variant="outline" size="sm" className="min-h-11 rounded-lg border-blue-200">
            Cadastro
          </Button>
        </Link>

        <Button type="button" variant="ghost" size="sm" className="rounded-lg" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </header>
  );
}
