"use client";

import { ShelterMapFullscreen } from "@/components/shelter-map-fullscreen";

export default function Home() {
  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden">
      <ShelterMapFullscreen />
    </main>
  );
}
