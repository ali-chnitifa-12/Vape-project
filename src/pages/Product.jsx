import { useParams, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import ProductCard from '../components/ProductCard'
import { addToCart } from '../utils/cart.js'
import './Product.css'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [productReviews, setProductReviews] = useState([])
  const [reviewData, setReviewData] = useState({ name: '', rating: 5, comment: '' })
  const pageRef = useRef(null)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${id}`)
      if (!res.ok) return;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json()
        setProductReviews(data)
      }
    } catch (err) {
      console.error("Error fetching reviews", err)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        const p = data.find((item) => item.id === parseInt(id))
        setProduct(p || null)
        setLoading(false)
        fetchReviews()
      })
      .catch(err => {
        console.error("Error fetching", err)
        setLoading(false)
      })
  }, [id])

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...reviewData, productId: id })
      })
      if (res.ok) {
        toast.success('Review submitted!')
        setReviewData({ name: '', rating: 5, comment: '' })
        fetchReviews()
      }
    } catch (err) {
      toast.error('Error submitting review')
    }
  }

  useEffect(() => {
    if (loading || !product) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.product-detail__image', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.8, delay: 0.5, ease: 'power3.out' })
      gsap.fromTo('.product-detail__info > *', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.6, delay: 0.7 })
      gsap.fromTo('.product-detail__spec', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.08, duration: 0.4, delay: 1 })
    }, pageRef)
    return () => ctx.revert()
  }, [id, loading, product])

  const handleAddToCart = () => {
    addToCart(product, qty)
    toast.success(`${qty}× ${product.name} added to cart!`, {
      icon: '🛒',
      style: { borderRadius: '10px', background: '#1a1a1a', color: '#fff' },
    })
    setQty(1)
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ paddingTop: '12rem', textAlign: 'center' }}>
        <h2 className="gradient-text">Loading...</h2>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page-wrapper" style={{ paddingTop: '12rem', textAlign: 'center' }}>
        <div className="container">
          <h1 className="section-title">Product Not Found</h1>
          <Link to="/shop" className="btn-primary" style={{ marginTop: '2rem' }}><span>Back to Shop</span></Link>
        </div>
      </div>
    )
  }

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4)
  const badgeClass = product.badge === 'new' ? 'badge-new' : product.badge === 'hot' ? 'badge-hot' : 'badge-sale'

  return (
    <div className="page-wrapper" ref={pageRef}>
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb orb-purple" style={{ top: '0', left: '-10%' }} />
      <div className="orb orb-cyan" style={{ bottom: '30%', right: '-5%' }} />

      <section className="product-detail">
        <div className="container">
          <div className="product-detail__breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <Link to="/shop">Shop</Link>
            <span>/</span>
            <span className="product-detail__breadcrumb-current">{product.name}</span>
          </div>

          <div className="product-detail__grid">
            <div className="product-detail__image glass-card">
              <div className="product-detail__image-glow" style={{ background: product.color }} />
              <img src={product.image} alt={product.name} />
            </div>

            <div className="product-detail__info">
              <span className={`badge ${badgeClass}`}>{product.badge}</span>
              <span className="product-detail__category">{product.category}</span>
              <h1 className="product-detail__name">{product.name}</h1>
              <div className="product-detail__rating">
                <div className="stars">{'★'.repeat(product.rating)}{'☆'.repeat(5 - product.rating)}</div>
                <span>({product.reviews} reviews)</span>
              </div>
              <p className="product-detail__desc">{product.description}</p>
              <div className="product-detail__price-row">
                <span className="product-detail__price">${product.price}</span>
                {product.originalPrice && <span className="product-detail__original">${product.originalPrice}</span>}
                {product.originalPrice && (
                  <span className="badge badge-sale">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {product.flavors.length > 0 && (
                <div className="product-detail__flavors">
                  <span className="product-detail__label">Flavor Notes</span>
                  <div className="product-detail__flavor-tags">
                    {product.flavors.map((f) => (
                      <span key={f} className="product-detail__flavor-tag">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="product-detail__specs">
                <span className="product-detail__label">Specifications</span>
                <div className="product-detail__specs-grid">
                  {product.specs.map((s) => (
                    <div key={s} className="product-detail__spec glass-card">{s}</div>
                  ))}
                </div>
              </div>

              <div className="product-detail__actions">
                <div className="product-detail__qty">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(qty + 1)}>+</button>
                </div>
                <button 
                  className="btn-primary product-detail__add" 
                  disabled={product.outOfStock}
                  onClick={handleAddToCart}
                >
                  <span>{product.outOfStock ? 'Out of Stock' : `Add to Cart — $${(product.price * qty).toFixed(2)}`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product-reviews section-sm">
        <div className="container">
          <div className="reviews__grid">
            <div className="reviews__list">
              <h2 className="section-title-sm">Customer <span className="gradient-text">Reviews</span></h2>
              <div className="reviews__items">
                {productReviews.length === 0 ? (
                  <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                ) : (
                  productReviews.map(review => (
                    <div key={review.id} className="review-item glass-card">
                      <div className="review-header">
                        <span className="review-name">{review.name}</span>
                        <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                      <div className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="reviews__form-container">
              <div className="glass-card reviews__form">
                <h3>Write a Review</h3>
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      required 
                      className="input-field"
                      value={reviewData.name}
                      onChange={e => setReviewData({...reviewData, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="rating-input">
                      {[1, 2, 3, 4, 5].map(num => (
                        <button 
                          key={num}
                          type="button"
                          className={reviewData.rating >= num ? 'star-active' : ''}
                          onClick={() => setReviewData({...reviewData, rating: num})}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Comment</label>
                    <textarea 
                      required 
                      className="input-field" 
                      rows="4"
                      value={reviewData.comment}
                      onChange={e => setReviewData({...reviewData, comment: e.target.value})}
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Submit Review
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <span className="section-label">You Might Also Like</span>
            <h2 className="section-title" style={{ marginBottom: '2rem' }}>Related <span className="gradient-text">Products</span></h2>
            <div className="featured__grid">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
