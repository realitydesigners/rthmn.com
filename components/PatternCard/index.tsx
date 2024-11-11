import React from 'react';
import ShiftedBox from '@/components/Charts/Reso/Shifted';
import { Signal, BoxSlice } from '@/types/types';
import { useSignals } from '@/providers/SignalProviderClient';

type PatternCardProps = {
  signal: Signal;
};

const PatternCard: React.FC<PatternCardProps> = ({ signal }) => {
  const { setSelectedSignal } = useSignals();

  // Function to open modal
  const openModal = () => {
    // Logic to open modal goes here
    console.log('Modal opened');
  };

  // Parse boxes from string to object
  const boxes = signal.boxes ? JSON.parse(signal.boxes) : [];

  // Create BoxSlice object for ShiftedBox component
  const boxSlice: BoxSlice = {
    timestamp: signal.start_time || new Date().toISOString(),
    boxes: boxes.map((box: any) => ({
      high: box.high,
      low: box.low,
      value: box.value
    }))
  };

  // Calculate time left (10 minutes from start time)
  const startTime = signal.start_time
    ? new Date(signal.start_time)
    : new Date();
  const endTime = new Date(startTime.getTime() + 10 * 60 * 1000); // Add 10 minutes
  const timeLeft = Math.max(0, endTime.getTime() - Date.now());

  // Format time left as minutes and seconds
  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="m-auto max-w-[300px] rounded-lg border border-[#181818] bg-black p-4 text-center text-white"
      onClick={() => {
        setSelectedSignal(signal);
        openModal(); // Open modal on click
      }}
    >
      {/* Top Container */}
      <div className="mb-2 flex justify-between text-sm">
        <div>{signal.pair}</div>
        <div>{signal.pattern_type}</div>
      </div>

      {/* Middle Container */}
      <div className="mb-2">
        <ShiftedBox slice={boxSlice} isLoading={false} />
      </div>

      {/* Bottom Container */}
      <div className="flex justify-between text-xs text-gray-400">
        <div>{new Date(signal.start_time || '').toLocaleTimeString()}</div>
        <div>{new Date(signal.start_time || '').toLocaleDateString()}</div>
        <div>Time Left: {formatTimeLeft(timeLeft)}</div>
      </div>
    </div>
  );
};

export default PatternCard;
