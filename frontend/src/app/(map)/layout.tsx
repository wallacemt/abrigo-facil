import { MainNav } from "@/components/main-nav";

export default function MapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-screen  ">
      <MainNav />
      {children}
    </main>
  );
}
