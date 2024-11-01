import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { useDashboard, AVAILABLE_PAIRS } from '@/providers/DashboardProvider';
import styles from './styles.module.css';

interface SettingsBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SettingsBar: React.FC<SettingsBarProps> = ({ isOpen, onToggle }) => {
  const { selectedPairs, togglePair } = useDashboard();
  const [activeAsset, setActiveAsset] = useState<string | null>('FOREX');

  const toggleAsset = (asset: string) => {
    setActiveAsset(activeAsset === asset ? null : asset);
  };

  // Helper function to format pair names
  const formatPairName = (pair: string) => pair.toUpperCase();

  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}
    >
      <button onClick={onToggle} className={styles.toggleButton}>
        <FaCog className={isOpen ? styles.rotate : ''} />
      </button>
      <div className={`${styles.menuContent} ${isOpen ? styles.visible : ''}`}>
        {/* Asset Selection Container */}
        <div className={styles.assetSelection}>
          <h3>Asset Selection</h3>
          {['FOREX', 'Stocks', 'Crypto', 'Commodities'].map((asset) => (
            <div key={asset}>
              <button
                onClick={() => toggleAsset(asset)}
                className={`${styles.assetButton} ${activeAsset === asset ? styles.activeAsset : ''}`}
              >
                {asset}
              </button>
              {activeAsset === asset && (
                <div className={styles.assetContent}>
                  <input
                    type="text"
                    placeholder={`Search ${asset}`}
                    className={styles.searchInput}
                  />
                  {/* Grid of pairs - currently only showing FOREX pairs */}
                  {asset === 'FOREX' && (
                    <div className={styles.pairGrid}>
                      {AVAILABLE_PAIRS.map((pair) => (
                        <button
                          key={pair}
                          onClick={() => togglePair(pair)}
                          className={`${styles.pairButton} ${
                            selectedPairs.includes(pair)
                              ? styles.selectedPair
                              : ''
                          }`}
                        >
                          {formatPairName(pair)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pattern Settings Container */}
        <div className={styles.patternSettings}>
          <h3>Pattern Settings</h3>
          <div className={styles.levels}>
            <h4>Levels</h4>
            <div className={styles.flexContainer}>
              <div>Descriptor</div>
              <div>Value</div>
            </div>
          </div>
          <div className={styles.timeframe}>
            <h4>Timeframe</h4>
            <div className={styles.flexContainer}>
              <div>Descriptor</div>
              <div>Value</div>
            </div>
          </div>
        </div>

        {/* R:R Container */}
        <div className={styles.riskReward}>
          <h3>R:R Risk Reward</h3>
          {/* Add content for risk/reward settings */}
        </div>
      </div>
    </div>
  );
};

export default SettingsBar;
