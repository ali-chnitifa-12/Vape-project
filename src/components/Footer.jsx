import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="footer__logo-icon">◈</span>
              <span className="footer__logo-text">VΛPΞ <span>NΞON</span></span>
            </div>
            <p className="footer__desc">
              Premium vaping products crafted for those who demand excellence. 
              Elevate your experience with cutting-edge technology and artisanal flavors.
            </p>
            <div className="footer__socials">
              {['Instagram', 'Twitter', 'Discord', 'YouTube'].map((s) => (
                <a key={s} href="#" className="footer__social" aria-label={s}>
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Shop</h4>
            <Link to="/shop" className="footer__link">All Products</Link>
            <Link to="/shop" className="footer__link">Devices</Link>
            <Link to="/shop" className="footer__link">E-Liquids</Link>
            <Link to="/shop" className="footer__link">Pod Systems</Link>
            <Link to="/shop" className="footer__link">Starter Kits</Link>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Company</h4>
            <Link to="/about" className="footer__link">About Us</Link>
            <Link to="/contact" className="footer__link">Contact</Link>
            <a href="#" className="footer__link">Careers</a>
            <a href="#" className="footer__link">Press</a>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Support</h4>
            <a href="#" className="footer__link">FAQs</a>
            <a href="#" className="footer__link">Shipping</a>
            <a href="#" className="footer__link">Returns</a>
            <a href="#" className="footer__link">Warranty</a>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Newsletter</h4>
            <p className="footer__newsletter-text">Get exclusive deals and new product drops.</p>
            <div className="footer__newsletter">
              <input type="email" placeholder="your@email.com" className="input-field" />
              <button className="btn-primary footer__newsletter-btn">
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 VΛPΞ NΞON. All rights reserved.</p>
          <div className="footer__bottom-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Age Verification</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
