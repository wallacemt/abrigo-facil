"use client";

import { BuildingIcon, CheckCircleIcon, MapIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppBrand } from "@/components/app-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const features = [
  {
    icon: MapIcon,
    title: "Mapa em tempo real",
    description: "Acompanhe abrigos, localização e proximidade em uma navegação direta.",
  },
  {
    icon: CheckCircleIcon,
    title: "Check-in assistido",
    description: "Registre entradas e saídas com menos fricção e mais clareza operacional.",
  },
  {
    icon: BuildingIcon,
    title: "Gestão de abrigos",
    description: "Acompanhe código de check-in, vagas e status com um painel enxuto.",
  },
];

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="flex items-center justify-between gap-4">
              <AppBrand />
              <ThemeToggle />
            </div>

            <div className="space-y-3">
              <span className="glass-chip inline-flex uppercase tracking-[0.22em] text-primary">AbrigoFácil</span>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                <p className="max-w-prose text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
              </div>
            </div>

            <div className="glass-surface rounded-[2rem] p-5 sm:p-6">{children}</div>

            {footer ? <div>{footer}</div> : null}
          </div>
        </section>

        <section className="relative hidden overflow-hidden border-l border-border/70 bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_top_left,_currentColor_1px,_transparent_1px)] [background-size:24px_24px]" />
          <div className="relative mx-auto w-full max-w-xl px-10">
            <div className="mb-6 flex items-center justify-between">
              <AppBrand compact />
              <div className="glass-chip">AbrigoFácil em destaque</div>
            </div>
            <Carousel className="w-full">
              <CarouselContent>
                {features.map((feature) => (
                  <CarouselItem key={feature.title}>
                    <div className="flex min-h-[22rem] flex-col justify-center rounded-[2rem] border border-border/70 bg-background/80 p-8 shadow-2xl backdrop-blur-sm">
                      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <feature.icon className="h-8 w-8" />
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
                        Experiência guiada
                      </p>
                      <h2 className="text-2xl font-semibold tracking-tight">{feature.title}</h2>
                      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                        {feature.description}
                      </p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </Carousel>
          </div>
        </section>
      </div>
    </main>
  );
}
