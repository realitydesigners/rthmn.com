'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/types/supabase';

type UserDetails = Database['public']['Tables']['users']['Row'];
type DiscordConnection = Database['public']['Tables']['discord_connections']['Row'];
type Subscription = any; // Replace with your subscription type

interface UserContextType {
    user: User | null;
    userDetails: UserDetails | null;
    subscription: Subscription | null;
    discordConnection: DiscordConnection | null;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export default function UserProvider({ children, initialUser }: { children: React.ReactNode; initialUser: User | null }) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [discordConnection, setDiscordConnection] = useState<DiscordConnection | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                // Fetch user details
                const { data: details } = await supabase.from('users').select('*').eq('id', user.id).single();

                // Fetch subscription
                const { data: sub } = await supabase.from('subscriptions').select('*, prices(*, products(*))').eq('user_id', user.id).single();

                // Fetch discord connection
                const { data: discord } = await supabase.from('discord_connections').select('*').eq('user_id', user.id).single();

                setUserDetails(details);
                setSubscription(sub);
                setDiscordConnection(discord);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user, supabase]);

    return (
        <UserContext.Provider
            value={{
                user,
                userDetails,
                subscription,
                discordConnection,
                isLoading,
            }}>
            {children}
        </UserContext.Provider>
    );
}
