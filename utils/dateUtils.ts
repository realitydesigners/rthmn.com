export const formatTime = (date: Date) => {
	let hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM";
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	return `${hours}:${minutes}:${seconds}\u00A0${ampm}`;
};

export const safeISOString = (timestamp: number | string): string => {
	try {
		// Ensure consistent timestamp handling between server and client
		// If timestamp is already a number (milliseconds), use it directly
		if (typeof timestamp === "number") {
			// Use a fixed format instead of toISOString() to avoid timezone issues
			const date = new Date(timestamp);
			return (
				date.getUTCFullYear() +
				"-" +
				String(date.getUTCMonth() + 1).padStart(2, "0") +
				"-" +
				String(date.getUTCDate()).padStart(2, "0") +
				"T" +
				String(date.getUTCHours()).padStart(2, "0") +
				":" +
				String(date.getUTCMinutes()).padStart(2, "0") +
				":" +
				String(date.getUTCSeconds()).padStart(2, "0") +
				"." +
				String(date.getUTCMilliseconds()).padStart(3, "0") +
				"Z"
			);
		}
		// If it's a string, parse it as a date
		const date = new Date(timestamp);
		return (
			date.getUTCFullYear() +
			"-" +
			String(date.getUTCMonth() + 1).padStart(2, "0") +
			"-" +
			String(date.getUTCDate()).padStart(2, "0") +
			"T" +
			String(date.getUTCHours()).padStart(2, "0") +
			":" +
			String(date.getUTCMinutes()).padStart(2, "0") +
			":" +
			String(date.getUTCSeconds()).padStart(2, "0") +
			"." +
			String(date.getUTCMilliseconds()).padStart(3, "0") +
			"Z"
		);
	} catch (e) {
		console.error("Invalid timestamp:", timestamp);
		// Use a fixed timestamp as fallback instead of current time to ensure consistency
		return "2023-01-01T00:00:00.000Z";
	}
};

export const getUnixTimestamp = (
	tsInput: string | number | undefined | null,
): number => {
	if (typeof tsInput === "number") {
		// Check if it looks like seconds, convert to ms if so
		return tsInput > 9999999999 ? tsInput : tsInput * 1000;
	}
	if (typeof tsInput === "string") {
		// Check if it's a number string
		if (!isNaN(Number(tsInput))) {
			const numTs = Number(tsInput);
			return numTs > 9999999999 ? numTs : numTs * 1000;
		}
		// Check for specific "YYYY-MM-DD HH:mm:ss" format
		if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(tsInput)) {
			return new Date(tsInput.replace(" ", "T") + "Z").getTime();
		}
		// Fallback: Attempt standard Date parsing
		const parsedDate = new Date(tsInput);
		if (!isNaN(parsedDate.getTime())) {
			return parsedDate.getTime();
		}
	}
};
