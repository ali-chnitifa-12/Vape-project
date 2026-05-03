import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import './Cart.css'

export default function Cart() {
  const [cartItems, setCartItems] = useState([])
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          // Initialize with some dummy items for demo purposes if cart is empty
          const demoItems = data.slice(0, 2).map((p, i) => ({ ...p, qty: i + 1 }));
          setCartItems(demoItems);
        }
      })
      .catch(err => console.error("Error loading products", err));
  }, [])

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
      onComplete: () => {
        setCartItems((prev) => prev.filter((item) => item.id !== id))
        toast.success('Item removed from cart')
      },
    })
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = subtotal > 50 ? 0 : 9.99
  const total = subtotal + shipping

  const handleCheckout = async () => {
    if (!customer.name || !customer.email) {
      toast.error('Please provide your name and email')
      return
    }

    const toastId = toast.loading('Redirecting to CMI Gateway...')

    try {
      // Simulate CMI Redirect/Response
      const res = await fetch('http://localhost:5000/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cartItems, 
          customer,
          total: total.toFixed(2)
        })
      });
      
      if (res.ok) {
        toast.success('Payment Successful via CMI!', { id: toastId })
        setCartItems([]);
        setCustomer({ name: '', email: '', phone: '' })
      } else {
        const err = await res.json();
        toast.error("Checkout failed: " + err.message, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Checkout error", { id: toastId });
    }
  };

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
                
                <div className="cart__customer-form" style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--grey)', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={customer.name}
                      onChange={(e) => setCustomer({...customer, name: e.target.value})}
                      placeholder="John Doe" 
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--grey)', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                    <input 
                      type="email" 
                      className="input-field" 
                      value={customer.email}
                      onChange={(e) => setCustomer({...customer, email: e.target.value})}
                      placeholder="john@example.com" 
                    />
                  </div>
                </div>

                <div className="cart__summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="cart__summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span style={{ color: 'var(--cyan)' }}>FREE</span> : `$${shipping}`}</span>
                </div>
                
                <div className="cart__summary-divider" />
                <div className="cart__summary-row cart__summary-total">
                  <span>Total</span>
                  <span className="gradient-text">${total.toFixed(2)}</span>
                </div>

                <div className="cart__cmi-notice" style={{ fontSize: '0.75rem', color: 'var(--grey)', margin: '1rem 0', textAlign: 'center' }}>
                  🔒 Secure checkout via <strong>CMI Interbank</strong>
                </div>

                <button className="btn-primary cart__checkout" onClick={handleCheckout}>
                  <span>Pay with CMI</span><span>→</span>
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
