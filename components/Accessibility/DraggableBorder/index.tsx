

import React from "react";

export const DraggableBorder: React.FC<{
  isDragging: boolean;
  onDragStart: (e: React.MouseEvent) => void;
  direction: "left" | "right" | "top";
}> = React.memo(({ isDragging, onDragStart, direction }) => {
  const isVertical = direction === "left" || direction === "right";
  const cursorClass = isVertical ? "cursor-ew-resize" : "cursor-ns-resize";
  const dimensionClass = isVertical ? "w-[1px]" : "h-[1px]";
  const hoverDimensionClass = isVertical ? "hover:w-[3px]" : "hover:h-[3px]";
  const positionClass = `${direction}-0 ${isVertical ? "top-0 bottom-0" : "left-0 right-0"}`;

  return (
    <div
      className={`absolute ${positionClass} z-10 ${dimensionClass} ${cursorClass} rounded-full bg-[#181818] transition-all duration-200 hover:bg-blue-400 ${
        isDragging
          ? "shadow-2xl shadow-blue-500"
          : `${hoverDimensionClass} hover:shadow-2xl hover:shadow-blue-500`
      }`}
      onMouseDown={onDragStart}
    />
  );
});