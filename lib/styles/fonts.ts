import { Kode_Mono, Russo_One, Oxanium, Outfit } from "next/font/google";

export const oxanium = Oxanium({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600", "700"],
	variable: "--font-oxanium",
});

export const russo = Russo_One({
	subsets: ["latin"],
	display: "swap",
	weight: ["400"],
	variable: "--font-russo ",
});

export const kodemono = Kode_Mono({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600", "700"],
	variable: "--font-kodemono",
});

export const outfit = Outfit({
	subsets: ["latin"],
	display: "swap",
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
	variable: "--font-outfit",
});
