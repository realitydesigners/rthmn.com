import React from 'react';
import { useSignals } from '@/providers/SignalProvider/client';
import styles from './PatternModal.module.css';
import { ResoBox } from '@/components/Charts/ResoBox';
import { LineChart } from '../Charts/LineChart';
import { BoxSlice } from '@/types/types';

const PatternModal: React.FC = () => {
  const { selectedSignal, setSelectedSignal } = useSignals();

  if (!selectedSignal) return null;

  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedSignal(null);
    }
  };

  // Parse boxes from string to object
  const boxes = selectedSignal.boxes ? JSON.parse(selectedSignal.boxes) : [];

  // Create BoxSlice object for ShiftedBox component
  const boxSlice: BoxSlice = {
    timestamp: selectedSignal.start_time || new Date().toISOString(),
    boxes: boxes.map((box: any) => ({
      high: box.high,
      low: box.low,
      value: box.value
    }))
  };

  return (
    <div className={styles.modal} onClick={handleClose}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={() => setSelectedSignal(null)}>
          &times;
        </span>
        <div className={styles.mainContainer}>
          <div className={styles.indicatorContainer}>
            <div className={styles.chartContainer}>
              <LineChart pair={selectedSignal.pair} candles={[]} />
            </div>
            <div className={styles.histogramContainer}>
              {/* Histogram content goes here */}
            </div>
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.pairContainer}>
              <h2>{selectedSignal.pair}</h2>
            </div>
            <div className={styles.graphicContainer}>
              <ResoBox slice={boxSlice} isLoading={false} />
            </div>
            <div className={styles.dataChartContainer}>
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mock Data 1</td>
                    <td>Value 1</td>
                  </tr>
                  <tr>
                    <td>Mock Data 2</td>
                    <td>Value 2</td>
                  </tr>
                  {/* Add more mock data rows as needed */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatternModal;
