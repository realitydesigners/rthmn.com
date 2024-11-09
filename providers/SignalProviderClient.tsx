'use client';
import React, { createContext, useContext, useState } from 'react';
import { Signal } from '@/types/types';

type SignalContextType = {
  signalsData: Signal[] | null;
  selectedSignal: Signal | null;
  setSelectedSignal: (signal: Signal | null) => void;
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
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  return (
    <SignalContext.Provider
      value={{ signalsData, selectedSignal, setSelectedSignal }}
    >
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
