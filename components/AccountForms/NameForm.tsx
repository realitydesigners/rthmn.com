'use client';

import Card from '@/components/Card';
import { handleRequest } from '@/utils/auth-helpers/client';
import { updateName } from '@/utils/auth-helpers/server';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NameForm({ userName }: { userName: string }) {
  return (
    <Card
      title="Your Name"
      description="This is the name displayed on your account."
    >
      <div className="mb-4 mt-8 text-xl font-semibold">
        <p>{userName}</p>
      </div>
    </Card>
  );
}
