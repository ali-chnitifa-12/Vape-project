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
        // Initial setup for particles
        gsap.set(p, {
          x: () => gsap.utils.random(-window.innerWidth / 3, window.innerWidth / 3),
          y: () => gsap.utils.random(window.innerHeight / 2, window.innerHeight + 200),
          scale: () => gsap.utils.random(1, 2),
          opacity: 0,
        });

        // Realistic smoke rising and swirling
        timeline.to(p, {
          x: () => `+=${gsap.utils.random(-300, 300)}`,
          y: () => gsap.utils.random(-window.innerHeight / 2, window.innerHeight / 4),
          scale: () => gsap.utils.random(4, 8),
          opacity: () => gsap.utils.random(0.4, 0.8),
          rotation: () => gsap.utils.random(-90, 90),
          duration: () => gsap.utils.random(2, 3.5),
          ease: 'power2.out',
        }, 0); 

        // Dissipate
        timeline.to(p, {
          opacity: 0,
          scale: () => gsap.utils.random(8, 12),
          y: '-=200',
          duration: () => gsap.utils.random(1, 1.5),
          ease: 'power2.in',
        }, 3);
      });

      // Logo entrance
      timeline.fromTo('.smoke-intro-logo', {
        opacity: 0,
        scale: 0.8,
        filter: 'blur(15px)'
      }, {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        ease: 'power3.out',
      }, 0.5)
      .to('.smoke-intro-logo', {
        opacity: 0,
        scale: 1.2,
        filter: 'blur(20px)',
        duration: 1,
        ease: 'power2.in'
      }, 3.5);

      // Fade out background
      timeline.to('.smoke-background', {
        opacity: 0,
        duration: 1.5,
        ease: 'power2.inOut'
      }, 3.5);
      
      // Fade out entire container to unmount gracefully
      timeline.to(containerRef.current, {
        opacity: 0,
        duration: 0.5
      }, 4.5);

    }, containerRef);
    
    return () => ctx.revert();
  }, [onComplete]);

  // Create 15 smoke particles
  const particles = Array.from({ length: 15 });

  return (
    <div className="smoke-container" ref={containerRef}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="realistic-smoke">
          <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="60" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="smoke-background"></div>
      <div className="smoke-particles-wrapper">
        {particles.map((_, i) => (
          <div key={i} className={`smoke-particle realistic-color-${i % 3}`}></div>
        ))}
      </div>
      <div className="smoke-intro-logo">KLAWDZ</div>
    </div>
  );
}



