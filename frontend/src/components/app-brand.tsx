import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AppBrandProps {
  className?: string;
  compact?: boolean;
}

export function AppBrand({ className, compact = false }: AppBrandProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3 rounded-full", className)} aria-label="AbrigoFácil">
      <Image
        src="/logo.png"
        alt="Logo do AbrigoFácil"
        width={compact ? 36 : 48}
        height={compact ? 36 : 48}
        className="h-auto w-auto"
        priority
      />
      {!compact && (
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight text-foreground">AbrigoFácil</p>
          <p className="text-xs text-muted-foreground">Mapa, abrigo e apoio</p>
        </div>
      )}
    </Link>
  );
}
