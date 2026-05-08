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
  const [showPayModal, setShowPayModal] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState(null)
  const [cardData, setCardData]   = useState({ number: '', expiry: '', cvv: '', holder: '' })
  const [paying, setPaying]       = useState(false)

  // COD state
  const [showCodModal, setShowCodModal] = useState(false)
  const [codForm, setCodForm]     = useState({ name: '', phone: '', city: '', address: '' })

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
  const total     = subtotal + shipping

  // ── STEP 1: Validate and create PENDING order ──────────────────
  const handleCheckout = async () => {
    if (!customer.name || !customer.email) {
      toast.error('Please fill in your name and email first')
      return
    }
    const toastId = toast.loading('Preparing your order...')
    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems, customer, total: total.toFixed(2) })
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.message || 'Error', { id: toastId }); return }

      if (data.mode === 'simulation') {
        // Show our simulated CMI card modal
        toast.dismiss(toastId)
        setPendingOrderId(data.orderId)
        setShowPayModal(true)
      } else if (data.mode === 'cmi') {
        // Real CMI → redirect to their payment page
        toast.loading('Redirecting to CMI...', { id: toastId })
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = data.gatewayUrl
        Object.entries(data.params).forEach(([k, v]) => {
          const inp = document.createElement('input')
          inp.type = 'hidden'; inp.name = k; inp.value = v
          form.appendChild(inp)
        })
        document.body.appendChild(form)
        form.submit()
      }
    } catch (err) {
      toast.error('Connection error', { id: toastId })
    }
  }

  // ── STEP 2: Simulate CMI card payment ─────────────────────────
  const handleSimulatedPay = async (e) => {
    e.preventDefault()
    if (cardData.number.replace(/\s/g,'').length < 16) {
      toast.error('Please enter a valid 16-digit card number'); return
    }
    if (!cardData.expiry || !cardData.cvv || !cardData.holder) {
      toast.error('Please fill in all card details'); return
    }

    setPaying(true)
    const toastId = toast.loading('Processing payment via CMI...')

    // Simulate 2s processing delay
    await new Promise(r => setTimeout(r, 2000))

    // Mark the order as paid in DB
    try {
      await fetch(`/api/payment/simulate-confirm/${pendingOrderId}`, { method: 'POST' })
    } catch (_) {}

    toast.success('✅ Payment successful! Order confirmed.', { id: toastId })
    clearCart()
    setCartItems([])
    setShowPayModal(false)
    setPaying(false)
    setCustomer({ name: '', email: '' })
    setCardData({ number: '', expiry: '', cvv: '', holder: '' })

    // Redirect to order confirmation page
    navigate(`/order/${pendingOrderId}`)
  }

  // Format card number with spaces: 1234 5678 9012 3456
  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val) =>
    val.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2')

  // ── COD: open WhatsApp with order info ────────────────────────
  const WHATSAPP_NUMBER = '212691522871'

  const handleCodSubmit = (e) => {
    e.preventDefault()
    const itemLines = cartItems
      .map(i => `  • ${i.name} x${i.qty} — ${(i.price * i.qty).toFixed(2)} MAD`)
      .join('%0A')
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
      `🚚 *Livraison:* ${shipping === 0 ? 'GRATUITE' : shipping + ' MAD'}%0A` +
      `✅ *TOTAL: ${total.toFixed(2)} MAD*`

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    setShowCodModal(false)
    setCodForm({ name: '', phone: '', city: '', address: '' })
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
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
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

                <div style={{ fontSize: '0.75rem', color: 'var(--grey)', margin: '1rem 0', textAlign: 'center' }}>
                  🔒 Secure checkout via <strong>CMI Interbank</strong>
                </div>

                {/* Payment method selector */}
                <div className="cart__pay-methods">
                  <button className="btn-primary cart__checkout" onClick={handleCheckout}>
                    <span>💳 Pay with CMI</span><span>→</span>
                  </button>
                  <div className="cart__pay-divider"><span>or</span></div>
                  <button
                    className="cart__cod-btn"
                    onClick={() => {
                      if (!customer.name || !customer.email) {
                        toast.error('Please fill in your name and email first')
                        return
                      }
                      setShowCodModal(true)
                    }}
                  >
                    <span className="cart__cod-icon">🛵</span>
                    <div>
                      <span className="cart__cod-title">Cash on Delivery</span>
                      <span className="cart__cod-sub">Payer à la livraison</span>
                    </div>
                    <span>→</span>
                  </button>
                </div>
                <Link to="/shop" className="cart__continue">← Continue Shopping</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CMI Simulated Payment Modal ─────────────────────────── */}
      {showPayModal && (
        <div className="cmi-modal-overlay" onClick={() => !paying && setShowPayModal(false)}>
          <div className="cmi-modal glass-card" onClick={e => e.stopPropagation()}>
            {/* CMI Header */}
            <div className="cmi-modal__header">
              <div className="cmi-modal__logo">
                <span className="cmi-modal__logo-text">CMI</span>
                <span className="cmi-modal__logo-sub">Centre Monétique Interbancaire</span>
              </div>
              <div className="cmi-modal__secure">🔒 Paiement Sécurisé</div>
            </div>

            <div className="cmi-modal__amount">
              Montant à payer: <strong className="gradient-text">${total.toFixed(2)}</strong>
            </div>

            {/* Card visual preview */}
            <div className="cmi-card-preview">
              <div className="cmi-card-preview__chip">▬▬</div>
              <div className="cmi-card-preview__number">
                {cardData.number || '•••• •••• •••• ••••'}
              </div>
              <div className="cmi-card-preview__bottom">
                <div>
                  <div className="cmi-card-preview__label">Titulaire</div>
                  <div>{cardData.holder || 'VOTRE NOM'}</div>
                </div>
                <div>
                  <div className="cmi-card-preview__label">Expire</div>
                  <div>{cardData.expiry || 'MM/AA'}</div>
                </div>
              </div>
            </div>

            <form className="cmi-modal__form" onSubmit={handleSimulatedPay}>
              <div className="form-group">
                <label>Numéro de carte</label>
                <input
                  className="input-field"
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  value={cardData.number}
                  onChange={e => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Titulaire de la carte</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="MOHAMMED ALAMI"
                  value={cardData.holder}
                  onChange={e => setCardData({...cardData, holder: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              <div className="cmi-modal__row">
                <div className="form-group">
                  <label>Date d'expiration</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cardData.expiry}
                    onChange={e => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    className="input-field"
                    type="password"
                    placeholder="•••"
                    maxLength={3}
                    value={cardData.cvv}
                    onChange={e => setCardData({...cardData, cvv: e.target.value.replace(/\D/g,'').slice(0,3)})}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={paying}>
                {paying ? <span>Traitement en cours...</span> : <><span>Confirmer le Paiement</span><span>→</span></>}
              </button>
              <button type="button" className="cart__continue" style={{ marginTop: '0.5rem', textAlign:'center', display:'block', width:'100%' }}
                onClick={() => !paying && setShowPayModal(false)}>
                Annuler
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: 'var(--grey)' }}>
              🛡️ Vos données sont chiffrées par SSL 256-bit
            </div>
          </div>
        </div>
      )}

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
