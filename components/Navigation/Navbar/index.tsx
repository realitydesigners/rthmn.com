'use client';
import React from 'react';
import { NavbarSignedOut } from '@/components/Navigation/Navbar/NavbarSignedOut';
import { NavbarSignedIn } from '@/components/Navigation/Navbar/NavbarSignedIn';
import { useAuth } from '@/providers/SupabaseProvider';

export const Navbar = () => {
  const { session } = useAuth();

  return session ? (
    <NavbarSignedIn user={session.user} />
  ) : (
    <NavbarSignedOut user={null} />
  );
};
