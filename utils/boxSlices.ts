import { PairData, Box, OHLC, BoxSlice } from "@/types";

interface ApiResponse {
	status: string;
	data: Array<{
		timestamp: string;
		boxes: Array<{
			high: number;
			low: number;
			value: number;
		}>;
		currentOHLC: OHLC;
	}>;
}

function formatTimestamp(timestamp: string): string {
	return new Date(timestamp).toISOString();
}

export async function getBoxSlices(
	pair: string,
	lastTimestamp?: string,
	count?: number,
): Promise<BoxSlice[]> {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
	let url = `${baseUrl}/boxslices/${pair}`;

	const params = new URLSearchParams();
	if (lastTimestamp)
		params.append("lastTimestamp", formatTimestamp(lastTimestamp));
	if (count) params.append("count", count.toString());

	if (params.toString()) url += `?${params.toString()}`;

	try {
		console.log(`Fetching from: ${url}`);
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`HTTP error! status: ${response.status}`);
			const errorText = await response.text();
			console.error(`Error response: ${errorText}`);
			return [];
		}
		const apiResponse: ApiResponse = await response.json();
		console.log("Received data:", apiResponse);

		if (apiResponse.status !== "success" || !Array.isArray(apiResponse.data)) {
			console.error("Invalid API response:", apiResponse);
			return [];
		}

		const transformedData: BoxSlice[] = apiResponse.data.map((item) => ({
			timestamp: item.timestamp,
			boxes: item.boxes.map((box) => ({
				high: box.high,
				low: box.low,
				value: box.value,
			})),
		}));

		console.log(`Returning ${transformedData.length} items from getBoxSlices`);
		return transformedData;
	} catch (error) {
		console.error("Fetch error:", error);
		return [];
	}
}

export async function getLatestBoxSlices(): Promise<Record<string, PairData>> {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080";
	const url = `${baseUrl}/latest-boxslices`;

	try {
		console.log(`Fetching latest box slices from: ${url}`);
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`HTTP error! status: ${response.status}`);
			const errorText = await response.text();
			console.error(`Error response: ${errorText}`);
			return {};
		}
		const apiResponse = await response.json();
		console.log("Received latest box slices data:", apiResponse);

		if (
			apiResponse.status !== "success" ||
			typeof apiResponse.data !== "object"
		) {
			console.error("Invalid API response:", apiResponse);
			return {};
		}

		// Convert the API response to match the PairData type from @/types
		const convertedData: Record<string, PairData> = {};
		for (const [pair, data] of Object.entries(apiResponse.data)) {
			if (
				typeof data === "object" &&
				data !== null &&
				"boxes" in data &&
				"currentOHLC" in data
			) {
				const boxSlice: BoxSlice = {
					timestamp: new Date().toISOString(),
					boxes: (data.boxes as Box[]) || [],
				};
				convertedData[pair] = {
					boxes: [boxSlice],
					currentOHLC: data.currentOHLC as OHLC,
				};
			}
		}

		return convertedData;
	} catch (error) {
		console.error("Fetch error:", error);
		return {};
	}
}

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
