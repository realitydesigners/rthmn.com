import { useState, useEffect, useMemo } from "react";
import {
	BASE_VALUES,
	createDemoStep,
	createMockBoxData,
	sequences,
} from "@/components/Constants/constants";

const cryptoStructures = [
	{ pair: "ETH", name: "Ethereum", startOffset: 20, speed: 1.2 },
	{ pair: "BTC", name: "Bitcoin", startOffset: 4, speed: 0.8 },
	{ pair: "SOL", name: "Solana", startOffset: 8, speed: 0.6 },
	{ pair: "ADA", name: "Cardano", startOffset: 40, speed: 1.0 },
];

export const useAnimatedStructures = () => {
	const [structureSteps, setStructureSteps] = useState<number[]>(
		cryptoStructures.map((crypto) => crypto.startOffset),
	);

	// Animate structure steps
	useEffect(() => {
		const interval = setInterval(() => {
			setStructureSteps((prevSteps) =>
				prevSteps.map((step, index) => {
					const crypto = cryptoStructures[index];
					const increment = crypto.speed * 0.5;
					return (step + increment) % sequences.length;
				}),
			);
		}, 800);

		return () => clearInterval(interval);
	}, []);

	// Generate structure slices based on animated steps
	const structureSlices = useMemo(() => {
		return cryptoStructures.map((crypto, index) => {
			const step = structureSteps[index];
			const values = createDemoStep(Math.floor(step), sequences, BASE_VALUES);
			return {
				timestamp: new Date().toISOString(),
				boxes: createMockBoxData(values),
			};
		});
	}, [structureSteps]);

	return { cryptoStructures, structureSlices };
};
