'use client';

export default function EmailForm({
  userEmail
}: {
  userEmail: string | undefined;
}) {
  return (
    <div className="rounded-lg border border-[#333] bg-gradient-to-b from-[#0A0A0A] to-[#181818] p-6">
      <div>
        <h3 className="font-russo text-sm uppercase tracking-wider text-zinc-400">
          Email Address
        </h3>
        <p className="mt-1 font-outfit text-lg font-medium text-zinc-100">
          {userEmail || 'No email set'}
        </p>
      </div>
    </div>
  );
}
