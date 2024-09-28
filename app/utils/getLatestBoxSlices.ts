interface BoxData {
	high: number;
	low: number;
	value: number;
}

interface OHLC {
	open: number;
	high: number;
	low: number;
	close: number;
}

interface PairData {
	boxes: BoxData[];
	currentOHLC: OHLC;
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

		return apiResponse.data;
	} catch (error) {
		console.error("Fetch error:", error);
		return {};
	}
}
