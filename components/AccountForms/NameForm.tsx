'use client';

<<<<<<< HEAD
export default function NameForm({ userName }: { userName: string }) {
  return (
    <div className="rounded-lg border border-[#333] bg-gradient-to-b from-[#0A0A0A] to-[#181818] p-6">
      <div>
        <h3 className="font-russo text-sm uppercase tracking-wider text-zinc-400">
          Name
        </h3>
        <p className="mt-1 font-outfit text-lg font-medium text-zinc-100">
          {userName || 'No name set'}
        </p>
=======
import { FaUser } from 'react-icons/fa';

export default function NameForm({ userName }: { userName: string }) {
  return (
    <div className="rounded-lg border border-[#333] bg-gradient-to-b from-[#0A0A0A] to-[#181818] p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FaUser className="h-4 w-4 text-zinc-400" />
            <h3 className="font-outfit text-lg font-medium text-white">Name</h3>
          </div>
          <p className="mt-1 font-outfit text-xl font-semibold text-zinc-300">
            {userName || 'No name set'}
          </p>
        </div>
>>>>>>> 1293c3e (reimagined)
      </div>
    </div>
  );
}
