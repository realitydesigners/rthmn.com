import React from 'react';
import styles from './styles.module.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  return (
    <div
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`}
    >
      <button onClick={onToggle} className={styles.toggleButton}>
        {isOpen ? 'Collapse' : 'Expand'}
      </button>
      <div className={`${styles.menuContent} ${isOpen ? styles.visible : ''}`}>
        <p>Settings Item 1</p>
        <p>Settings Item 2</p>
      </div>
    </div>
  );
};

export default Sidebar;
