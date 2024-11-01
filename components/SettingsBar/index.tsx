import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa';
import { useDashboard, AVAILABLE_PAIRS } from '@/providers/DashboardProvider';
import styles from './styles.module.css';
import { colorPresets } from '@/utils/colorPresets';

interface SettingsBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SettingsBar: React.FC<SettingsBarProps> = ({ isOpen, onToggle }) => {
  const { selectedPairs, togglePair, boxColors, updateBoxColors } =
    useDashboard();
  const [activeAsset, setActiveAsset] = useState<string | null>('FOREX');

  const toggleAsset = (asset: string) => {
    setActiveAsset(activeAsset === asset ? null : asset);
  };

  // Helper function to format pair names
  const formatPairName = (pair: string) => pair.toUpperCase();

  // Convert rgba to hex
  const rgbaToHex = (rgba: string) => {
    const values = rgba.replace('rgba(', '').split(',');
    const r = parseInt(values[0].trim());
    const g = parseInt(values[1].trim());
    const b = parseInt(values[2].trim());
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Convert hex to rgba
  const hexToRgba = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 1)`;
  };

  const handleColorChange = (type: 'positive' | 'negative', color: string) => {
    const newColors = {
      ...boxColors,
      [type]: hexToRgba(color)
    };
    updateBoxColors(newColors);
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = colorPresets.find((p) => p.name === e.target.value);
    if (preset) {
      updateBoxColors({
        positive: preset.positive,
        negative: preset.negative
      });
    }
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

        {/* Color Settings Container */}
        <div className={styles.assetSelection}>
          <h3>Box Colors</h3>
          <div className={styles.assetContent}>
            <div className={styles.presetSelector}>
              <select
                onChange={handlePresetChange}
                className={styles.searchInput}
                value={
                  colorPresets.find(
                    (p) =>
                      p.positive === boxColors.positive &&
                      p.negative === boxColors.negative
                  )?.name || ''
                }
              >
                <option value="" disabled>
                  Select a preset
                </option>
                {colorPresets.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.colorPicker}>
              <label className={styles.colorLabel}>
                <span>Positive</span>
                <input
                  type="color"
                  value={rgbaToHex(boxColors.positive)}
                  onChange={(e) =>
                    handleColorChange('positive', e.target.value)
                  }
                  className={styles.colorInput}
                />
              </label>
              <label className={styles.colorLabel}>
                <span>Negative</span>
                <input
                  type="color"
                  value={rgbaToHex(boxColors.negative)}
                  onChange={(e) =>
                    handleColorChange('negative', e.target.value)
                  }
                  className={styles.colorInput}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsBar;
