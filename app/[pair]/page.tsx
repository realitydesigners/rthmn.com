import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PairClient from "./PairClient";
import { getBoxSlices } from "@/app/utils/getBoxSlices";
import { getLatestBoxSlices } from "@/app/utils/getLatestBoxSlices";

interface PageProps {
	params: {
		pair: string;
	};
}

export default async function PairPage({ params }: PageProps) {
	const { pair } = params;
	const cookieStore = cookies();

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/signin");
	}

	const initialData = await getBoxSlices(pair, undefined, 500);
	const allPairsData = await getLatestBoxSlices();

	return (
		<div className="w-full">
			<PairClient
				initialData={initialData}
				pair={pair}
				allPairsData={allPairsData}
			/>
		</div>
	);
}
