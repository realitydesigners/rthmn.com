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
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*)')
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  if (error) {
    console.error('getSubscription: Error fetching subscription:', error);
  } else {
  }
  return subscription;
};

export const getProducts = cache(async (supabase: SupabaseClient) => {
  try {
    // Fetch products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('metadata->index', { ascending: true });

    if (productsError) throw productsError;
    // Fetch prices
    const { data: prices, error: pricesError } = await supabase
      .from('prices')
      .select('*')
      .eq('active', true);

    if (pricesError) throw pricesError;

    // Combine products with their prices
    const productsWithPrices = products.map((product) => ({
      ...product,
      prices: prices.filter((price) => price.product_id === product.id)
    }));

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
