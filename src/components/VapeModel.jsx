import React from 'react';
import './VapeModel.css';

const VapeModel = () => {
  return (
    <div className="vape-container-simple">
      <div className="vape-rotating-photo">
        <img src="/images/premium_vape_isolated.png" alt="Vape" />
      </div>
      
      {/* Professional Smoke System */}
      <div className="vape-smoke-minimal">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="smoke-p" 
            style={{ 
              '--delay': `${i * 0.8}s`,
              '--x': `${(Math.random() - 0.5) * 50}px`
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default VapeModel;
