import { useEffect, useState } from "react";

export const useCanvasSetup = () => {
	const [isClient, setIsClient] = useState(false);
	const [canvasDimensions, setCanvasDimensions] = useState({
		width: 0,
		height: 0,
	});

	useEffect(() => {
		setIsClient(true);

		const updateDimensions = () => {
			setCanvasDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		updateDimensions();

		const handleResize = () => {
			requestAnimationFrame(updateDimensions);
		};

		window.addEventListener("resize", handleResize, { passive: true });
		const timeoutId = setTimeout(updateDimensions, 100);

		return () => {
			window.removeEventListener("resize", handleResize);
			clearTimeout(timeoutId);
		};
	}, []);

	return { isClient, canvasDimensions };
};
