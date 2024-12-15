'use client';
import { createStripePortal } from '@/utils/stripe/server';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaStripe } from 'react-icons/fa';
import { LuUser, LuCreditCard, LuLogOut, LuSettings } from 'react-icons/lu';

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
            minimumFractionDigits: 0,
        }).format((subscription?.prices?.unit_amount || 0) / 100);

    const handleStripePortalRequest = async () => {
        setIsSubmitting(true);
        const redirectUrl = await createStripePortal(currentPath);
        setIsSubmitting(false);
        return router.push(redirectUrl);
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='rounded-md bg-white/5 p-2'>
                        <LuCreditCard className='h-5 w-5 text-white' />
                    </div>
                    <div>
                        <h3 className='font-outfit text-lg font-semibold text-white'>{subscription ? `${subscription?.prices?.products?.name} Plan` : 'No active subscription'}</h3>
                        <p className='font-outfit text-sm text-zinc-400'>
                            {subscription ? `${subscriptionPrice}/${subscription?.prices?.interval}` : 'Choose a plan to get started'}
                        </p>
                    </div>
                </div>
                {!subscription && (
                    <Link
                        href='/pricing'
                        className='rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-6 py-2 text-sm text-white transition-all duration-200 hover:from-[#16a34a] hover:to-[#15803d]'>
                        Choose Plan
                    </Link>
                )}
            </div>

            {subscription && (
                <div className='flex items-center justify-between border-t border-white/10 pt-6'>
                    <div className='font-outfit flex items-center gap-2 text-sm text-zinc-400'>
                        <FaStripe className='h-5 w-5' />
                        <span>Manage your subscription</span>
                    </div>
                    <button
                        onClick={handleStripePortalRequest}
                        disabled={isSubmitting}
                        className='flex items-center gap-2 rounded-full bg-white/5 px-6 py-2 text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50'>
                        <LuCreditCard className='h-5 w-5 text-white' />
                        <span className='font-outfit text-sm'>{isSubmitting ? 'Loading...' : 'Manage Plan'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
