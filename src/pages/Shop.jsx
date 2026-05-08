import { useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ProductCard from '../components/ProductCard'
import { categories } from '../data/products'
import { applySavedOrder } from '../utils/productOrder'
import './Shop.css'

gsap.registerPlugin(ScrollTrigger)

export default function Shop() {
  const [active, setActive] = useState('All')
  const [search, setSearch] = useState('')
  const [priceRange, setPriceRange] = useState(500)
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const ordered = applySavedOrder(data)
        setProducts(ordered)
        setFiltered(ordered)
      })
      .catch(err => console.error("Error fetching", err))
  }, [])

  useEffect(() => {
    let result = products

    // Category filter
    if (active !== 'All') {
      result = result.filter((p) => p.category === active)
    }

    // Search filter
    if (search) {
      result = result.filter((p) => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Price filter
    result = result.filter((p) => p.price <= priceRange)

    setFiltered(result)
  }, [active, search, priceRange, products])

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
          <div className="shop__controls">
            <div className="shop__filters-group">
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
            </div>

            <div className="shop__search-group">
              <div className="shop__search">
                <span className="shop__search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="input-field"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="shop__price-filter">
                <div className="shop__price-label">
                  <span>Price Range</span>
                  <span>Up to ${priceRange}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="500" 
                  step="10"
                  className="shop__price-slider"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="shop__grid">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="shop__empty">
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
