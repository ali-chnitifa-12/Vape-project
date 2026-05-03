import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about__hero > *', { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, delay: 0.5 })

      gsap.fromTo('.about__story-content > *', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.12, duration: 0.6,
        scrollTrigger: { trigger: '.about__story', start: 'top 75%' },
      })

      gsap.fromTo('.about__value', { opacity: 0, y: 50, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.6,
        scrollTrigger: { trigger: '.about__values-grid', start: 'top 80%' },
      })

      gsap.fromTo('.about__team-member', { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, stagger: 0.1, duration: 0.5,
        scrollTrigger: { trigger: '.about__team-grid', start: 'top 80%' },
      })

      gsap.fromTo('.about__timeline-item', { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, stagger: 0.15, duration: 0.5,
        scrollTrigger: { trigger: '.about__timeline', start: 'top 80%' },
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="page-wrapper">
      <div className="noise-overlay" />
      <div className="grid-bg" />
      <div className="orb orb-purple" style={{ top: '5%', left: '-10%' }} />
      <div className="orb orb-pink" style={{ bottom: '20%', right: '-5%' }} />

      {/* Hero */}
      <section className="about__hero">
        <div className="container">
          <span className="section-label">Our Story</span>
          <h1 className="section-title">We Are <span className="gradient-text">Klawdz</span></h1>
          <p className="about__hero-desc">
            Born from a passion for innovation and a commitment to quality, we're redefining the vaping experience for a new generation.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section about__story">
        <div className="container">
          <div className="about__story-grid">
            <div className="about__story-visual">
              <div className="about__story-shape" />
              <div className="about__story-shape about__story-shape--2" />
              <div className="about__story-counter">
                <span className="about__story-counter-num gradient-text">2019</span>
                <span className="about__story-counter-label">Founded</span>
              </div>
            </div>
            <div className="about__story-content">
              <span className="section-label">The Beginning</span>
              <h2 className="section-title">From Passion to <span className="gradient-text">Purpose</span></h2>
              <p className="about__text">
                Klawdz started in a small workshop with a simple mission: create vaping products that truly deliver on their promises. We were tired of overpriced, underperforming products flooding the market.
              </p>
              <p className="about__text">
                Today, we've grown into one of the most trusted names in premium vaping. Every product in our collection is rigorously tested, beautifully designed, and backed by our commitment to your satisfaction.
              </p>
              <div className="about__story-stats">
                <div className="about__story-stat">
                  <span className="gradient-text">50K+</span>
                  <span>Customers Worldwide</span>
                </div>
                <div className="about__story-stat">
                  <span className="gradient-text">200+</span>
                  <span>Products</span>
                </div>
                <div className="about__story-stat">
                  <span className="gradient-text">15</span>
                  <span>Countries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="section-label" style={{ justifyContent: 'center' }}>What We Stand For</span>
            <h2 className="section-title">Our Core <span className="gradient-text">Values</span></h2>
          </div>
          <div className="about__values-grid">
            {[
              { icon: '✦', title: 'Quality First', desc: 'Every product undergoes 12-point quality inspection before reaching you.', color: 'var(--purple)' },
              { icon: '⚡', title: 'Innovation', desc: 'We invest 30% of revenue into R&D to push vaping technology forward.', color: 'var(--cyan)' },
              { icon: '🌍', title: 'Sustainability', desc: 'Eco-friendly packaging and a device recycling program for a greener future.', color: 'var(--pink)' },
              { icon: '❤️', title: 'Community', desc: 'We listen, adapt, and grow with our community of passionate vapers.', color: 'var(--yellow)' },
            ].map((v, i) => (
              <div key={i} className="about__value glass-card">
                <div className="about__value-icon" style={{ color: v.color, textShadow: `0 0 20px ${v.color}` }}>{v.icon}</div>
                <h3 className="about__value-title">{v.title}</h3>
                <p className="about__value-desc">{v.desc}</p>
                <div className="about__value-number">{String(i + 1).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="section-label" style={{ justifyContent: 'center' }}>Our Journey</span>
            <h2 className="section-title">The <span className="gradient-text">Timeline</span></h2>
          </div>
          <div className="about__timeline">
            {[
              { year: '2019', title: 'The Spark', desc: 'Founded in a small garage with a dream and a soldering iron.' },
              { year: '2020', title: 'First Product Launch', desc: 'Launched the Nebula Original — sold out in 48 hours.' },
              { year: '2021', title: 'E-Liquid Line', desc: 'Introduced our artisanal e-liquid collection with 12 flavors.' },
              { year: '2022', title: 'Global Expansion', desc: 'Expanded to 15 countries with same-week delivery.' },
              { year: '2023', title: '50K Milestone', desc: 'Reached 50,000 happy customers worldwide.' },
              { year: '2024', title: 'Innovation Award', desc: 'Won "Best Vaping Brand" at the Global Vape Awards.' },
            ].map((t, i) => (
              <div key={i} className="about__timeline-item">
                <div className="about__timeline-dot" />
                <div className="about__timeline-year">{t.year}</div>
                <div className="about__timeline-content glass-card">
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span className="section-label" style={{ justifyContent: 'center' }}>The People Behind Klawdz</span>
            <h2 className="section-title">Meet the <span className="gradient-text">Team</span></h2>
          </div>
          <div className="about__team-grid">
            {[
              { name: 'Alex Rivera', role: 'Founder & CEO', color: 'var(--purple)' },
              { name: 'Sam Chen', role: 'Head of Design', color: 'var(--cyan)' },
              { name: 'Jordan Malik', role: 'Lead Engineer', color: 'var(--pink)' },
              { name: 'Taylor Brooks', role: 'Flavor Scientist', color: 'var(--yellow)' },
            ].map((m, i) => (
              <div key={i} className="about__team-member glass-card">
                <div className="about__team-avatar" style={{ background: `linear-gradient(135deg, ${m.color}, transparent)` }}>
                  <span>{m.name[0]}</span>
                </div>
                <h3 className="about__team-name">{m.name}</h3>
                <p className="about__team-role">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
