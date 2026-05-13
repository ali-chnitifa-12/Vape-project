import React from 'react';
import './VapeModel.css';

const VapeModel = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const particleCount = isMobile ? 8 : 20;

  return (
    <div className="vape-container-simple">
      <div className="vape-rotating-photo">
        <img src="/images/premium_vape_isolated.png" alt="Vape" />
      </div>
      
      {/* Professional Smoke System - Optimized count for performance */}
      <div className="vape-smoke-minimal">
        {[...Array(particleCount)].map((_, i) => (
          <div 
            key={i} 
            className="smoke-p" 
            style={{ 
              '--delay': `${i * (isMobile ? 1.2 : 0.4)}s`,
              '--x': `${(Math.random() - 0.5) * (isMobile ? 40 : 60)}px`
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default VapeModel;
