import { useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import './ProductCard.css'

export default function ProductCard({ product, index }) {
  const cardRef = useRef(null)

  useEffect(() => {
    const card = cardRef.current
    const handleMove = (e) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const rotateX = (y - centerY) / 15
      const rotateY = (centerX - x) / 15
      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800,
      })
    }
    const handleLeave = () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    }
    card.addEventListener('mousemove', handleMove)
    card.addEventListener('mouseleave', handleLeave)
    return () => {
      card.removeEventListener('mousemove', handleMove)
      card.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  const badgeClass = product.badge === 'new' ? 'badge-new' : product.badge === 'hot' ? 'badge-hot' : 'badge-sale'

  const isLowStock = !product.outOfStock && product.stock > 0 && product.stock <= 5

  return (
    <Link to={`/product/${product.id}`} className="product-card glass-card" ref={cardRef}>
      <div className="product-card__glow" style={{ background: product.color }} />
      <div className="product-card__badge">
        {product.outOfStock ? (
          <span className="badge badge-sale" style={{ background: 'var(--pink)' }}>Out of Stock</span>
        ) : (
          <span className={`badge ${badgeClass}`}>{product.badge}</span>
        )}
      </div>
      <div className="product-card__image">
        <div className="product-card__image-bg" style={{ background: `radial-gradient(circle, ${product.color}22, transparent)` }} />
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card__info">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__bottom">
          <div className="product-card__price">
            <span className="product-card__price-current">${product.price}</span>
            {product.originalPrice && (
              <span className="product-card__price-original">${product.originalPrice}</span>
            )}
          </div>
          {product.outOfStock ? (
            <span className="product-card__stock-badge product-card__stock-out">Out of Stock</span>
          ) : isLowStock ? (
            <span className="product-card__stock-badge product-card__stock-low">
              🔥 Only {product.stock} left!
            </span>
          ) : (
            <span className="product-card__stock-badge product-card__stock-ok">
              ✓ In Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
