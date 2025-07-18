export const projectId = checkValue(
	process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
	"NEXT_PUBLIC_SANITY_PROJECT_ID",
);

export const dataset: string = checkValue(
	process.env.NEXT_PUBLIC_SANITY_DATASET,
	"NEXT_PUBLIC_SANITY_DATASET",
);

export const token =
	typeof window === "undefined"
		? checkValue(process.env.SANITY_ACCESS_TOKEN, "SANITY_ACCESS_TOKEN")
		: undefined;

export const hookSecret = process.env.SANITY_HOOK_SECRET;

export const apiVersion =
	process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-02-21";

function checkValue<T>(value: T | undefined, errorMsg: string): T {
	if (value === undefined) {
		throw new Error(`Missing Environment Variable: ${errorMsg}`);
	}
	return value;
}

export const studioUrl = "/studio";
