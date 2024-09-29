import { BoxSlice } from "@/types";

export function compareSlices(
	slice1: BoxSlice,
	slice2: BoxSlice,
	offset: number,
	visibleBoxesCount: number,
): boolean {
	const boxes1 = slice1.boxes.slice(offset, offset + visibleBoxesCount);
	const boxes2 = slice2.boxes.slice(offset, offset + visibleBoxesCount);

	if (boxes1.length !== boxes2.length) return false;

	for (let i = 0; i < boxes1.length; i++) {
		if (boxes1[i].value !== boxes2[i].value) return false;
	}

	return true;
}
