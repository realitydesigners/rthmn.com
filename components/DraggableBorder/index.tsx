import type React from "react";
import { useCallback, useEffect, useState } from "react";

interface DraggableBorderProps {
	isDragging?: boolean;
	onDragStart?: (e: React.MouseEvent) => void;
	onResize?: (delta: number) => void;
	direction?: "top" | "bottom" | "left" | "right";
	className?: string;
}

export const DraggableBorder: React.FC<DraggableBorderProps> = ({
	isDragging: externalIsDragging,
	onDragStart,
	onResize,
	direction = "left",
	className,
}) => {
	const [internalIsDragging, setInternalIsDragging] = useState(false);
	const [startPosition, setStartPosition] = useState(0);

	const isDragging = externalIsDragging ?? internalIsDragging;

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			if (onDragStart) {
				onDragStart(e);
			}
			setInternalIsDragging(true);
			setStartPosition(
				direction === "left" || direction === "right" ? e.clientX : e.clientY,
			);
		},
		[direction, onDragStart],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!internalIsDragging || !onResize) return;

			const currentPosition =
				direction === "left" || direction === "right" ? e.clientX : e.clientY;
			const delta = currentPosition - startPosition;

			onResize(
				direction === "right" || direction === "bottom" ? delta : -delta,
			);
			setStartPosition(currentPosition);
		},
		[internalIsDragging, direction, startPosition, onResize],
	);

	const handleMouseUp = useCallback(() => {
		setInternalIsDragging(false);
	}, []);

	useEffect(() => {
		if (internalIsDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};
	}, [internalIsDragging, handleMouseMove, handleMouseUp]);

	const isVertical = direction === "left" || direction === "right";
	const cursorClass = isVertical ? "cursor-ew-resize" : "cursor-ns-resize";
	const dimensionClass = isVertical
		? "w-1 top-0 bottom-0"
		: "h-1 left-0 right-0";
	const positionClass = {
		left: "-left-[1px]",
		right: "-right-[1px]",
		top: "top-0",
		bottom: "bottom-0",
	}[direction];

	return (
		<div
			className={`absolute ${cursorClass} ${dimensionClass} ${positionClass} z-[91] rounded-full bg-gradient-to-b from-[#333]/20 via-[#222]/20 to-[#111]/20 transition-all duration-200 hover:bg-gradient-to-b hover:from-blue-500/30 hover:via-blue-400/20 hover:to-blue-300/10 ${
				isDragging
					? "shadow-2xl shadow-blue-500/30"
					: "hover:shadow-2xl hover:shadow-blue-500/20"
			} ${className || ""}`}
			data-dragging={isDragging}
			onMouseDown={handleMouseDown}
			style={{
				[isVertical ? "width" : "height"]: isDragging ? "3px" : "1px",
			}}
		/>
	);
};
