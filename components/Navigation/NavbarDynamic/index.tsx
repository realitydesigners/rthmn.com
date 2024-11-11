'use client';
import React from 'react';
import { NavbarSignedOut } from '@/components/Navigation/NavbarSignedOut';
import { NavbarSignedIn } from '@/components/Navigation/NavbarSignedIn';
import { useAuth } from '@/providers/SupabaseProvider';

const DynamicNavbar = () => {
  const { session } = useAuth();

  return session ? (
    <NavbarSignedIn user={session.user} />
  ) : (
    <NavbarSignedOut user={null} />
  );
};

export default DynamicNavbar;
