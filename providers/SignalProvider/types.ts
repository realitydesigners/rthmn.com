import type { Box, BoxSlice } from "@/types/types";

export interface PatternMatch {
	id: string;
	matched: boolean;
	boxes: Box[];
	currencyPair: string;
	timestamp: string;
	currentPrice: number;
	patternDetails: {
		type: string;
		indexes: number[];
	};
	pattern: number[];
	matchedData: BoxSlice;
	startIndex: number;
	matchedIndices: number[];
	score: number;
	confidence: number;
	metadata?: Record<string, string | number>;
}

export interface SignalContextType {
	patterns: PatternMatch[];
	isScanning: boolean;
	scanResults: Record<string, PatternMatch[]>;
	latestSignals: PatternMatch[];
	addPattern: (pattern: PatternMatch) => void;
	clearPatterns: () => void;
	enableScanning: (enabled: boolean) => void;
}
