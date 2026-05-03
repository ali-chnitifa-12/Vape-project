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
      
      // Animate smoke fading in and scaling up to cover the screen
      timeline.to('.smoke-layer', {
        opacity: 1,
        scale: 1.5,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power2.out',
      })
      // Hold for a moment
      .to('.smoke-layer', {
        opacity: 0,
        scale: 2,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power2.in',
      }, "+=0.5");
      
      // Fade out the container
      timeline.to(containerRef.current, {
        opacity: 0,
        duration: 0.5,
      }, "-=0.5");
      
    }, containerRef);
    
    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div className="smoke-container" ref={containerRef}>
      <div className="smoke-layer layer-1"></div>
      <div className="smoke-layer layer-2"></div>
      <div className="smoke-layer layer-3"></div>
      <div className="smoke-layer layer-4"></div>
      <div className="smoke-intro-logo">KLAWDZ</div>
    </div>
  );
}
