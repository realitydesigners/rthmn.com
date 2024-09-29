import { PairData, Box, OHLC, BoxSlice } from "@/types";

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
