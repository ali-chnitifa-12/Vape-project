import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const followerRef = useRef(null)

  useEffect(() => {
    const cursor = cursorRef.current
    const follower = followerRef.current

    const moveCursor = (e) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 })
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.35 })
    }

    const grow = () => {
      gsap.to(follower, { scale: 2.5, opacity: 0.15, duration: 0.3 })
      gsap.to(cursor, { scale: 0, duration: 0.3 })
    }

    const shrink = () => {
      gsap.to(follower, { scale: 1, opacity: 0.3, duration: 0.3 })
      gsap.to(cursor, { scale: 1, duration: 0.3 })
    }

    window.addEventListener('mousemove', moveCursor)

    const interactables = document.querySelectorAll('a, button, .glass-card, input, textarea')
    interactables.forEach((el) => {
      el.addEventListener('mouseenter', grow)
      el.addEventListener('mouseleave', shrink)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      interactables.forEach((el) => {
        el.removeEventListener('mouseenter', grow)
        el.removeEventListener('mouseleave', shrink)
      })
    }
  }, [])

  return (
    <>
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: 8,
          height: 8,
          background: '#00D4FF',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10001,
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'difference',
        }}
      />
      <div
        ref={followerRef}
        style={{
          position: 'fixed',
          width: 36,
          height: 36,
          border: '1px solid rgba(123, 47, 255, 0.5)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 10000,
          transform: 'translate(-50%, -50%)',
          opacity: 0.3,
        }}
      />
    </>
  )
}
