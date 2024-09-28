import { Box } from "@/types";

const VISIBLE_BOXES_COUNT = 16;

export const getTrendForOffset = (
	boxes: Box[],
	offset: number,
): "up" | "down" => {
	if (!boxes || boxes.length === 0) {
		return "down";
	}

	const boxesForOffset = boxes.slice(offset, offset + VISIBLE_BOXES_COUNT);
	const largestBox = boxesForOffset.reduce((max, box) =>
		Math.abs(box.value) > Math.abs(max.value) ? box : max,
	);

	return largestBox.value > 0 ? "up" : "down";
};
