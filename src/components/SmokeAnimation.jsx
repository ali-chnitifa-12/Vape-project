import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './SmokeAnimation.css';

export default function SmokeAnimation({ onComplete }) {
  const containerRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      const particles = gsap.utils.toArray('.smoke-particle');
      
      particles.forEach((p, i) => {
        // Spawn from bottom across the full width
        gsap.set(p, {
          x: () => gsap.utils.random(-window.innerWidth / 2, window.innerWidth / 2),
          y: () => gsap.utils.random(window.innerHeight * 0.5, window.innerHeight + 300),
          scale: () => gsap.utils.random(2, 4),
          opacity: 0,
        });

        // Rise and spread across the full screen
        timeline.to(p, {
          x: () => `+=${gsap.utils.random(-400, 400)}`,
          y: () => gsap.utils.random(-window.innerHeight * 0.6, window.innerHeight * 0.3),
          scale: () => gsap.utils.random(6, 12),
          opacity: () => gsap.utils.random(0.5, 0.9),
          rotation: () => gsap.utils.random(-120, 120),
          duration: () => gsap.utils.random(2, 4),
          ease: 'power1.out',
        }, i * 0.05);

        // Dissipate
        timeline.to(p, {
          opacity: 0,
          scale: () => gsap.utils.random(12, 18),
          y: '-=300',
          duration: () => gsap.utils.random(1.5, 2),
          ease: 'power2.in',
        }, 3.2);
      });

      // Fade out background
      timeline.to('.smoke-background', {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut'
      }, 3.2);
      
      // Fade out entire container to unmount gracefully
      timeline.to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in'
      }, 4.5);

    }, containerRef);
    
    return () => ctx.revert();
  }, [onComplete]);

  // Create 25 smoke particles for a full-screen effect
  const particles = Array.from({ length: 25 });

  return (
    <div className="smoke-container" ref={containerRef}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="realistic-smoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="smoke-background"></div>
      <div className="smoke-particles-wrapper">
        {particles.map((_, i) => (
          <div key={i} className={`smoke-particle realistic-color-${i % 3}`}></div>
        ))}
      </div>
    </div>
  );
}



