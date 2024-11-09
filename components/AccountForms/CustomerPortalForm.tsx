'use client';
import { createStripePortal } from '@/utils/stripe/server';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaStripe, FaCreditCard } from 'react-icons/fa';

type Subscription = any;
type Price = any;
type Product = any;

type SubscriptionWithPriceAndProduct = Subscription & {
  prices:
    | (Price & {
        products: Product | null;
      })
    | null;
};

interface Props {
  subscription: SubscriptionWithPriceAndProduct | null;
}

export default function CustomerPortalForm({ subscription }: Props) {
  const router = useRouter();
  const currentPath = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscriptionPrice =
    subscription &&
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: subscription?.prices?.currency!,
      minimumFractionDigits: 0
    }).format((subscription?.prices?.unit_amount || 0) / 100);

  const handleStripePortalRequest = async () => {
    setIsSubmitting(true);
    const redirectUrl = await createStripePortal(currentPath);
    setIsSubmitting(false);
    return router.push(redirectUrl);
  };

  return (
    <div className="rounded-lg border border-[#333] bg-gradient-to-b from-[#0A0A0A] to-[#181818] p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-russo text-base font-medium text-white">
              Subscription Plan
            </h3>
          </div>
          <p className="mt-1 font-outfit text-sm text-zinc-400">
            {subscription
              ? `${subscription?.prices?.products?.name} Plan`
              : 'No active subscription'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-outfit text-2xl font-bold text-white">
            {subscription ? (
              `${subscriptionPrice}/${subscription?.prices?.interval}`
            ) : (
              <Link
                href="/"
                className="text-sm text-blue-500 hover:text-blue-400"
              >
                Choose a plan
              </Link>
            )}
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 pr-6 font-outfit text-sm text-zinc-400">
          <FaStripe className="h-5 w-5" />
          <span>Manage your subscription</span>
        </div>
        <button
          onClick={handleStripePortalRequest}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[2px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828] disabled:opacity-50"
        >
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-6 py-2">
            <FaCreditCard className="h-4 w-4" />
            <span className="font-outfit text-sm">
              {isSubmitting ? 'Loading...' : 'Manage Plan'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
