'use client';

import React from 'react';
import { NavbarSignedOut } from '@/components/NavbarSignedOut';
import { NavbarSignedIn } from '@/components/NavbarSignedIn';
import { useAuth } from '@/hooks/useAuth';

const DynamicNavbar = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You might want to replace this with a skeleton loader
  }

  return user ? <NavbarSignedIn user={user} /> : <NavbarSignedOut />;
};

export default DynamicNavbar;
