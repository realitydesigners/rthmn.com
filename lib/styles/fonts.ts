import {
	DM_Mono,
	Kode_Mono,
	Outfit,
	Oxanium,
	Russo_One,
} from "next/font/google";

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
	variable: "--font-russo  ",
});

export const outfit = Outfit({
	subsets: ["latin"],
	display: "swap",
	weight: ["400", "500", "600", "700"],
	variable: "--font-outfit ",
});

export const dmmono = DM_Mono({
	subsets: ["latin"],
	display: "swap",
	weight: ["300", "400"],
	variable: "--font-dmmono ",
});
