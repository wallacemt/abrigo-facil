"use client";
import { UserLocation } from "@/lib/geolocation";
import { cn } from "@/lib/utils";
import { LoaderCircleIcon, Minus, Navigation, Plus } from "lucide-react";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

interface MapControllerProps {
  location: UserLocation | null;
  locating: boolean;
  locationError: string | null;
  requestPermission: () => void;
}
export const MapController = ({ location, locating, locationError, requestPermission }: MapControllerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!location) {
      return;
    }

    map.flyTo([location.latitude, location.longitude], Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.8,
    });
  }, [location, map]);

  return (
    <div>
      <div className="absolute top-32 right-6 flex flex-col gap-3 z-[400] pointer-events-none ">
        <div className="flex flex-col gap-2 bg-background/90 backdrop-blur-md p-2 shadow-lg border border-border rounded-2xl pointer-events-auto">
          <button
            onClick={() => map.zoomIn()}
            className="flex items-center justify-center p-3 rounded-xl hover:bg-secondary text-foreground transition-colors"
            aria-label="Zoom in"
          >
            <Plus size={20} />
          </button>
          <div className="h-[1px] bg-border mx-2"></div>
          <button
            onClick={() => map.zoomOut()}
            className="flex items-center justify-center p-3 rounded-xl hover:bg-secondary text-foreground transition-colors"
            aria-label="Zoom out"
          >
            <Minus size={20} />
          </button>
        </div>
        <button
          onClick={requestPermission}
          disabled={locating}
          className={cn(
            "flex items-center justify-center p-3 bg-background/90 backdrop-blur-md shadow-lg border border-border rounded-2xl text-primary pointer-events-auto hover:bg-secondary transition-colors ",
            location && " opacity-80",
            locating && "cursor-not-allowed opacity-60",
          )}
          aria-label="Minha localização"
        >
          {locating ? <LoaderCircleIcon size={24} className="animate-spin" /> : <Navigation size={24} />}
        </button>
        {locationError && (
          <div className="max-w-[14rem] rounded-2xl border border-destructive/20 bg-background/95 px-3 py-2 text-xs text-destructive shadow-lg backdrop-blur">
            {locationError}
          </div>
        )}
      </div>
    </div>
  );
};
