"use client";

import { useDashboard } from "@/providers/DashboardProvider/client";
import type { Box, BoxSlice, PairData } from "@/types/types";
import type React from "react";
import {
	createContext,
	use,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Boxes, type Pattern, initialKeys } from "./constants";
import type { PatternMatch, SignalContextType } from "./types";

const SignalContext = createContext<SignalContextType | null>(null);

export function SignalProvider({ children }: { children: React.ReactNode }) {
	const { pairData, isLoading, isConnected } = useDashboard();
	const [patterns, setPatterns] = useState<PatternMatch[]>([]);
	const [isScanning, setIsScanning] = useState(true);
	const [scanResults, setScanResults] = useState<
		Record<string, PatternMatch[]>
	>({});

	// Track last pattern occurrence times to avoid duplicates
	const lastPatternTimeRef = useRef<Map<string, Date>>(new Map());
	const generatedPatternsRef = useRef<number[][]>([]);
	const boxSetRef = useRef<Set<number>>(
		new Set(Object.keys(Boxes).map(Number)),
	);

	// Performance optimization: Create box value lookup map
	const boxLookupRef = useRef<Map<string, Map<number, Box>>>(new Map());

	// Debouncing for scan operations
	const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastScanDataRef = useRef<string>("");

	// Generate LIMITED patterns focusing on key reversal patterns
	const generateOptimizedPaths = useCallback(
		(boxData: Pattern, initialKeys: number[]): number[][] => {
			const patterns: number[][] = [];
			const maxPatterns = 200; // Drastically limit patterns for performance
			const maxDepth = 5; // Limit pattern depth

			// Priority patterns - short reversal sequences
			const priorityKeys = [
				2000, 1732, 1500, 1299, 1125, 974, 843, 730, 632, 548, 474, 411, 356,
				308, 267, 231, 200, 173,
			];

			for (const key of priorityKeys) {
				if (patterns.length >= maxPatterns) break;

				if (key in boxData) {
					const paths = boxData[key];
					for (const path of paths) {
						if (patterns.length >= maxPatterns) break;
						if (path.length <= maxDepth) {
							patterns.push([key, ...path.slice(1)]);
						}
					}
				} else {
					patterns.push([key]);
				}
			}

			return patterns;
		},
		[],
	);

	// Optimized pattern occurrence check with caching
	const checkPatternOccurrence = useCallback(
		(
			boxes: Box[],
			pattern: number[],
			pairKey: string,
		): { found: boolean; matchedBoxes: Box[] } => {
			// Create or get cached lookup map for this pair
			if (!boxLookupRef.current.has(pairKey)) {
				const lookup = new Map<number, Box>();
				for (const box of boxes) {
					lookup.set(box.value, box);
				}
				boxLookupRef.current.set(pairKey, lookup);
			}

			const lookup = boxLookupRef.current.get(pairKey)!;
			const matchedBoxes: Box[] = [];

			// Fast lookup using Map instead of array.find()
			for (const value of pattern) {
				const box = lookup.get(value);
				if (box) {
					matchedBoxes.push(box);
				} else {
					return { found: false, matchedBoxes: [] };
				}
			}

			return { found: true, matchedBoxes };
		},
		[],
	);

	// Debounced and optimized pattern scanning
	const scanForPatternsOptimized = useCallback(
		(pairData: Record<string, PairData>, allPatterns: number[][]) => {
			if (!isScanning || !isConnected || allPatterns.length === 0) return;

			// Clear lookup cache for updated data
			boxLookupRef.current.clear();

			const newMatches: PatternMatch[] = [];
			const maxMatchesPerScan = 3; // Further reduced to prevent spam

			Object.entries(pairData).forEach(([pair, data]) => {
				if (!data.boxes || data.boxes.length === 0) return;
				if (newMatches.length >= maxMatchesPerScan) return;

				const latestSlice = data.boxes[0]; // Most recent box data

				// Only scan patterns that have a reasonable chance of matching
				const availableValues = new Set(latestSlice.boxes.map((b) => b.value));
				const relevantPatterns = allPatterns.filter(
					(pattern) =>
						pattern.length <= 4 && // Allow slightly longer patterns
						pattern.every((value) => availableValues.has(value)),
				);

				// Track pattern signatures to avoid similar patterns
				const foundSignatures = new Set<string>();

				for (const pattern of relevantPatterns.slice(0, 30)) {
					// Reduced from 50
					if (newMatches.length >= maxMatchesPerScan) break;

					const { found } = checkPatternOccurrence(
						latestSlice.boxes,
						pattern,
						pair,
					);

					if (found) {
						// Create pattern signature based on first 2-3 elements to group similar patterns
						const patternSignature =
							pattern.length >= 3
								? `${pair}-${pattern.slice(0, 3).join(",")}`
								: `${pair}-${pattern.slice(0, 2).join(",")}`;

						// Skip if we already found a similar pattern in this scan
						if (foundSignatures.has(patternSignature)) {
							continue;
						}

						const currentTime = new Date(latestSlice.timestamp);
						const lastTime = lastPatternTimeRef.current.get(patternSignature);

						// 1-minute cooldown for pattern signatures (reduced from 10 minutes)
						if (lastTime) {
							const timeDiff = currentTime.getTime() - lastTime.getTime();
							const oneMinute = 1 * 60 * 1000; // 1 minute
							if (timeDiff < oneMinute) {
								continue;
							}
						}

						// Mark this signature as found in current scan
						foundSignatures.add(patternSignature);
						lastPatternTimeRef.current.set(patternSignature, currentTime);

						const match: PatternMatch = {
							id: `${patternSignature}-${latestSlice.timestamp}-${Math.random()
								.toString(36)
								.substr(2, 9)}`,
							matched: true,
							boxes: latestSlice.boxes,
							currencyPair: pair,
							timestamp: latestSlice.timestamp,
							currentPrice: data.currentOHLC?.close || 0,
							patternDetails: {
								type: "box_reversal",
								indexes: pattern,
							},
							pattern,
							matchedData: latestSlice,
							startIndex: 0,
							matchedIndices: pattern,
							score: pattern.length * 25, // Slightly higher scoring
							confidence: Math.min(1, pattern.length / 4), // Adjusted confidence
						};

						newMatches.push(match);
					}
				}
			});

			if (newMatches.length > 0) {
				setPatterns((prev) => [...newMatches, ...prev].slice(0, 30)); // Reduced storage
			}
		},
		[isScanning, isConnected, checkPatternOccurrence],
	);

	// Debounced scanning function
	const debouncedScan = useCallback(
		(pairData: Record<string, PairData>, allPatterns: number[][]) => {
			// Create a hash of current data to avoid unnecessary scans
			const keys = Object.keys(pairData).sort();
			const timestamps = Object.values(pairData)
				.map((d) => d.boxes?.[0]?.timestamp)
				.join(",");
			const dataHash = JSON.stringify(keys + timestamps);

			if (dataHash === lastScanDataRef.current) return;
			lastScanDataRef.current = dataHash;

			// Clear existing timeout
			if (scanTimeoutRef.current) {
				clearTimeout(scanTimeoutRef.current);
			}

			// Debounce the scan by 500ms
			scanTimeoutRef.current = setTimeout(() => {
				scanForPatternsOptimized(pairData, allPatterns);
			}, 500);
		},
		[scanForPatternsOptimized],
	);

	// Generate patterns on mount with optimization
	useEffect(() => {
		if (generatedPatternsRef.current.length === 0) {
			const allPatterns = generateOptimizedPaths(Boxes, initialKeys);
			generatedPatternsRef.current = allPatterns;
			console.log(
				`Generated ${allPatterns.length} OPTIMIZED patterns for scanning`,
			);
		}
	}, [generateOptimizedPaths]);

	// Debounced scan patterns when pair data updates
	useEffect(() => {
		if (
			Object.keys(pairData).length > 0 &&
			generatedPatternsRef.current.length > 0
		) {
			debouncedScan(pairData, generatedPatternsRef.current);
		}
	}, [pairData, debouncedScan]);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (scanTimeoutRef.current) {
				clearTimeout(scanTimeoutRef.current);
			}
		};
	}, []);

	const addPattern = useCallback((pattern: PatternMatch) => {
		setPatterns((prev) => [pattern, ...prev].slice(0, 50));
	}, []);

	const clearPatterns = useCallback(() => {
		setPatterns([]);
		setScanResults({});
		lastPatternTimeRef.current.clear();
		boxLookupRef.current.clear();
		if (scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}
	}, []);

	const enableScanning = useCallback((enabled: boolean) => {
		setIsScanning(enabled);
		if (!enabled && scanTimeoutRef.current) {
			clearTimeout(scanTimeoutRef.current);
		}
	}, []);

	const latestSignals = useMemo(() => {
		return patterns.slice(0, 10); // Last 10 signals
	}, [patterns]);

	const value = useMemo(
		() => ({
			patterns,
			isScanning,
			scanResults,
			latestSignals,
			addPattern,
			clearPatterns,
			enableScanning,
		}),
		[
			patterns,
			isScanning,
			scanResults,
			latestSignals,
			addPattern,
			clearPatterns,
			enableScanning,
		],
	);

	return (
		<SignalContext.Provider value={value}>{children}</SignalContext.Provider>
	);
}

// Custom hook to use signals
export function useSignals() {
	const context = use(SignalContext);
	if (!context) {
		throw new Error("useSignals must be used within a SignalProvider");
	}
	return context;
}
