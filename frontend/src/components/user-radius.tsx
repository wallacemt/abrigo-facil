import { PROXIMITY_RADIUS_KM } from "@/constants/map-constants";
import { MapCircle } from "./ui/map";

 export function UserRadius({ location }: any) {
    return (
      <MapCircle
        center={[location.latitude, location.longitude]}
        radius={PROXIMITY_RADIUS_KM * 1000}
        className="fill-blue-500/10 stroke-blue-500"
        pathOptions={{ dashArray: "5, 5", weight: 2 }}
      />
    );
  }