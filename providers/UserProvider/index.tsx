"use client";

import { type BoxColors, useColorStore } from "@/stores/colorStore";
import { useGridStore } from "@/stores/gridStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { getSelectedPairs, setSelectedPairs } from "@/utils/localStorage";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import {
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

interface UserContextType {
	favorites: string[];
	boxColors: BoxColors;
	isSidebarInitialized: boolean;
	togglePair: (pair: string) => void;
	updateBoxColors: (colors: Partial<BoxColors>) => void;
	handleSidebarClick: (e: React.MouseEvent) => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [isSidebarInitialized, setIsSidebarInitialized] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
	const { hasCompletedInitialOnboarding } = useOnboardingStore();

	// Get box colors from the store
	const boxColors = useColorStore((state) => state.boxColors);
	const updateBoxColors = useColorStore((state) => state.updateBoxColors);

	// Get grid store functions
	const orderedPairs = useGridStore((state) => state.orderedPairs);
	const setInitialPairs = useGridStore((state) => state.setInitialPairs);
	const reorderPairs = useGridStore((state) => state.reorderPairs);

	// Onboarding check
	useEffect(() => {
		if (!pathname || pathname.includes("/onboarding")) return;
		if (
			pathname === "/signin" ||
			pathname === "/signup" ||
			pathname === "/pricing"
		)
			return;
		if (!hasCompletedInitialOnboarding()) {
			router.replace("/onboarding");
		}
	}, [pathname, router, hasCompletedInitialOnboarding]);

	// Initialize state and fetch all initial data
	useEffect(() => {
		const initializeData = async () => {
			const storedPairs = getSelectedPairs();
			setInitialPairs(storedPairs);
			setIsSidebarInitialized(true);
		};

		initializeData();
	}, [setInitialPairs]);

	const togglePair = useCallback(
		(pair: string) => {
			const currentPairs = orderedPairs;
			let newPairs;

			if (currentPairs.includes(pair)) {
				// Remove the pair
				newPairs = currentPairs.filter((p) => p !== pair);
			} else {
				// Add the pair
				newPairs = [...currentPairs, pair];
			}

			// Update both local storage and grid store
			setSelectedPairs(newPairs);
			reorderPairs(newPairs);
		},
		[orderedPairs, reorderPairs],
	);

	const handleSidebarClick = useCallback((e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		if (
			target.closest(".sidebar-toggle") ||
			target.closest(".sidebar-content") ||
			target.closest(".fixed-sidebar")
		) {
			return;
		}
		window.dispatchEvent(new Event("closeSidebars"));
	}, []);

	const value = useMemo(
		() => ({
			favorites: orderedPairs,
			boxColors,
			isSidebarInitialized,
			togglePair,
			updateBoxColors,
			handleSidebarClick,
		}),
		[
			orderedPairs,
			boxColors,
			isSidebarInitialized,
			togglePair,
			updateBoxColors,
			handleSidebarClick,
		],
	);

	return (
		<UserContext.Provider value={value}>
			<div onClick={handleSidebarClick}>{children}</div>
		</UserContext.Provider>
	);
}

export function useUser() {
	const context = use(UserContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}
