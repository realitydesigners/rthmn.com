import type { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getUser = cache(async (supabase: SupabaseClient) => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
});

export const getSubscription = async (supabase: SupabaseClient) => {
  console.log('getSubscription: Starting to fetch subscription');
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*)')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.error('getSubscription: Error fetching subscription:', error);
  } else {
    console.log('getSubscription: Subscription fetched successfully');
    console.log('getSubscription: Subscription data:', subscription);
  }
  return subscription;
};

export const getProducts = cache(async (supabase: SupabaseClient) => {
  try {
    console.log('getProducts: Starting to fetch products');
    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('metadata->index', { ascending: true });

    if (productsError) throw productsError;

    console.log('getProducts: Products fetched successfully');
    console.log('getProducts: Products data:', products);

    console.log('getProducts: Starting to fetch prices');
    // Fetch prices
    const { data: prices, error: pricesError } = await supabase
      .from('prices')
      .select('*')
      .eq('active', true);

    if (pricesError) throw pricesError;

    console.log('getProducts: Prices fetched successfully');
    console.log('getProducts: Prices data:', prices);

    // Combine products with their prices
    const productsWithPrices = products.map((product) => ({
      ...product,
      prices: prices.filter((price) => price.product_id === product.id)
    }));

    console.log('getProducts: Products with prices combined successfully');
    console.log('getProducts: Products with prices data:', productsWithPrices);

    return productsWithPrices;
  } catch (error) {
    console.error('getProducts: Error fetching products:', error);
    return null;
  }
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  try {
    const { data: userDetails, error } = await supabase
      .from('users')
      .select('*')
      .single();

    if (error) throw error;
    return userDetails;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
});

export const getSignals = cache(async (supabase: SupabaseClient) => {
  try {
    const { data: signals, error } = await supabase.from('signals').select('*');

    if (error) throw error;
    return signals;
  } catch (error) {
    console.error('Error fetching signals:', error);
    return null;
  }
});
