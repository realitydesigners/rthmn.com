import { createClient } from "@/utils/supabase/server";
import { Navlinks } from "./Navlinks";

export default async function Navbar() {
	const supabase = createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	return <Navlinks user={user} />;
}
