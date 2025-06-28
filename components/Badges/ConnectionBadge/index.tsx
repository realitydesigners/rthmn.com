interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionBadge: React.FC<ConnectionStatusProps> = ({
  isConnected,
}) => {
  return (
    <div className="relative">
      {/* Compact balanced indicator - only when connected, more subtle */}
      {isConnected && (
        <div
          className="absolute -left-3 top-1/2 -translate-y-1/2 bg-[#B0B0B0] z-10"
          style={{
            width: "18px",
            height: "2px",
            transform: "translateY(-50%) rotate(-90deg)",
            filter: "blur(5px)",
            transformOrigin: "center",
            opacity: 0.6,
          }}
        />
      )}

      <div
        className="relative flex items-center gap-2 px-2.5 py-1.5 transition-all duration-300 overflow-hidden"
        style={{
          borderRadius: "6px",
          background: isConnected
            ? "linear-gradient(180deg, #343A42 -10.71%, #1F2328 100%)"
            : "transparent",
          border: isConnected
            ? "1px solid rgba(50, 53, 60, 0.5)"
            : "1px solid rgba(28, 30, 35, 0.3)",
          boxShadow: isConnected
            ? "0px 2px 4px 0px rgba(0, 0, 0, 0.2)"
            : "none",
        }}
      >
        {/* Status indicator */}
        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: isConnected ? "#B0B0B0/35" : "#32353C/25",
            }}
          />

          {/* Inner dot */}
          <div
            className="relative h-1 w-1 rounded-full transition-all duration-300"
            style={{
              background: isConnected ? "#B0B0B0" : "#818181",
            }}
          />

          {/* Very subtle pulse animation for connected state */}
          {isConnected && (
            <div
              className="absolute inset-0 rounded-full bg-[#B0B0B0]/10 animate-ping"
              style={{ animationDuration: "3s" }}
            />
          )}
        </div>

        {/* Status text */}
        <span
          className="font-russo text-[9px] font-medium tracking-wide transition-colors duration-300 uppercase"
          style={{
            color: isConnected ? "#B0B0B0" : "#818181",
          }}
        >
          {isConnected ? "Live" : "Offline"}
        </span>
      </div>
    </div>
  );
};
