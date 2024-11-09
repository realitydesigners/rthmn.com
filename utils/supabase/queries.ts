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
    const productsWithPrices = products.map((product) => {
      const productPrices = prices.filter(
        (price) => price.product_id === product.id
      );
      console.log(`Product ID: ${product.id}, Prices: ${productPrices.length}`);
      return {
        ...product,
        prices: productPrices
      };
    });

    return productsWithPrices;
  } catch (error) {
    console.error('getProducts: Error fetching products:', error);
    return null;
  }
});

export const getUserDetails = cache(async (supabase: SupabaseClient) => {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) throw new Error('No user found');

    // First try to get existing user details
    const { data: userDetails, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      // If user doesn't exist in the users table, create a new record
      if (error.code === 'PGRST116') {
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              full_name: null,
              avatar_url: null,
              billing_address: null,
              payment_method: null,
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating user:', insertError);
          throw insertError;
        }
        return newUser;
      }

      console.error('Error fetching user details:', error);
      throw error;
    }

    return userDetails;
  } catch (error) {
    console.error('Error in getUserDetails:', error);
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

export const getDiscordConnection = cache(async (supabase: SupabaseClient) => {
  try {
    const { data: discord, error } = await supabase
      .from('discord_connections')
      .select('*')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return discord;
  } catch (error) {
    console.error('Error fetching discord connection:', error);
    return null;
  }
});
