'use client';

import React from 'react';
import {Navbar} from './Navbar';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export const NavbarSignedOut: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Navbar user={user} />;
};
