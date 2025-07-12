import { TourButton } from "@/components/Buttons/TourButton";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";

export function TourContentWrapper({
  children,
  className,
  onComplete,
}: {
  children: ReactNode;
  className?: string;
  onComplete?: () => void;
}) {
  return (
    <div
      className={cn("no-select overflow-hidden relative rounded-lg", className)}
      style={{
        borderRadius: "8px",
        background: "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
        boxShadow:
          "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
        border: "1px solid #16181C",
      }}
    >
      <div
        className="absolute -inset-px rounded-lg opacity-30"
        style={{
          background: "linear-gradient(180deg, #32353C/20 0%, transparent 50%)",
          filter: "blur(0.5px)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4EFF6E]/15 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 opacity-10 rounded-lg"
        style={{
          background: "linear-gradient(180deg, #32353C/15 0%, transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-lg"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.1) 100%)",
        }}
      />
      <div className="relative flex h-full flex-col items-end justify-end space-y-3 p-6">
        <div className="flex-1 flex flex-col justify-center w-full">
          {children}
        </div>
        <div className="flex justify-end w-full">
          <TourButton onClick={onComplete} variant="green" />
        </div>
      </div>
    </div>
  );
}
