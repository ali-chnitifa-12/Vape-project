import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './SmokeAnimation.css';

export default function SmokeAnimation({ onComplete }) {
  const containerRef = useRef(null);
  const wrappersRef = useRef([]);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      const wrappers = gsap.utils.toArray('.smoke-wrapper');
      wrappersRef.current = wrappers;
      const particles = gsap.utils.toArray('.smoke-particle');
      
      particles.forEach((p, i) => {
        // Randomize initial positions in wrappers
        gsap.set(p, {
          x: () => gsap.utils.random(-window.innerWidth / 2, window.innerWidth / 2),
          y: () => gsap.utils.random(window.innerHeight / 2, window.innerHeight),
          scale: () => gsap.utils.random(0.5, 2),
          opacity: 0,
          rotation: () => gsap.utils.random(0, 360)
        });

        // Wild movement (explosion)
        timeline.to(p, {
          x: () => gsap.utils.random(-window.innerWidth, window.innerWidth),
          y: () => gsap.utils.random(-window.innerHeight, window.innerHeight),
          scale: () => gsap.utils.random(3, 8),
          opacity: () => gsap.utils.random(0.1, 0.4),
          rotation: () => gsap.utils.random(-720, 720),
          duration: () => gsap.utils.random(1.5, 2.5),
          ease: 'power4.out',
        }, 0); 

        // Endless wandering (after explosion)
        gsap.to(p, {
          x: () => gsap.utils.random(-window.innerWidth, window.innerWidth),
          y: () => gsap.utils.random(-window.innerHeight, window.innerHeight),
          scale: () => gsap.utils.random(4, 10),
          rotation: () => gsap.utils.random(-360, 360),
          opacity: () => gsap.utils.random(0.05, 0.25), // keep opacity low so it's a subtle background
          duration: () => gsap.utils.random(10, 20),
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 2.5
        });
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

      // Fade out the solid background to reveal the site beneath
      timeline.to('.smoke-background', {
        opacity: 0,
        duration: 1,
        ease: 'power2.inOut'
      }, 2.5);
      
      // Make the container non-blocking entirely once animation finishes, but keep smoke visible
      timeline.to(containerRef.current, {
        pointerEvents: 'none'
      }, 2.5);

    }, containerRef);
    
    // Mouse movement parallax effect
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const yPos = (clientY / window.innerHeight - 0.5) * 2; // -1 to 1

      wrappersRef.current.forEach((w, i) => {
        const depth = (i % 5) + 1; // 1 to 5
        gsap.to(w, {
          x: xPos * depth * -30, // move away from mouse
          y: yPos * depth * -30,
          duration: 1.5,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onComplete]);

  // Create 20 smoke particles
  const particles = Array.from({ length: 20 });

  return (
    <div className="smoke-container" ref={containerRef}>
      <div className="smoke-background"></div>
      {particles.map((_, i) => (
        <div key={i} className="smoke-wrapper">
          <div className={`smoke-particle color-${i % 4}`}></div>
        </div>
      ))}
      <div className="smoke-intro-logo">KLAWDZ</div>
    </div>
  );
}



