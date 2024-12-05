'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import SplineScene with ssr disabled
const SplineScene = dynamic(() => import('./SplineScene'), {
  ssr: false
});

export default function TestPage() {
  return (
    <main className="relative h-full w-full overflow-hidden">
      <SplineScene />
    </main>
  );
}
