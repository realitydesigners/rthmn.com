"use client";

export const NoInstruments = () => {
	return (
		<div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
			<div className="max-w-sm rounded-lg border border-[#0A0B0D] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-4 sm:p-6">
				<h3 className="font-russo text-lg font-medium text-neutral-200">
					No Instruments Selected
				</h3>
				<p className="mt-2 text-sm primary-text">
					Click the chart icon in the left sidebar to browse and select trading
					pairs
				</p>
			</div>
		</div>
	);
};
