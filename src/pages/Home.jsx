import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductCard from '../components/ProductCard'
import VapeModel from '../components/VapeModel'

import { applySavedOrder } from '../utils/productOrder'
import './Home.css'

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const [products, setProducts] = useState([])
  const heroRef = useRef(null)
  const featuredRef = useRef(null)
  const statsRef = useRef(null)
  const ctaRef = useRef(null)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products', err))
  }, [])

  useEffect(() => {
    // Suppress GSAP "target not found" warnings for optional elements
    gsap.config({ nullTargetWarn: false })

    const ctx = gsap.context(() => {
      // Hero animations
      const tl = gsap.timeline({ delay: 0.8 })
      tl.fromTo('.hero__label', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo('.hero__title span', { opacity: 0, y: 80, rotateX: 40 }, { opacity: 1, y: 0, rotateX: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' }, '-=0.3')
        .fromTo('.hero__desc',    { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
        .fromTo('.hero__actions', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
        .fromTo('.hero__visual',  { opacity: 0, scale: 0.8, rotateY: -15 }, { opacity: 1, scale: 1, rotateY: 0, duration: 1, ease: 'power3.out' }, '-=0.5')
        .fromTo('.hero__stat',    { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }, '-=0.4')

      // Sections scroll animations
      gsap.fromTo('.featured__header > *', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.15, duration: 0.7,
        scrollTrigger: { trigger: '.featured__header', start: 'top 80%' },
      })
      gsap.fromTo('.stats__item', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.6,
        scrollTrigger: { trigger: '.stats', start: 'top 80%' },
      })
      gsap.fromTo('.feature-card', { opacity: 0, y: 50, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.6,
        scrollTrigger: { trigger: '.features__grid', start: 'top 85%' },
      })
      gsap.fromTo('.cta__inner > *', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, stagger: 0.12, duration: 0.6,
        scrollTrigger: { trigger: '.cta', start: 'top 80%' },
      })
    })
    return () => ctx.revert()
  }, [])

  // Animate product cards only AFTER products have loaded into the DOM
  useEffect(() => {
    if (products.length === 0) return
    gsap.fromTo('.product-card', { opacity: 0, y: 60 }, {
      opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: '.featured__grid', start: 'top 85%' },
    })
  }, [products])

  const featuredProducts = applySavedOrder(products).slice(0, 4)

  return (
    <div className="page-wrapper">
      <div className="noise-overlay" />

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div className="grid-bg" />
        <div className="orb orb-purple" style={{ top: '-10%', right: '-5%' }} />
        <div className="orb orb-cyan" style={{ bottom: '10%', left: '-5%' }} />
        <div className="orb orb-pink" style={{ bottom: '-20%', right: '30%' }} />

        <div className="container hero__inner">
          <div className="hero__content">
            <span className="hero__label section-label">Premium Vaping Experience</span>
            <h1 className="hero__title">
              <span>Elevate</span>
              <span>Your</span>
              <span className="gradient-text">Cloud Game</span>
            </h1>
            <p className="hero__desc">
              Discover next-gen vaping devices and artisanal e-liquids. Engineered for perfection, designed for you.
            </p>
            <div className="hero__actions">
              <Link to="/shop" className="btn-primary">
                <span>Explore Shop</span>
                <span>→</span>
              </Link>
              <Link to="/about" className="btn-outline">
                <span>Our Story</span>
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__visual-ring" />
            <div className="hero__visual-ring hero__visual-ring--2" />
            <div className="hero__visual-glow" />
            <div className="hero__visual-device">
              <VapeModel />
            </div>
          </div>
        </div>

        <div className="container">
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-number">50K+</span>
              <span className="hero__stat-label">Happy Customers</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-number">200+</span>
              <span className="hero__stat-label">Products</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-number">4.9★</span>
              <span className="hero__stat-label">Average Rating</span>
            </div>
            <div className="hero__stat">
              <span className="hero__stat-number">24h</span>
              <span className="hero__stat-label">Fast Shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section featured" ref={featuredRef}>
        <div className="container">
          <div className="featured__header">
            <div>
              <span className="section-label">Curated Selection</span>
              <h2 className="section-title">Featured <span className="gradient-text">Drops</span></h2>
            </div>
            <Link to="/shop" className="btn-outline"><span>View All</span><span>→</span></Link>
          </div>
          <div className="featured__grid">
            {featuredProducts.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section features">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="section-label" style={{ justifyContent: 'center' }}>Why Choose Us</span>
            <h2 className="section-title">The <span className="gradient-text">Klawdz</span> Difference</h2>
          </div>
          <div className="features__grid">
            {[
              { icon: '◈', title: 'Premium Quality', desc: 'Every product is rigorously tested for safety, flavor, and performance.', color: 'var(--purple)' },
              { icon: '⚡', title: 'Fast Shipping', desc: 'Free next-day delivery on orders over $50. Tracked & insured.', color: 'var(--cyan)' },
              { icon: '🛡️', title: 'Warranty', desc: '12-month warranty on all devices. Hassle-free replacements.', color: 'var(--pink)' },
              { icon: '✦', title: 'Expert Support', desc: 'Our vaping specialists are available 24/7 to help you choose.', color: 'var(--yellow)' },
            ].map((f, i) => (
              <div key={i} className="feature-card glass-card">
                <div className="feature-card__icon" style={{ color: f.color, textShadow: `0 0 20px ${f.color}` }}>{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section-sm stats" ref={statsRef}>
        <div className="container">
          <div className="stats__inner glass-card">
            {[
              { val: '10M+', label: 'Puffs Delivered' },
              { val: '99%', label: 'Satisfaction Rate' },
              { val: '35+', label: 'Flavor Profiles' },
              { val: '#1', label: 'Rated Online Store' },
            ].map((s, i) => (
              <div key={i} className="stats__item">
                <span className="stats__val gradient-text">{s.val}</span>
                <span className="stats__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta" ref={ctaRef}>
        <div className="container">
          <div className="cta__inner">
            <span className="section-label">Limited Time Offer</span>
            <h2 className="section-title">Get <span className="gradient-text">20% Off</span> Your First Order</h2>
            <p className="cta__desc">Use code <strong>KLAWDZ20</strong> at checkout. New customers only.</p>
            <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem' }}>
              <span>Shop Now</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
