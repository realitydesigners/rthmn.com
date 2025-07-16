import { useAuth } from "@/providers/SupabaseProvider";
import { useEffect, useState } from "react";

interface UserStripeType {
	userId: string;
	accountType: "legacy" | "new";
	isLegacy: boolean;
}

export function useUserStripeType() {
	const { user, isLoading: authLoading } = useAuth();
	const [stripeType, setStripeType] = useState<UserStripeType | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user || authLoading) {
			setStripeType(null);
			return;
		}

		const fetchStripeType = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/user-stripe-type");
				if (!response.ok) {
					throw new Error("Failed to fetch user stripe type");
				}

				const data = await response.json();
				setStripeType(data);
			} catch (err) {
				console.error("Error fetching user stripe type:", err);
				setError(err instanceof Error ? err.message : "Unknown error");
				// Fallback to legacy for safety
				setStripeType({
					userId: user.id,
					accountType: "legacy",
					isLegacy: true,
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchStripeType();
	}, [user, authLoading]);

	return {
		stripeType,
		isLoading: isLoading || authLoading,
		error,
		isLegacy: stripeType?.isLegacy ?? true, // Safe default
	};
}