import { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gsap } from 'gsap'
import './OrderConfirm.css'

export default function OrderConfirm() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const containerRef = useRef(null)
  const checkRef = useRef(null)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    fetch('/api/orders')
      .then(r => r.json())
      .then(orders => {
        const found = orders.find(o => String(o.id) === String(orderId))
        setOrder(found || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [orderId])

  useEffect(() => {
    if (loading) return
    const ctx = gsap.context(() => {
      // Animate checkmark circle draw
      gsap.fromTo('.oc__check-circle', { strokeDashoffset: 300 }, {
        strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', delay: 0.3
      })
      gsap.fromTo('.oc__check-tick', { strokeDashoffset: 100 }, {
        strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', delay: 0.9
      })
      // Content fade in
      gsap.fromTo('.oc__content > *', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.6, delay: 0.5
      })
      // Confetti particles
      gsap.utils.toArray('.oc__particle').forEach((p, i) => {
        gsap.fromTo(p, { opacity: 0, y: 0, x: 0, scale: 0 }, {
          opacity: 1, y: gsap.utils.random(-120, -60),
          x: gsap.utils.random(-80, 80),
          scale: gsap.utils.random(0.5, 1.2),
          rotation: gsap.utils.random(-180, 180),
          duration: gsap.utils.random(0.8, 1.4),
          ease: 'power2.out',
          delay: 0.8 + i * 0.05,
          onComplete: () => gsap.to(p, { opacity: 0, y: '+=40', duration: 0.4 })
        })
      })
    }, containerRef)
    return () => ctx.revert()
  }, [loading])

  if (loading) {
    return (
      <div className="page-wrapper" style={{ paddingTop: '14rem', textAlign: 'center' }}>
        <h2 className="gradient-text">Loading order...</h2>
      </div>
    )
  }

  return (
    <div className="page-wrapper oc-page" ref={containerRef}>
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb orb-purple" style={{ top: '10%', left: '5%' }} />
      <div className="orb orb-cyan"   style={{ bottom: '15%', right: '5%' }} />

      <div className="container oc__wrapper">
        {/* Confetti particles */}
        <div className="oc__particles">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className={`oc__particle oc__particle--${i % 4}`} />
          ))}
        </div>

        {/* Animated checkmark */}
        <div className="oc__icon">
          <svg viewBox="0 0 100 100" className="oc__svg">
            <circle
              cx="50" cy="50" r="45"
              fill="none" stroke="url(#oc-gradient)" strokeWidth="4"
              strokeDasharray="300" strokeDashoffset="300"
              className="oc__check-circle"
            />
            <polyline
              points="28,52 43,67 72,38"
              fill="none" stroke="url(#oc-gradient)" strokeWidth="5"
              strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="100" strokeDashoffset="100"
              className="oc__check-tick"
            />
            <defs>
              <linearGradient id="oc-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#00d4ff" />
                <stop offset="100%" stopColor="#7b2fff" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="oc__content">
          <span className="section-label" style={{ justifyContent: 'center' }}>Payment Confirmed</span>
          <h1 className="oc__title">Thank you{order?.customer?.name ? `, ${order.customer.name.split(' ')[0]}` : ''}! 🎉</h1>
          <p className="oc__subtitle">Your order has been placed successfully and is being prepared.</p>

          {order ? (
            <>
              {/* Order meta */}
              <div className="oc__meta glass-card">
                <div className="oc__meta-row">
                  <span className="oc__meta-label">Order ID</span>
                  <span className="oc__meta-val">#{order.id}</span>
                </div>
                <div className="oc__meta-row">
                  <span className="oc__meta-label">Date</span>
                  <span className="oc__meta-val">{new Date(order.date || order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="oc__meta-row">
                  <span className="oc__meta-label">Email</span>
                  <span className="oc__meta-val">{order.customer?.email}</span>
                </div>
                <div className="oc__meta-row">
                  <span className="oc__meta-label">Payment</span>
                  <span className="oc__meta-val oc__status">{order.status}</span>
                </div>
              </div>

              {/* Items */}
              <div className="oc__items glass-card">
                <h3 className="oc__items-title">Order Items</h3>
                {(order.items || []).map((item, i) => (
                  <div key={i} className="oc__item">
                    <span className="oc__item-qty">{item.qty}×</span>
                    <span className="oc__item-name">{item.name}</span>
                    <span className="oc__item-price">${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="oc__items-divider" />
                <div className="oc__item oc__item-total">
                  <span style={{ gridColumn: '1/3', fontWeight: 700 }}>Total Paid</span>
                  <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--grey)' }}>
              Order details unavailable — but your payment was recorded successfully.
            </div>
          )}

          <div className="oc__actions">
            <Link to="/shop" className="btn-primary">
              <span>Continue Shopping</span><span>→</span>
            </Link>
            <Link to="/" className="btn-outline">
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
