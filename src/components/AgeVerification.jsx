import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './AgeVerification.css';

export default function AgeVerification({ onVerified }) {
  const [isVerified, setIsVerified] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Check local storage
    const verified = localStorage.getItem('klawdz_age_verified');
    if (verified === 'true') {
      setIsVerified(true);
      onVerified();
    }
  }, [onVerified]);

  const handleVerify = (isAdult) => {
    if (isAdult) {
      // Animate out
      gsap.to(contentRef.current, {
        opacity: 0,
        y: -50,
        duration: 0.5,
        ease: 'power2.in',
      });
      
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          localStorage.setItem('klawdz_age_verified', 'true');
          setIsVerified(true);
          onVerified();
        }
      });
    } else {
      setIsRejected(true);
    }
  };

  if (isVerified) return null;

  return (
    <div className="age-verification" ref={containerRef}>
      <div className="age-verification__bg"></div>
      <div className="age-verification__content" ref={contentRef}>
        <div className="age-verification__logo">Klawdz</div>
        {!isRejected ? (
          <>
            <h2 className="age-verification__title">Age Verification</h2>
            <p className="age-verification__text">
              You must be 18 years of age or older to enter this site.
              <br />Please verify your age.
            </p>
            <div className="age-verification__buttons">
              <button className="btn-primary" onClick={() => handleVerify(true)}>
                <span>I am 18 or older</span>
              </button>
              <button className="btn-outline" onClick={() => handleVerify(false)}>
                <span>I am under 18</span>
              </button>
            </div>
          </>
        ) : (
          <div className="age-verification__rejected">
            <h2 className="age-verification__title" style={{ color: 'var(--purple-light)' }}>Access Denied</h2>
            <p className="age-verification__text">
              We're sorry, but this site contains products that are not suitable for your age. You must be 18 or older to view our content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
