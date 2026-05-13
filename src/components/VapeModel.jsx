import React from 'react';
import './VapeModel.css';

const VapeModel = () => {
  return (
    <div className="vape-container">
      <div className="vape-rotation-wrapper">
        <div className="vape-3d">
          {/* Drip Tip & Top Cap */}
          <div className="vape-part drip-tip-base"></div>
          <div className="vape-part drip-tip"></div>
          
          {/* Tank Section */}
          <div className="vape-part tank">
            <div className="tank-glass bulb"></div>
            <div className="tank-internal-coil"></div>
            <div className="tank-base"></div>
          </div>
          
          {/* Mod Body */}
          <div className="vape-part mod-body">
            <div className="mod-side front">
              <div className="vape-button fire-btn large"></div>
              <div className="vape-button-pair">
                <div className="vape-button small minus">-</div>
                <div className="vape-button small plus">+</div>
              </div>
              <div className="vape-screen-pro">
                <div className="screen-header">
                  <span className="mode">VW</span>
                  <span className="icon">⚙️</span>
                </div>
                <div className="main-wattage">85.0<span>W</span></div>
                <div className="detailed-stats">
                  <div className="stat-row"><span>VOLTS</span> <span>3.7V</span></div>
                  <div className="stat-row"><span>OHMS</span> <span>0.15Ω</span></div>
                  <div className="stat-row"><span>PUFF</span> <span>1340</span></div>
                </div>
                <div className="battery-level">
                  <div className="battery-icon"></div>
                  <span>78%</span>
                </div>
              </div>
              <div className="vape-port"></div>
            </div>
            <div className="mod-side back"></div>
            <div className="mod-side left">
              <div className="side-panel">
                <div className="side-logo">V</div>
              </div>
            </div>
            <div className="mod-side right">
              <div className="side-panel">
                <div className="side-logo">V</div>
              </div>
            </div>
            <div className="mod-side top"></div>
            <div className="mod-side bottom"></div>
          </div>
        </div>
      </div>
      
      {/* Smoke/Vapor System */}
      <div className="vape-smoke">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="smoke-particle" 
            style={{ 
              '--delay': `${i * 0.4}s`,
              '--x': `${(Math.random() - 0.5) * 40}px`,
              '--size': `${10 + Math.random() * 20}px`
            }} 
          />
        ))}
      </div>
    </div>
  );
};

export default VapeModel;
