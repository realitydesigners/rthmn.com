'use client';

<<<<<<< HEAD
=======
import { FaEnvelope } from 'react-icons/fa';

>>>>>>> 1293c3e (reimagined)
export default function EmailForm({
  userEmail
}: {
  userEmail: string | undefined;
}) {
  return (
    <div className="rounded-lg border border-[#333] bg-gradient-to-b from-[#0A0A0A] to-[#181818] p-6">
<<<<<<< HEAD
      <div>
        <h3 className="font-russo text-sm uppercase tracking-wider text-zinc-400">
          Email Address
        </h3>
        <p className="mt-1 font-outfit text-lg font-medium text-zinc-100">
          {userEmail || 'No email set'}
        </p>
=======
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FaEnvelope className="h-4 w-4 text-zinc-400" />
            <h3 className="font-outfit text-lg font-medium text-white">
              Email Address
            </h3>
          </div>
          <p className="mt-1 font-outfit text-xl font-semibold text-zinc-300">
            {userEmail || 'No email set'}
          </p>
        </div>
>>>>>>> 1293c3e (reimagined)
      </div>
    </div>
  );
}
