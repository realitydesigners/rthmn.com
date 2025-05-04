"use client";

export const NoInstruments = () => {
	return (
		<div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
			<div className="max-w-sm rounded-lg border border-[#222] bg-gradient-to-b from-[#141414] via-[#111] to-[#0A0A0A] p-4 sm:p-6">
				<h3 className="font-outfit text-lg font-medium text-neutral-200">
					No Instruments Selected
				</h3>
				<p className="mt-2 text-sm text-neutral-500">
					Click the chart icon in the left sidebar to browse and select trading
					pairs
				</p>
			</div>
		</div>
	);
};
