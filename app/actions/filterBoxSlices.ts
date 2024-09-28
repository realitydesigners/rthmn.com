"use server";

import { BoxSlice } from "@/types";
import { compareSlices } from "@/app/utils/compareSlices";

export async function filterBoxSlices(
	data: BoxSlice[],
	boxOffset: number,
	visibleBoxesCount: number,
) {
	return data.reduce((acc: BoxSlice[], currentSlice, index) => {
		if (
			index === 0 ||
			!compareSlices(
				currentSlice,
				acc[acc.length - 1],
				boxOffset,
				visibleBoxesCount,
			)
		) {
			acc.push(currentSlice);
		}
		return acc;
	}, []);
}
