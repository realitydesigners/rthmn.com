'use client';
import React, { createContext, useContext, useState } from 'react';
import { Signal } from '@/types';

type SignalContextType = {
  signalsData: Signal[] | null;
};

const SignalContext = createContext<SignalContextType | undefined>(undefined);

type SignalProviderProps = {
  children: React.ReactNode;
  initialSignalsData: Signal[] | null;
};

export function SignalProviderClient({
  children,
  initialSignalsData
}: SignalProviderProps) {
  const [signalsData, setSignalsData] = useState<Signal[] | null>(
    initialSignalsData
  );

  return (
    <SignalContext.Provider value={{ signalsData }}>
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
