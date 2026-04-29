import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductCard from '../components/ProductCard'
import products, { categories } from '../data/products'
import './Shop.css'

gsap.registerPlugin(ScrollTrigger)

export default function Shop() {
  const [active, setActive] = useState('All')
  const [filtered, setFiltered] = useState(products)

  useEffect(() => {
    if (active === 'All') {
      setFiltered(products)
    } else {
      setFiltered(products.filter((p) => p.category === active))
    }
  }, [active])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.shop__hero > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, delay: 0.5 })
      gsap.fromTo('.shop__filter-btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, delay: 0.9 })
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    gsap.fromTo('.product-card', { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.5, ease: 'power2.out' })
  }, [filtered])

  return (
    <div className="page-wrapper">
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb orb-purple" style={{ top: '5%', right: '-10%' }} />
      <div className="orb orb-cyan" style={{ bottom: '20%', left: '-8%' }} />

      <section className="shop__hero">
        <div className="container">
          <span className="section-label">Our Collection</span>
          <h1 className="section-title">The <span className="gradient-text">Shop</span></h1>
          <p className="shop__subtitle">Browse our curated selection of premium vaping products.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="shop__filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`shop__filter-btn ${active === cat ? 'shop__filter-btn--active' : ''}`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="shop__count">
            Showing <strong>{filtered.length}</strong> product{filtered.length !== 1 && 's'}
          </div>

          <div className="shop__grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="shop__empty">
              <p>No products found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
