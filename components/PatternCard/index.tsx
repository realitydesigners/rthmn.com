import React from 'react';
import { NestedBoxes } from '@/components/Charts/NestedBoxes';
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

  // Transform boxes to match NestedBoxes format
  const transformedBoxes = boxes.map((box: any) => ({
    value: box.value // NestedBoxes only needs the value property
  }));

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

      {/* Middle Container - Replace ShiftedBox with NestedBoxes */}
      <div className="mb-2 relative flex justify-center">
        <NestedBoxes 
          boxes={transformedBoxes}
          demoStep={0}
          isPaused={true}
          baseSize={250}
          colorScheme="green-red"
        />
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
