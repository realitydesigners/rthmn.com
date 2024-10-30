import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import styles from './styles.module.css';

interface SettingsBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SettingsBar: React.FC<SettingsBarProps> = ({ isOpen, onToggle }) => {
  const [activeAsset, setActiveAsset] = useState<string | null>(null);

  const toggleAsset = (asset: string) => {
    setActiveAsset(activeAsset === asset ? null : asset);
  };

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
              <button onClick={() => toggleAsset(asset)}>{asset}</button>
              {activeAsset === asset && (
                <div className={styles.assetContent}>
                  <input type="text" placeholder={`Search ${asset}`} />
                  {/* Grid of asset pairs/names */}
                  <div className={styles.assetGrid}>
                    {/* Example grid items */}
                    <div>Asset 1</div>
                    <div>Asset 2</div>
                    {/* Add more items as needed */}
                  </div>
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
