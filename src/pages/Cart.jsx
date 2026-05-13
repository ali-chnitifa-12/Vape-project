import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import toast from 'react-hot-toast'
import { getCart, saveCart, removeFromCart, updateCartQty, clearCart } from '../utils/cart.js'
import './Cart.css'

export default function Cart() {
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [customer, setCustomer]   = useState({ name: '', email: '' })
  const [paying, setPaying]       = useState(false)

  // COD state
  const [showCodModal, setShowCodModal] = useState(false)
  const [codForm, setCodForm]     = useState({ name: '', phone: '', city: '', zip: '', address: '' })

  // Promo code state
  const [promoInput,   setPromoInput]   = useState('')
  const [promo,        setPromo]        = useState(null)  // { code, type, value, label }
  const [promoLoading, setPromoLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    setCartItems(getCart())
    const onUpdate = () => setCartItems(getCart())
    window.addEventListener('cart-updated', onUpdate)
    return () => window.removeEventListener('cart-updated', onUpdate)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cart__hero > *',  { opacity: 0, y: 40 },  { opacity: 1, y: 0,  stagger: 0.15, duration: 0.7, delay: 0.5 })
      gsap.fromTo('.cart__item',      { opacity: 0, x: -30 }, { opacity: 1, x: 0,  stagger: 0.1,  duration: 0.5, delay: 0.8 })
      gsap.fromTo('.cart__summary',   { opacity: 0, x: 30 },  { opacity: 1, x: 0,  duration: 0.6, delay: 1 })
    })
    return () => ctx.revert()
  }, [])

  const handleUpdateQty = (id, delta) => {
    const updated = updateCartQty(id, (cartItems.find(i => i.id === id)?.qty || 1) + delta)
    setCartItems(updated)
  }

  const handleRemove = (id) => {
    const el = document.querySelector(`[data-cart-id="${id}"]`)
    if (el) {
      gsap.to(el, {
        opacity: 0, x: -50, height: 0, padding: 0, margin: 0, duration: 0.4,
        onComplete: () => {
          const updated = removeFromCart(id)
          setCartItems(updated)
          toast.success('Item removed')
        }
      })
    } else {
      const updated = removeFromCart(id)
      setCartItems(updated)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping  = subtotal > 50 ? 0 : 9.99
  const discount  = promo
    ? promo.type === 'percent'
      ? subtotal * (promo.value / 100)
      : Math.min(promo.value, subtotal)
    : 0
  const total = subtotal + shipping - discount



  // ── Promo code ────────────────────────────────────────────
  const handlePromoApply = async () => {
    const code = promoInput.trim().toUpperCase()
    if (!code) return
    setPromoLoading(true)
    try {
      const res  = await fetch(`/api/promo/${code}`)
      const data = await res.json()
      if (!res.ok || !data.valid) {
        toast.error(data.message || 'Code invalide')
        setPromo(null)
      } else {
        setPromo(data)
        toast.success(`✅ Code appliqué : ${data.label}`)
      }
    } catch {
      toast.error('Erreur réseau')
    } finally {
      setPromoLoading(false)
    }
  }

  // ── COD: log to backend then open WhatsApp ────────────────
  const WHATSAPP_NUMBER = '212691522871'

  const handleCodSubmit = async (e) => {
    e.preventDefault()

    // 1. Log the order to DB
    try {
      await fetch('/api/orders/cod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          customer,
          promoCode: promo?.code,
          codInfo: codForm,
        })
      })
    } catch (_) { /* non-blocking — WhatsApp still opens */ }

    // 2. Build WhatsApp message
    const itemLines = cartItems
      .map(i => `  • ${i.name} x${i.qty} — ${(i.price * i.qty).toFixed(2)} MAD`)
      .join('%0A')
    const discountLine = promo ? `%0A🏷️ *Promo (${promo.code}):* -${discount.toFixed(2)} MAD` : ''
    const msg =
      `🛵 *Nouvelle commande COD*%0A` +
      `───────────────────%0A` +
      `👤 *Nom:* ${codForm.name}%0A` +
      `📞 *Téléphone:* ${codForm.phone}%0A` +
      `🏙️ *Ville:* ${codForm.city}%0A` +
      `📍 *Adresse:* ${codForm.address}%0A` +
      `───────────────────%0A` +
      `🛒 *Articles:*%0A${itemLines}%0A` +
      `───────────────────%0A` +
      `💰 *Sous-total:* ${subtotal.toFixed(2)} MAD%0A` +
      `🚚 *Livraison:* ${shipping === 0 ? 'GRATUITE' : shipping + ' MAD'}` +
      discountLine + `%0A` +
      `✅ *TOTAL: ${total.toFixed(2)} MAD*`

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    setShowCodModal(false)
    setCodForm({ name: '', phone: '', city: '', zip: '', address: '' })
  }

  return (
    <div className="page-wrapper">
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb orb-purple" style={{ top: '10%', right: '-8%' }} />
      <div className="orb orb-cyan"   style={{ bottom: '20%', left: '-5%' }} />

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
              <p>Add some products from the shop to get started.</p>
              <Link to="/shop" className="btn-primary" style={{ marginTop: '1rem' }}>
                <span>Browse Shop</span><span>→</span>
              </Link>
            </div>
          ) : (
            <div className="cart__grid">
              {/* Items */}
              <div className="cart__items">
                <div className="cart__header">
                  <span>Product</span><span>Price</span>
                  <span>Quantity</span><span>Total</span><span></span>
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
                    <span className="cart__item-price">${parseFloat(item.price).toFixed(2)}</span>
                    <div className="cart__item-qty">
                      <button onClick={() => handleUpdateQty(item.id, -1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => handleUpdateQty(item.id, 1)}>+</button>
                    </div>
                    <span className="cart__item-total">${(item.price * item.qty).toFixed(2)}</span>
                    <button className="cart__item-remove" onClick={() => handleRemove(item.id)} aria-label="Remove">✕</button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="cart__summary glass-card">
                <h3 className="cart__summary-title">Order Summary</h3>

                {/* Customer info */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--grey)', display: 'block', marginBottom: '0.4rem' }}>Full Name</label>
                    <input type="text" className="input-field" value={customer.name}
                      onChange={e => setCustomer({...customer, name: e.target.value})} placeholder="Mohammed Alami" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--grey)', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                    <input type="email" className="input-field" value={customer.email}
                      onChange={e => setCustomer({...customer, email: e.target.value})} placeholder="mohammed@gmail.com" />
                  </div>
                </div>

                <div className="cart__summary-row">
                  <span>Subtotal</span><span>{subtotal.toFixed(2)} MAD</span>
                </div>
                <div className="cart__summary-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span style={{ color: 'var(--cyan)' }}>FREE</span> : `${shipping} MAD`}</span>
                </div>

                {/* Promo code input */}
                <div className="cart__promo">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Code promo..."
                    value={promoInput}
                    onChange={e => { setPromoInput(e.target.value); if (promo) setPromo(null) }}
                    onKeyDown={e => e.key === 'Enter' && handlePromoApply()}
                  />
                  <button className="btn-outline cart__promo-btn" onClick={handlePromoApply} disabled={promoLoading}>
                    <span>{promoLoading ? '...' : 'Apply'}</span>
                  </button>
                </div>

                {promo && (
                  <div className="cart__promo-badge">
                    <span>🏷️ {promo.code} — {promo.label}</span>
                    <button onClick={() => { setPromo(null); setPromoInput('') }}>✕</button>
                  </div>
                )}

                {promo && (
                  <div className="cart__summary-row" style={{ color: '#00e676' }}>
                    <span>Discount</span><span>-{discount.toFixed(2)} MAD</span>
                  </div>
                )}

                <div className="cart__summary-divider" />
                <div className="cart__summary-row cart__summary-total">
                  <span>Total</span>
                  <span className="gradient-text">{total.toFixed(2)} MAD</span>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--grey)', margin: '1rem 0', textAlign: 'center' }}>
                  🔒 Secure checkout — <strong>Cash on Delivery</strong>
                </div>

                <div className="cart__terms-checkbox" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--grey)' }}>
                  <input 
                    type="checkbox" 
                    id="terms-agree" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    style={{ marginTop: '0.2rem', accentColor: 'var(--cyan)' }}
                  />
                  <label htmlFor="terms-agree">
                    J'ai lu et j'accepte les <Link to="/terms" target="_blank" style={{ color: 'var(--cyan)', textDecoration: 'underline' }}>conditions générales de vente</Link>.
                  </label>
                </div>

                {/* Payment method selector */}
                <div className="cart__pay-methods">
                  <button
                    className="btn-primary cart__checkout"
                    onClick={() => {
                      if (!agreedToTerms) {
                        toast.error('Veuillez accepter les conditions générales de vente.')
                        return
                      }
                      if (!customer.name || !customer.email) {
                        toast.error('Please fill in your name and email first')
                        return
                      }
                      setShowCodModal(true)
                    }}
                  >
                    <span>🛵 Checkout (COD)</span><span>→</span>
                  </button>
                </div>
                <Link to="/shop" className="cart__continue">← Continue Shopping</Link>
              </div>
            </div>
          )}
        </div>
      </section>



      {/* ── COD WhatsApp Modal ───────────────────────────────── */}
      {showCodModal && (
        <div className="cmi-modal-overlay" onClick={() => setShowCodModal(false)}>
          <div className="cmi-modal cod-modal glass-card" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="cmi-modal__header">
              <div className="cmi-modal__logo">
                <span className="cod-modal__title">🛵 Cash on Delivery</span>
                <span className="cmi-modal__logo-sub">Remplissez vos informations de livraison</span>
              </div>
              <div className="cmi-modal__secure">📦 COD</div>
            </div>

            <div className="cmi-modal__amount">
              Montant total à payer à la livraison:
              <strong className="gradient-text">{total.toFixed(2)} MAD</strong>
            </div>

            <form className="cmi-modal__form" onSubmit={handleCodSubmit}>
              <div className="form-group">
                <label>Nom complet</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Mohammed Alami"
                  value={codForm.name}
                  onChange={e => setCodForm({...codForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Numéro de téléphone</label>
                <input
                  className="input-field"
                  type="tel"
                  placeholder="+212 6XX XXX XXX"
                  value={codForm.phone}
                  onChange={e => setCodForm({...codForm, phone: e.target.value})}
                  required
                />
              </div>
              <div className="cmi-modal__row">
                <div className="form-group">
                  <label>Ville</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Casablanca"
                    value={codForm.city}
                    onChange={e => setCodForm({...codForm, city: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Code postal</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="20000"
                    value={codForm.zip}
                    onChange={e => setCodForm({...codForm, zip: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse complète</label>
                <textarea
                  className="input-field cod-modal__textarea"
                  placeholder="N° rue, quartier, immeuble..."
                  rows="3"
                  value={codForm.address}
                  onChange={e => setCodForm({...codForm, address: e.target.value})}
                  required
                />
              </div>

              <div className="cod-modal__notice">
                <span>📲</span>
                <span>En confirmant, vous serez redirigé vers WhatsApp pour finaliser votre commande.</span>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
                <span>Confirmer via WhatsApp</span><span>→</span>
              </button>
              <button type="button" className="cart__continue" style={{ marginTop: '0.5rem', textAlign:'center', display:'block', width:'100%' }}
                onClick={() => setShowCodModal(false)}>
                Annuler
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--grey)' }}>
              🛡️ Vos données sont transmises uniquement via WhatsApp
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
