import React from 'react';
import ShiftedBox from '@/components/Reso/Shifted';
import { Signal } from '@/types'; // Ensure you have a Signal type defined

type PatternCardProps = {
  signal: Signal;
};

const PatternCard: React.FC<PatternCardProps> = ({ signal }) => {
  // Calculate time left (example logic, adjust as needed)
  const timeLeft = signal.end_time
    ? new Date(signal.end_time).getTime() - Date.now()
    : 'N/A';

  return (
    <div
      style={{
        maxWidth: '300px', // Set max width
        margin: '0 auto', // Center the card horizontally
        border: '1px solid #ccc',
        padding: '16px',
        borderRadius: '8px',
        textAlign: 'center' // Center content within the card
      }}
    >
      {/* Top Container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}
      >
        <div>{signal.pair}</div>
        <div>{signal.pattern_type}</div>
      </div>

      {/* Middle Container */}
      <div style={{ marginBottom: '8px' }}>
        <ShiftedBox slice={null} isLoading={false} />
      </div>

      {/* Bottom Container */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>Pattern Time: {signal.start_time}</div>
        <div>
          Time Left:{' '}
          {typeof timeLeft === 'number' ? `${timeLeft} ms` : timeLeft}
        </div>
      </div>
    </div>
  );
};

export default PatternCard;
