import { useEffect } from "react";

export const useScrollLock = (lock: boolean) => {
	useEffect(() => {
		if (lock) {
			// Save current scroll position
			const scrollPosition = window.scrollY;

			// Add styles to prevent scrolling
			document.body.style.overflow = "hidden";
			document.body.style.position = "fixed";
			document.body.style.width = "100%";
			document.body.style.top = `-${scrollPosition}px`;
		} else {
			// Get the scroll position from the body's top property
			const scrollPosition = document.body.style.top;

			// Remove styles that prevent scrolling
			document.body.style.overflow = "";
			document.body.style.position = "";
			document.body.style.width = "";
			document.body.style.top = "";

			// Restore scroll position
			if (scrollPosition) {
				window.scrollTo(
					0,
					Number.parseInt(scrollPosition.replace("px", "")) * -1,
				);
			}
		}
	}, [lock]);
};
