import { AppProviders } from "@/providers/AppProviders";
import { SignalProvider } from "@/providers/SignalProvider";

export default function UserLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AppProviders>
			<SignalProvider>
			<div className="h-screen w-full">{children}</div>
			</SignalProvider>
		</AppProviders>
	);
}
