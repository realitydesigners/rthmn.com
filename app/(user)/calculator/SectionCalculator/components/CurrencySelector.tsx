import { memo } from "react";
import { FaGlobe } from "react-icons/fa";

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "AUD" | "CAD";

interface CurrencySelectorProps {
	currency: Currency;
	onCurrencyChange: (currency: Currency) => void;
}

const CURRENCIES: { value: Currency; symbol: string; label: string }[] = [
	{ value: "USD", symbol: "$", label: "US Dollar" },
	{ value: "EUR", symbol: "€", label: "Euro" },
	{ value: "GBP", symbol: "£", label: "British Pound" },
	{ value: "JPY", symbol: "¥", label: "Japanese Yen" },
	{ value: "AUD", symbol: "A$", label: "Australian Dollar" },
	{ value: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

export const CurrencySelector = memo(
	({ currency, onCurrencyChange }: CurrencySelectorProps) => (
		<div className="relative">
			<label className="font-kodemono  mb-2 block text-sm primary-text">
				Currency
			</label>
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
					<FaGlobe className="h-5 w-5 primary-text" />
				</div>
				<select
					value={currency}
					onChange={(e) => onCurrencyChange(e.target.value as Currency)}
					className="w-full appearance-none rounded-xl border border-[#1C1E23] bg-[#1C1E23] py-4 pr-4 pl-12 text-white shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 focus:border-blue-400/50 focus:bg-blue-400/5 focus:ring-2 focus:ring-blue-400/20 focus:outline-none"
				>
					{CURRENCIES.map((curr) => (
						<option key={curr.value} value={curr.value} className="bg-black">
							{curr.symbol} {curr.label}
						</option>
					))}
				</select>
			</div>
		</div>
	),
);

CurrencySelector.displayName = "CurrencySelector";

export const getCurrencySymbol = (currency: Currency) => {
	return CURRENCIES.find((curr) => curr.value === currency)?.symbol || "$";
};
