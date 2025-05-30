export const easeInOutCubic = (t: number): number =>
	t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

export const lerp = (start: number, end: number, factor: number) =>
	start + (end - start) * factor;

export const calculateBoxScale = (index: number) =>
	(1 / Math.sqrt(1.5)) ** index;

export interface BoxDimensions {
	size: number;
	scale: number;
}

export const getBoxDimensions = (
	index: number,
	baseSize = 12,
): BoxDimensions => {
	const scale = calculateBoxScale(index);
	return { size: baseSize * scale, scale };
};

export const getCornerPosition = (
	current: { size: number },
	parent: { size: number },
	isUp: boolean,
): [number, number, number] => {
	const offset = (parent.size - current.size) / 2;
	return [offset, isUp ? offset : -offset, offset];
};

export const generateScatteredPosition = (): [number, number, number] => [
	Math.random() * 60 + 30,
	(Math.random() - 0.5) * 40,
	(Math.random() - 0.5) * 60,
];

export const calculateCircularPosition = (
	index: number,
	focusedIndex: number,
	total: number,
	radius = 35,
): [number, number, number] => {
	const angle = ((index - focusedIndex) * Math.PI * 2) / total + Math.PI / 2;
	return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
};
