import { FaArrowRight } from "react-icons/fa";

interface TourButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  variant?: "blue" | "black" | "green";
  disabled?: boolean;
}

export function TourButton({
  onClick,
  children = "Continue",
  variant = "blue",
  disabled = false,
}: TourButtonProps) {
  const isBlue = variant === "blue";
  const isGreen = variant === "green";

  const getVariantStyles = () => {
    if (isGreen) {
      return {
        wrapper:
          "bg-[#24FF66] text-black hover:bg-[#1ECC52] border border-[#24FF66]/50 before:absolute before:inset-0 before:bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.3)_50%,transparent_70%)] before:bg-[length:200%_200%] before:animate-shimmer",
        inner: "bg-transparent",
      };
    }
    if (isBlue) {
      return {
        wrapper:
          "border-blue-400/20 bg-gradient-to-b from-blue-400/10 via-blue-400/5 to-transparent text-blue-400 hover:border-blue-400/40 hover:from-blue-400/20 hover:via-blue-400/15 hover:to-blue-400/5 hover:text-blue-300",
        inner: "bg-transparent",
      };
    }
    return {
      wrapper:
        "border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] text-white/90 hover:border-[#32353C] hover:from-[#16181C] hover:to-[#1C1E23] hover:text-white",
      inner: "bg-transparent",
    };
  };

  const styles = getVariantStyles();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex items-center justify-center overflow-hidden rounded-xl border px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
        disabled
          ? "cursor-not-allowed border-[#1C1E23] bg-[#0A0B0D] text-white/30"
          : `${styles.wrapper} ${isGreen ? "hover:scale-[1.02] active:scale-[0.98]" : "hover:scale-[1.01] active:scale-[0.99]"}`
      }`}
    >
      <span
        className={`font-russo relative flex items-center gap-2 ${isGreen ? "font-kodemono uppercase font-semibold tracking-wide hover:tracking-wider" : ""}`}
      >
        {children}
        {isGreen && (
          <FaArrowRight className="h-3.5 w-3.5 transition-transform duration-300 hover:translate-x-1" />
        )}
      </span>
    </button>
  );
}
