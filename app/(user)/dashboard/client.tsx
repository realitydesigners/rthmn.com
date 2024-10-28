'use client';

import React, { useState } from 'react';
import ShiftedBox from '@/components/Reso/Shifted'; // Import the ShiftedBox component

const Dashboard: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className="dashboard"
      style={{
        marginTop: '100px',
        marginBottom: '100px',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: `${isMenuOpen ? '200px' : '50px'} 1fr`
      }}
    >
      {/* Sidebar container */}
      <div
        className={`side-menu ${isMenuOpen ? 'open' : 'collapsed'}`}
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          width: isMenuOpen ? '200px' : '50px'
        }}
      >
        <button onClick={toggleMenu}>
          {isMenuOpen ? 'Collapse' : 'Expand'}
        </button>
        <div
          className="menu-content"
          style={{ display: isMenuOpen ? 'block' : 'none' }}
        >
          {/* Add your settings menu items here */}
          <p>Settings Item 1</p>
          <p>Settings Item 2</p>
        </div>
      </div>

      {/* Content container */}
      <div className="content-container" style={{ overflowY: 'auto' }}>
        {/* Main content goes here */}
        <h1>Main Content</h1>
        <p>This is the main content area.</p>

        {/* Add a grid of ShiftedBox components */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(9)].map((_, index) => (
            <ShiftedBox key={index} slice={null} isLoading={false} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
