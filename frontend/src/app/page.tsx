import { Map, MapTileLayer } from "@/components/ui/map";
import type { LatLngExpression } from "leaflet";
export default function Home() {
  const TORONTO_COORDINATES = [43.6532, -79.3832] satisfies LatLngExpression;

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Map center={TORONTO_COORDINATES}className="bg-black" >
          <MapTileLayer />
        </Map>
      </main>
    </div>
  );
}
