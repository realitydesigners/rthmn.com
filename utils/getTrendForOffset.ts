import { BoxSlice, Box } from "@/types";

const VISIBLE_BOXES_COUNT = 16;

export const getTrendForOffset = (
	boxes: Box[] | BoxSlice[],
	offset: number,
): "up" | "down" => {
	if (!boxes || boxes.length === 0) {
		return "down";
	}

	const allBoxes: Box[] =
		"boxes" in boxes[0]
			? (boxes as BoxSlice[]).flatMap((slice) => slice.boxes)
			: (boxes as Box[]);

	const boxesForOffset = allBoxes.slice(offset, offset + VISIBLE_BOXES_COUNT);

	if (boxesForOffset.length === 0) {
		return "down";
	}

	const largestBox = boxesForOffset.reduce((max, box) =>
		Math.abs(box.value) > Math.abs(max.value) ? box : max,
	);

	return largestBox.value > 0 ? "up" : "down";
};
