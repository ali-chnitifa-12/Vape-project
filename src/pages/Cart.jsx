import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import products from '../data/products'
import './Cart.css'

export default function Cart() {
  const [cartItems, setCartItems] = useState([
    { ...products[0], qty: 1 },
    { ...products[1], qty: 2 },
  ])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cart__hero > *', { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, delay: 0.5 })
      gsap.fromTo('.cart__item', { opacity: 0, x: -30 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.5, delay: 0.8 })
      gsap.fromTo('.cart__summary', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.6, delay: 1 })
    })
    return () => ctx.revert()
  }, [])

  const updateQty = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    )
  }

  const removeItem = (id) => {
    const el = document.querySelector(`[data-cart-id="${id}"]`)
    gsap.to(el, {
      opacity: 0, x: -50, height: 0, padding: 0, margin: 0, duration: 0.4,
      onComplete: () => setCartItems((prev) => prev.filter((item) => item.id !== id)),
    })
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + shipping

  return (
    <div className="page-wrapper">
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb orb-purple" style={{ top: '10%', right: '-8%' }} />
      <div className="orb orb-cyan" style={{ bottom: '20%', left: '-5%' }} />

      <section className="cart__hero">
        <div className="container">
          <span className="section-label">Your Bag</span>
          <h1 className="section-title">Shopping <span className="gradient-text">Cart</span></h1>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          {cartItems.length === 0 ? (
            <div className="cart__empty">
              <div className="cart__empty-icon">🛒</div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven't added anything yet.</p>
              <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem' }}>
                <span>Browse Shop</span><span>→</span>
              </Link>
            </div>
          ) : (
            <div className="cart__grid">
              <div className="cart__items">
                <div className="cart__header">
                  <span>Product</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span>Total</span>
                  <span></span>
                </div>
                {cartItems.map((item) => (
                  <div key={item.id} className="cart__item glass-card" data-cart-id={item.id}>
                    <div className="cart__item-product">
                      <div className="cart__item-img">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div>
                        <h3 className="cart__item-name">{item.name}</h3>
                        <span className="cart__item-cat">{item.category}</span>
                      </div>
                    </div>
                    <span className="cart__item-price">${item.price}</span>
                    <div className="cart__item-qty">
                      <button onClick={() => updateQty(item.id, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)}>+</button>
                    </div>
                    <span className="cart__item-total">${(item.price * item.qty).toFixed(2)}</span>
                    <button className="cart__item-remove" onClick={() => removeItem(item.id)} aria-label="Remove">✕</button>
                  </div>
                ))}
              </div>

              <div className="cart__summary glass-card">
                <h3 className="cart__summary-title">Order Summary</h3>
                <div className="cart__summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart__summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span style={{ color: 'var(--cyan)' }}>FREE</span> : `$${shipping}`}</span>
                </div>
                {shipping === 0 && (
                  <div className="cart__free-shipping">
                    ✓ You qualify for free shipping!
                  </div>
                )}
                <div className="cart__summary-divider" />
                <div className="cart__summary-row cart__summary-total">
                  <span>Total</span>
                  <span className="gradient-text">${total.toFixed(2)}</span>
                </div>

                <div className="cart__promo">
                  <input type="text" className="input-field" placeholder="Promo code" />
                  <button className="btn-outline">Apply</button>
                </div>

                <button className="btn-primary cart__checkout">
                  <span>Proceed to Checkout</span><span>→</span>
                </button>
                <Link to="/shop" className="cart__continue">← Continue Shopping</Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
