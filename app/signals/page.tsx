"use client";

import type { Signal } from "@/types";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignalsPage() {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
	const [signalsData, setSignalsData] = useState<Signal[] | null>(null);
	const supabase = createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);

	useEffect(() => {
		const getUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			setUser(user);
			if (!user) {
				router.push("/login");
			}
		};
		getUser();
	}, [supabase, router]);

	useEffect(() => {
		const checkSubscriptionAndFetchSignals = async () => {
			if (!user) return;

			const { data: subscriptionData, error: subscriptionError } =
				await supabase
					.from("subscriptions")
					.select("*")
					.eq("user_id", user.id)
					.eq("status", "active")
					.single();

			if (subscriptionError) {
				console.error("Error checking subscription:", subscriptionError);
				setHasSubscription(false);
				return;
			}

			setHasSubscription(!!subscriptionData);

			// Fetch signals data regardless of subscription status
			const { data: signalsData, error: signalsError } = await supabase
				.from("signals")
				.select("*");

			if (signalsError) {
				console.error("Error fetching signals:", signalsError);
			} else {
				setSignalsData(signalsData);
			}
		};

		checkSubscriptionAndFetchSignals();
	}, [user, supabase]);

	if (!user || hasSubscription === null) {
		return <div>Loading...</div>;
	}

	function SubscriptionPrompt() {
		return (
			<div className="text-center mt-10">
				<h2 className="text-2xl font-bold mb-4">Subscription Required</h2>
				<p className="mb-6">You need an active subscription to view signals.</p>
				<Link
					href="/subscribe"
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					Get Subscription
				</Link>
			</div>
		);
	}

	return (
		<div>
			{!hasSubscription && <SubscriptionPrompt />}
			{signalsData ? (
				<div className="p-6 bg-black min-h-screen text-white font-mono">
					{signalsData.length > 0 ? (
						<div className="overflow-x-auto">
							<table className="min-w-full bg-black shadow-lg rounded-lg text-xs">
								<thead className="bg-black">
									<tr>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Pair
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Pattern Type
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Pattern
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Status
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Start Price
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											End Price
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Stop Loss
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Take Profit
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Start Time
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											End Time
										</th>
										<th className="px-3 py-2 text-left text-[10px] font-bold text-gray-300 uppercase tracking-wider">
											Created At
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#181818]">
									{signalsData.map((signal: Signal) => {
										const patternInfo =
											typeof signal.pattern_info === "string"
												? JSON.parse(signal.pattern_info)
												: signal.pattern_info;
										const boxes =
											typeof signal.boxes === "string"
												? JSON.parse(signal.boxes)
												: signal.boxes;
										return (
											<tr key={signal.id} className="hover:bg-[#181818]">
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.pair}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.pattern_type}
												</td>
												<td className="px-3 py-2 text-gray-300">
													{patternInfo && (
														<div className="space-y-1">
															<p className="text-[10px]">
																{Array.isArray(patternInfo.pattern)
																	? `[${patternInfo.pattern.join(", ")}]`
																	: "N/A"}
															</p>
														</div>
													)}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.status}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.start_price
														? signal.start_price.toFixed(4)
														: "N/A"}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.end_price
														? signal.end_price.toFixed(4)
														: "N/A"}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.stop_loss
														? signal.stop_loss.toFixed(4)
														: "N/A"}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.take_profit
														? signal.take_profit.toFixed(4)
														: "N/A"}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.start_time
														? new Date(signal.start_time).toLocaleString()
														: "N/A"}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{signal.end_time
														? new Date(signal.end_time).toLocaleString()
														: "N/A"}
												</td>
												<td className="px-3 py-2 whitespace-nowrap text-gray-300">
													{new Date(signal.created_at).toLocaleString()}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					) : (
						<div>No signals available.</div>
					)}
				</div>
			) : (
				<div>Loading signals data...</div>
			)}
		</div>
	);
}
