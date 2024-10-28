import React from 'react';
import { FaCog } from 'react-icons/fa';
import styles from './styles.module.css';

interface SettingsBarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const SettingsBar: React.FC<SettingsBarProps> = ({ isOpen, onToggle }) => {
  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}
    >
      <button onClick={onToggle} className={styles.toggleButton}>
        <FaCog className={isOpen ? styles.rotate : ''} />
      </button>
      <div className={`${styles.menuContent} ${isOpen ? styles.visible : ''}`}>
        <p>Settings Item 1</p>
        <p>Settings Item 2</p>
      </div>
    </div>
  );
};

export default SettingsBar;
