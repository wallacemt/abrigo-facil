"use client";

import {
  BuildingIcon,
  CheckCircleIcon,
  MapIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { AppBrand } from "@/components/app-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";

const features = [
  {
    icon: MapIcon,
    title: "Mapa em tempo real",
    description:
      "Visualize abrigos próximos e navegue com precisão durante situações críticas.",
    img: "/abrig-2.avif",
  },
  {
    icon: CheckCircleIcon,
    title: "Check-in simplificado",
    description:
      "Registre entradas rapidamente e mantenha controle eficiente de ocupação.",
    img: "/abrig-3.avif",
  },
  {
    icon: BuildingIcon,
    title: "Gestão inteligente",
    description:
      "Monitore vagas, status e operações em um painel direto e funcional.",
    img: "/abrig-1.avif",
  },
];

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // autoplay
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen w-full bg-background">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT */}
        <section className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-md space-y-8">
            {/* header */}
            <div className="flex items-center justify-between">
              <AppBrand />
              <ThemeToggle />
            </div>

            {/* text */}
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {title}
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>

            {/* form container */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-surface rounded-[2rem] p-6 shadow-xl"
            >
              {children}
            </motion.div>

            {footer && <div>{footer}</div>}
          </div>
        </section>

        {/* RIGHT */}
        <section className="relative hidden overflow-hidden border-l border-border/70 lg:flex lg:items-center lg:justify-center">
          {/* background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-emerald-500/20" />
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-emerald-500/30 blur-3xl" />

          <div className="relative mx-auto w-full max-w-xl px-10">
            

            {/* carousel */}
            <div className="relative">
              <Carousel className="w-full">
                <CarouselContent
                  style={{
                    transform: `translateX(-${activeIndex * 100}%)`,
                    transition: "transform 0.6s ease",
                  }}
                >
                  {features.map((feature, index) => {
                    const Icon = feature.icon;

                    return (
                      <CarouselItem key={feature.title}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: index === activeIndex ? 1 : 0.4,
                            y: index === activeIndex ? 0 : 10,
                          }}
                          className="space-y-5"
                        >
                          <div className="overflow-hidden rounded-2xl shadow-lg">
                            <Image
                              src={feature.img}
                              width={800}
                              height={500}
                              alt={feature.title}
                              className="h-[660px] w-full object-cover"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">
                                {feature.title}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {feature.description}
                            </p>
                          </div>
                        </motion.div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
              </Carousel>

              {/* indicators */}
              <div className="mt-4 flex justify-center gap-2">
                {features.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i === activeIndex
                        ? "w-6 bg-primary"
                        : "w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}