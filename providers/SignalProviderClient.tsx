'use client';
import React, { createContext, useContext, useState } from 'react';
import { Signal } from '@/types';

type SignalContextType = {
  signalsData: Signal[] | null;
  hasSubscription: boolean | null;
};

const SignalContext = createContext<SignalContextType | undefined>(undefined);

type SignalProviderProps = {
  children: React.ReactNode;
  initialSignalsData: Signal[] | null;
  initialHasSubscription: boolean | null;
};

export function SignalProviderClient({
  children,
  initialSignalsData,
  initialHasSubscription
}: SignalProviderProps) {
  const [signalsData, setSignalsData] = useState<Signal[] | null>(
    initialSignalsData
  );
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(
    initialHasSubscription
  );

  return (
    <SignalContext.Provider value={{ signalsData, hasSubscription }}>
      {children}
    </SignalContext.Provider>
  );
}

export function useSignals() {
  const context = useContext(SignalContext);
  if (context === undefined) {
    throw new Error('useSignals must be used within a SignalProvider');
  }
  return context;
}
