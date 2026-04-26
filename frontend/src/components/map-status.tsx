import { cn } from "@/lib/utils";
import Image from "next/image";

export function MapStatus({ text, error }: { text: string; error?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-background flex-col gap-3">
      <Image src={"/logo.png"} width={100} height={100} alt="app logo" className="animate-spin" />
      <p className={cn("text-sm", error && "text-destructive")}>{text}</p>
    </div>
  );
}
