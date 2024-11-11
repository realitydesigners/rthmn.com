'use client';

import React from 'react';
import config from '@/sanity.config';
import { NextStudio } from 'next-sanity/studio';

export const dynamic = 'force-dynamic';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
