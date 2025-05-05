import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const token = searchParams.get("token");

	if (!token) {
		return NextResponse.json({ error: "Missing token" }, { status: 400 });
	}

	try {
		const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL;
		const url = new URL("/latest-candles", baseUrl);

		console.log("Fetching all candles from:", url.toString());

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: "no-store",
		});

		if (!response.ok) {
			const errorText = await response
				.text()
				.catch(() => "No error details available");
			console.error("Server response error:", {
				status: response.status,
				statusText: response.statusText,
				details: errorText,
				url: url.toString(),
			});
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const { data, status } = await response.json();

		if (status === "success" && Array.isArray(data)) {
			// Transform array of candles into a map of pair -> candle data
			const candleMap = data.reduce((acc: Record<string, any>, candle: any) => {
				if (candle && candle.symbol) {
					acc[candle.symbol] = candle;
				}
				return acc;
			}, {});

			console.log(
				"Successfully processed candle data for pairs:",
				Object.keys(candleMap),
			);
			return NextResponse.json(candleMap);
		}

		throw new Error("Invalid response format from server");
	} catch (error) {
		console.error("Error in getLatestCandles:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch latest candles",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
