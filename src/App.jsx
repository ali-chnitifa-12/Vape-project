import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Product from './pages/Product'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import AgeVerification from './components/AgeVerification'
import SmokeAnimation from './components/SmokeAnimation'


gsap.registerPlugin(ScrollTrigger)

function PageTransition({ children }) {
  const location = useLocation()
  const overlayRef = useRef(null)

  useEffect(() => {
    const overlay = overlayRef.current
    gsap.fromTo(
      overlay,
      { scaleY: 1, transformOrigin: 'top' },
      {
        scaleY: 0,
        transformOrigin: 'top',
        duration: 0.7,
        ease: 'power4.inOut',
      }
    )
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <>
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'linear-gradient(135deg, #d1111d, #0097b2)',
          zIndex: 9999,
          transformOrigin: 'top',
          pointerEvents: 'none',
        }}
      />
      {children}
    </>
  )
}

export default function App() {
  const [isAgeVerified, setIsAgeVerified] = useState(() => {
    return localStorage.getItem('klawdz_age_verified') === 'true';
  });
  const [showSmoke, setShowSmoke] = useState(() => {
    return localStorage.getItem('klawdz_age_verified') === 'true';
  });

  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    setShowSmoke(true);
  };

  return (
    <BrowserRouter>
      <CustomCursor />
      
      {!isAgeVerified && <AgeVerification onVerified={handleAgeVerified} />}
      {showSmoke && <SmokeAnimation onComplete={() => setShowSmoke(false)} />}
      
      <div style={{ opacity: isAgeVerified ? 1 : 0, pointerEvents: isAgeVerified ? 'auto' : 'none' }}>
        <PageTransition>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<Product />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
          <Footer />
        </PageTransition>
      </div>
    </BrowserRouter>
  )
}
