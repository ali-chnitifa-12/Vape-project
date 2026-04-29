import { useEffect, useState } from 'react'
import { gsap } from 'gsap'
import './Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact__hero > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, delay: 0.5 })
      gsap.fromTo('.contact__form-group', { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, delay: 0.8 })
      gsap.fromTo('.contact__info-card', { opacity: 0, x: 30 }, { opacity: 1, x: 0, stagger: 0.12, duration: 0.5, delay: 0.9 })
    })
    return () => ctx.revert()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    gsap.to('.contact__form', {
      scale: 0.98, duration: 0.1, yoyo: true, repeat: 1,
      onComplete: () => setSent(true),
    })
  }

  return (
    <div className="page-wrapper">
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb orb-purple" style={{ top: '10%', right: '-8%' }} />
      <div className="orb orb-cyan" style={{ bottom: '10%', left: '-5%' }} />

      <section className="contact__hero">
        <div className="container">
          <span className="section-label">Get In Touch</span>
          <h1 className="section-title">Contact <span className="gradient-text">Us</span></h1>
          <p className="contact__subtitle">Have a question or feedback? We'd love to hear from you.</p>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="contact__grid">
            <div className="contact__form-wrapper">
              {sent ? (
                <div className="contact__success glass-card">
                  <div className="contact__success-icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                  <button className="btn-outline" onClick={() => setSent(false)}><span>Send Another</span></button>
                </div>
              ) : (
                <form className="contact__form glass-card" onSubmit={handleSubmit}>
                  <div className="contact__form-row">
                    <div className="contact__form-group">
                      <label className="contact__label">Name</label>
                      <input type="text" className="input-field" placeholder="Your name" required
                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div className="contact__form-group">
                      <label className="contact__label">Email</label>
                      <input type="email" className="input-field" placeholder="your@email.com" required
                        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="contact__form-group">
                    <label className="contact__label">Subject</label>
                    <input type="text" className="input-field" placeholder="What's this about?" required
                      value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                  </div>
                  <div className="contact__form-group">
                    <label className="contact__label">Message</label>
                    <textarea className="input-field contact__textarea" placeholder="Tell us more..." rows="6" required
                      value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary contact__submit">
                    <span>Send Message</span><span>→</span>
                  </button>
                </form>
              )}
            </div>

            <div className="contact__sidebar">
              {[
                { icon: '📍', title: 'Visit Us', lines: ['123 Mounji Boulevard', 'Los Angeles, CA 90028'] },
                { icon: '✉️', title: 'Email Us', lines: ['hello@mounjivape.com', 'support@mounjivape.com'] },
                { icon: '📞', title: 'Call Us', lines: ['+1 (555) 123-4567', 'Mon-Fri, 9am-6pm PST'] },
                { icon: '💬', title: 'Live Chat', lines: ['Available 24/7', 'Average reply: 2 min'] },
              ].map((info, i) => (
                <div key={i} className="contact__info-card glass-card">
                  <div className="contact__info-icon">{info.icon}</div>
                  <div>
                    <h3 className="contact__info-title">{info.title}</h3>
                    {info.lines.map((l, j) => (
                      <p key={j} className="contact__info-line">{l}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
