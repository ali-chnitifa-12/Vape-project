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

      // Crazy fast swirling animation for each smoke particle
      const particles = gsap.utils.toArray('.smoke-particle');
      
      particles.forEach((p, i) => {
        // Randomize initial positions
        gsap.set(p, {
          x: () => gsap.utils.random(-window.innerWidth / 2, window.innerWidth / 2),
          y: () => gsap.utils.random(window.innerHeight / 2, window.innerHeight),
          scale: () => gsap.utils.random(0.5, 2),
          opacity: 0,
          rotation: () => gsap.utils.random(0, 360)
        });

        // Wild movement
        timeline.to(p, {
          x: () => gsap.utils.random(-window.innerWidth, window.innerWidth),
          y: () => gsap.utils.random(-window.innerHeight, 0),
          scale: () => gsap.utils.random(3, 8),
          opacity: () => gsap.utils.random(0.3, 0.8),
          rotation: () => gsap.utils.random(-720, 720),
          duration: () => gsap.utils.random(1.5, 2.5),
          ease: 'power4.out',
        }, 0); // start at 0
        
        // Fade out
        timeline.to(p, {
          opacity: 0,
          scale: () => gsap.utils.random(8, 12),
          duration: () => gsap.utils.random(0.8, 1.5),
          ease: 'power2.in',
        }, 1.5);
      });

      // Logo crazy entrance
      timeline.fromTo('.smoke-intro-logo', {
        opacity: 0,
        scale: 0.1,
        z: -1000,
        rotationX: 90,
        filter: 'blur(20px)'
      }, {
        opacity: 1,
        scale: 1.2,
        z: 0,
        rotationX: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'elastic.out(1, 0.3)',
      }, 0.5)
      .to('.smoke-intro-logo', {
        opacity: 0,
        scale: 3,
        filter: 'blur(30px)',
        duration: 0.8,
        ease: 'power3.in'
      }, 2.2);

      // Fade out the entire container
      timeline.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
      }, 2.8);
      
    }, containerRef);
    
    return () => ctx.revert();
  }, [onComplete]);

  // Create 20 smoke particles
  const particles = Array.from({ length: 20 });

  return (
    <div className="smoke-container" ref={containerRef}>
      <div className="smoke-background"></div>
      {particles.map((_, i) => (
        <div key={i} className={`smoke-particle color-${i % 4}`}></div>
      ))}
      <div className="smoke-intro-logo">KLAWDZ</div>
    </div>
  );
}

