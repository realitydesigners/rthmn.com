import { buildLegacyTheme } from "sanity";

const props = {
	"--my-white": "#fff",
	"--my-black": "#000000",
	"--my-brand": "#00cc7a",
	"--my-red": "#ff4444",
	"--my-blue": "#00cc7a",
	"--my-gray": "#333333",
	"--my-darker-gray": "#1e1e1e",
};

export const myTheme = buildLegacyTheme({
	/* Base theme colors */
	"--black": props["--my-black"],
	"--white": props["--my-white"],

	"--gray": props["--my-gray"],
	"--gray-base": props["--my-gray"],

	"--component-bg": props["--my-black"],
	"--component-text-color": props["--my-white"],

	/* Brand */
	"--brand-primary": props["--my-blue"],

	// Default button
	"--default-button-color": props["--my-blue"],
	"--default-button-primary-color": props["--my-blue"],
	"--default-button-success-color": props["--my-blue"],
	"--default-button-warning-color": props["--my-blue"],
	"--default-button-danger-color": props["--my-red"],

	/* State */
	"--state-info-color": props["--my-blue"],
	"--state-success-color": props["--my-blue"],
	"--state-warning-color": props["--my-blue"],
	"--state-danger-color": props["--my-red"],

	/* Navbar */
	"--main-navigation-color": props["--my-black"],
	"--main-navigation-color--inverted": props["--my-white"],

	/* Focus */
	"--focus-color": props["--my-blue"],
});
