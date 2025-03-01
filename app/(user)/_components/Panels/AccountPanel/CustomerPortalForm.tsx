'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaStripe } from 'react-icons/fa';
import { LuCreditCard } from 'react-icons/lu';
import { createStripePortal } from '@/utils/stripe/server';

type Subscription = any;
type Price = any;
type Product = any;

type SubscriptionWithPriceAndProduct = Subscription & {
    prices: Price;
};

interface Props {
    subscription: SubscriptionWithPriceAndProduct | null;
}

export default function CustomerPortalForm({ subscription }: Props) {
    const router = useRouter();
    const currentPath = usePathname();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const subscriptionPrice =
        subscription?.prices &&
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: subscription.prices.currency!,
            minimumFractionDigits: 0,
        }).format((subscription.prices.unit_amount || 0) / 100);

    const handleStripePortalRequest = async () => {
        setIsSubmitting(true);
        const redirectUrl = await createStripePortal(currentPath);
        setIsSubmitting(false);
        return router.push(redirectUrl);
    };

    return (
        <div className='space-y-4 sm:space-y-6'>
            <div className='flex flex-col items-start justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <div className='flex-shrink-0 rounded-md bg-white/5 p-2'>
                        <LuCreditCard className='h-4 w-4 text-white sm:h-5 sm:w-5' />
                    </div>
                    <div className='min-w-0'>
                        <h3 className='font-outfit truncate text-base font-semibold text-white sm:text-lg'>
                            {subscription?.prices ? `${subscription.prices.name || 'Pro'} Plan` : 'No active subscription'}
                        </h3>
                        <p className='font-outfit text-xs text-zinc-400 sm:text-sm'>
                            {subscription ? `${subscriptionPrice}/${subscription.prices.interval}` : 'Choose a plan to get started'}
                        </p>
                    </div>
                </div>
                {!subscription && (
                    <Link
                        href='/pricing'
                        className='rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-4 py-1.5 text-xs whitespace-nowrap text-white transition-all duration-200 hover:from-[#16a34a] hover:to-[#15803d] sm:px-6 sm:py-2 sm:text-sm'>
                        Choose Plan
                    </Link>
                )}
            </div>

            {subscription && (
                <div className='flex flex-col flex-wrap items-start justify-between gap-3'>
                    <button
                        onClick={handleStripePortalRequest}
                        disabled={isSubmitting}
                        className='flex w-full items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50 sm:w-auto sm:px-6 sm:py-2'>
                        <LuCreditCard className='h-4 w-4 text-white sm:h-5 sm:w-5' />
                        <span className='font-outfit text-xs sm:text-sm'>{isSubmitting ? 'Loading...' : 'Manage Plan'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
