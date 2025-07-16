import { isLegacyUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const supabase = await createClient();
		const {
			error,
			data: { user },
		} = await supabase.auth.getUser();

		if (error || !user) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		const isLegacy = await isLegacyUser(user.id);

		return NextResponse.json({
			userId: user.id,
			accountType: isLegacy ? "legacy" : "new",
			isLegacy,
		});
	} catch (error) {
		console.error("Error getting user stripe type:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}