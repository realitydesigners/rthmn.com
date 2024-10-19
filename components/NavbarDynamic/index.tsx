'use client';

import React from 'react';
import { NavbarSignedOut } from '@/components/NavbarSignedOut'
import { NavbarSignedIn } from '@/components/NavbarSignedIn';
import { useAuth } from '@/hooks/useAuth';

const DynamicNavbar = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  return user ? <NavbarSignedIn user={user} /> : <NavbarSignedOut user={null} />;
};

export default DynamicNavbar;
