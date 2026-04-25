import type { Metadata } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/main-nav";
import { BottomNav } from "@/components/bottom-nav";
import { Providers } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AbrigoFacil",
  description: "Plataforma de localizacao de abrigos e busca de pessoas desaparecidas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", manrope.variable, geistMono.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col pb-28 sm:pb-24">
        <Providers>
          <MainNav />
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
