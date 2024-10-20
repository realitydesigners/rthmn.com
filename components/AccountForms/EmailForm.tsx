'use client';

import Card from '@/components/Card';

export default function EmailForm({
  userEmail
}: {
  userEmail: string | undefined;
}) {
  return (
    <Card
      title="Your Email"
      description="This is the email address associated with your account."
    >
      <div className="mb-4 mt-8 text-xl font-semibold">
        <p>{userEmail ?? 'No email set'}</p>
      </div>
    </Card>
  );
}
