'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { FaArrowRight, FaBolt, FaCheck, FaCrown, FaRocket } from 'react-icons/fa';
import { getErrorRedirect } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';

type Subscription = any;
type Product = any;
type Price = any;
interface ProductWithPrices extends Product {
    prices: Price[];
}
interface PriceWithProduct extends Price {
    products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
    prices: PriceWithProduct | null;
}

interface Props {
    user: User | null | undefined;
    products: ProductWithPrices[];
    subscription: SubscriptionWithProduct | null;
}

const PricingBenefits = [
    'Real-time Pattern Recognition',
    'Advanced Pattern Detection',
    'Real-time Market Analysis',
    'Premium Discord Access',
    'Trading Indicators',
    'Early Access Features',
];

export function SectionPricing({ user, products, subscription }: Props) {
    const router = useRouter();
    const [priceIdLoading, setPriceIdLoading] = useState<string>();
    const [selectedPriceId, setSelectedPriceId] = useState<string>();
    const currentPath = usePathname();

    const product = products[0];
    const price = product?.prices?.[0];

    const handleStripeCheckout = async (price: Price) => {
        setPriceIdLoading(price.id);

        if (!user) {
            setPriceIdLoading(undefined);
            return router.push('/signin');
        }

        const { errorRedirect, sessionId } = await checkoutWithStripe(
            price,
            price.type === 'recurring', // isSubscription
            '/account', // successPath
            currentPath // cancelPath
        );

        if (errorRedirect) {
            setPriceIdLoading(undefined);
            return router.push(errorRedirect);
        }

        if (!sessionId) {
            setPriceIdLoading(undefined);
            return router.push(getErrorRedirect(currentPath, 'An unknown error occurred.', 'Please try again later or contact a system administrator.'));
        }

        const stripe = await getStripe();
        stripe?.redirectToCheckout({ sessionId });

        setPriceIdLoading(undefined);
    };

    if (!product || !price) return null;

    const priceString = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.currency ?? 'USD',
        minimumFractionDigits: 0,
    }).format((price.unit_amount ?? 0) / 100);

    return (
        <section className='relative min-h-screen overflow-hidden py-32'>
            {/* Enhanced Background Effects */}
            <div className='pointer-events-none absolute inset-0'>
                <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]' />
            </div>

            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                {/* Enhanced Header Section */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className='mx-auto mb-12 max-w-3xl text-center'>
                    <h1 className='text-gray-gradient font-outfit mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>Elevate Your Trading Strategy</h1>
                    <p className='font-kodemono mx-auto max-w-2xl text-base text-gray-400 sm:text-lg'>Join an elite community of traders using trading tools from the future.</p>
                </motion.div>

                {/* Single Pricing Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className='mx-auto max-w-2xl'>
                    <div className='relative overflow-hidden rounded-xl border border-white/10 bg-black/40 inset-shadow-sm shadow-xl shadow-black/20 inset-shadow-white/5 backdrop-blur-sm'>
                        {/* Enhanced glow effects */}
                        <div className='pointer-events-none absolute inset-0'>
                            <div className='absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]' />
                            <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent' />
                        </div>

                        <div className='p-8'>
                            {/* Price Header */}
                            <div className='mb-8 text-center'>
                                <h2 className='font-outfit mb-4 text-3xl font-bold text-white'>{product.name}</h2>
                                <div className='mb-4'>
                                    <div className='inline-flexrounded-full px-6 py-2 inset-shadow-xs shadow-lg'>
                                        <span className='font-outfit text-6xl font-bold text-white'>{priceString}</span>
                                        <span className='font-kodemono ml-2 text-lg text-gray-400'>/month</span>
                                    </div>
                                </div>
                                <p className='font-kodemono text-md text-gray-400'>{product.description}</p>
                            </div>

                            {/* Benefits List */}
                            <div className='mb-8'>
                                <div className='flex w-full flex-col items-start justify-start'>
                                    {PricingBenefits.map((benefit, index) => (
                                        <div
                                            key={index}
                                            className='flex w-auto items-center gap-3 rounded-lg p-2 px-2 text-gray-400 transition-all duration-300 hover:bg-white/5 hover:inset-shadow-2xs hover:inset-shadow-white/10'>
                                            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-white/5 inset-shadow-xs shadow-sm inset-shadow-white/10'>
                                                <FaCheck className='h-3 w-3 text-emerald-400' />
                                            </div>
                                            <span className='font-kodemono text-md'>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleStripeCheckout(price)}
                                disabled={priceIdLoading === price.id}
                                className='group relative flex w-full items-center justify-center rounded-full bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white inset-ring inset-shadow-sm ring-1 shadow-lg shadow-black/20 ring-white/10 inset-shadow-white/10 inset-ring-white/5 transition-all duration-300 hover:from-[#444444] hover:to-[#282828] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'>
                                <span className='font-outfit relative flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-b from-[#0A0A0A] to-[#181818] px-4 py-3 text-lg font-medium transition-all duration-300 group-hover:inset-shadow-sm group-hover:inset-shadow-white/5'>
                                    {priceIdLoading === price.id ? (
                                        <span className='flex items-center gap-2'>
                                            <svg className='h-4 w-4 animate-spin' viewBox='0 0 24 24'>
                                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                                <path
                                                    className='opacity-75'
                                                    fill='currentColor'
                                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                                />
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : subscription ? (
                                        'Manage Subscription'
                                    ) : (
                                        <>
                                            Get Started Now
                                            <FaArrowRight className='h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5' />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Add floating elements */}
            <div className='pointer-events-none absolute inset-0 overflow-hidden'>
                <div className='absolute -top-1/2 left-0 h-96 w-96 -translate-x-1/2 rounded-full bg-white/5 blur-3xl' />
                <div className='absolute right-0 -bottom-1/2 h-96 w-96 translate-x-1/2 rounded-full bg-white/5 blur-3xl' />
            </div>
        </section>
    );
}
