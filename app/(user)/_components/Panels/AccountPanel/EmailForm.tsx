'use client';

export default function EmailForm({ userEmail }: { userEmail: string | undefined }) {
    return (
        <div className='flex items-center gap-3'>
            <p className='font-outfit text-lg font-medium text-zinc-100'>{userEmail || 'No email set'}</p>
        </div>
    );
}
