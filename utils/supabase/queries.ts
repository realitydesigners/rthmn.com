import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export const getUser = async (supabase: SupabaseClient) => {
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
};

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

export const getProducts = async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
};

export const getUserDetails = async (supabase: SupabaseClient) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .single();
  return userDetails;
};

export const getSignals = async (supabase: SupabaseClient) => {
  const { data: signals, error } = await supabase.from('signals').select('*');

  if (error) {
    console.error('Error fetching signals:', error);
  }

  return signals;
};
