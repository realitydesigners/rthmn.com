"use client";

export default function EmailForm({
	userEmail,
}: { userEmail: string | undefined }) {
	return (
		<div className="flex items-center gap-3">
			<p className="font-russo text-lg font-medium text-zinc-100">
				{userEmail || "No email set"}
			</p>
		</div>
	);
}
