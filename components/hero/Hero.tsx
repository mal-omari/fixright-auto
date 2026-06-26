'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Phone } from 'lucide-react'
import Link from 'next/link'

const DUST_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${15 + (i * 5.5) % 70}%`,
  bottom: `${18 + (i * 7) % 30}%`,
  size: 2 + (i % 3),
  delay: `${(i * 0.7) % 5}s`,
  duration: `${3 + (i * 0.4) % 3}s`,
  drift: `${(i % 2 === 0 ? 1 : -1) * (8 + (i % 12))}px`,
}))

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-item',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.18,
          ease: 'power3.out',
          delay: 0.3,
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: '#1A1A1A' }}
    >
      {/* Garage SVG Scene — full background */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <svg
          viewBox="0 0 1200 700"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            {/* Ambient fill */}
            <radialGradient id="ambientGlow" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#FF9500" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0" />
            </radialGradient>

            {/* Left overhead light cone */}
            <linearGradient id="lightConeL" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#FF9500" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF9500" stopOpacity="0" />
            </linearGradient>

            {/* Center overhead light cone */}
            <linearGradient id="lightConeC" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#FFB340" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FF9500" stopOpacity="0" />
            </linearGradient>

            {/* Right overhead light cone */}
            <linearGradient id="lightConeR" x1="0.5" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#FF9500" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FF9500" stopOpacity="0" />
            </linearGradient>

            {/* Floor glow under car */}
            <radialGradient id="floorGlow" cx="50%" cy="100%" r="50%">
              <stop offset="0%" stopColor="#FF9500" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FF9500" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background wall */}
          <rect x="0" y="0" width="1200" height="700" fill="#111111" />

          {/* Subtle wall panels */}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`wp${i}`}
              x1={(i + 1) * 150}
              y1="0"
              x2={(i + 1) * 150}
              y2="420"
              stroke="#222"
              strokeWidth="1"
            />
          ))}
          <line x1="0" y1="420" x2="1200" y2="420" stroke="#252525" strokeWidth="1.5" />

          {/* Floor */}
          <rect x="0" y="580" width="1200" height="120" fill="#141414" />
          <line x1="0" y1="580" x2="1200" y2="580" stroke="#2A2A2A" strokeWidth="1.5" />
          {/* Floor tiles */}
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={`ft${i}`}
              x1={(i + 1) * 100}
              y1="580"
              x2={(i + 1) * 100}
              y2="700"
              stroke="#1E1E1E"
              strokeWidth="0.8"
            />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <line
              key={`fth${i}`}
              x1="0"
              y1={610 + i * 30}
              x2="1200"
              y2={610 + i * 30}
              stroke="#1E1E1E"
              strokeWidth="0.8"
            />
          ))}

          {/* Ambient glow overlay */}
          <rect x="0" y="0" width="1200" height="700" fill="url(#ambientGlow)" />

          {/* ── PEGBOARD BACK WALL ── */}
          <rect x="50" y="60" width="280" height="200" fill="#0E0E0E" stroke="#2A2A2A" strokeWidth="1" rx="1" />
          <text x="64" y="80" fill="#333" fontSize="8" fontFamily="monospace" letterSpacing="2">TOOLS</text>
          {/* Pegboard holes grid */}
          {Array.from({ length: 8 }, (_, row) =>
            Array.from({ length: 12 }, (_, col) => (
              <circle
                key={`ph${row}-${col}`}
                cx={68 + col * 21}
                cy={92 + row * 20}
                r="1.5"
                fill="#1A1A1A"
                stroke="#2D2D2D"
                strokeWidth="0.5"
              />
            ))
          )}
          {/* Tool silhouettes */}
          {/* Wrench */}
          <path d="M80 100 L80 155 Q80 162 87 162 Q94 162 94 155 L94 100" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="87" cy="168" rx="8" ry="12" fill="none" stroke="#333" strokeWidth="2" />
          {/* Hammer */}
          <rect x="115" y="95" width="24" height="10" rx="2" fill="#2D2D2D" stroke="#333" strokeWidth="1" />
          <line x1="127" y1="105" x2="127" y2="160" stroke="#333" strokeWidth="3" strokeLinecap="round" />
          {/* Screwdriver */}
          <line x1="165" y1="95" x2="165" y2="160" stroke="#333" strokeWidth="2.5" strokeLinecap="round" />
          <polygon points="158,158 172,158 165,170" fill="#2D2D2D" />
          {/* Socket set outline */}
          <rect x="190" y="110" width="50" height="35" rx="3" fill="none" stroke="#2D2D2D" strokeWidth="1.5" />
          {Array.from({ length: 4 }, (_, i) => (
            <circle key={`sk${i}`} cx={200 + i * 12} cy="128" r="4" fill="#1E1E1E" stroke="#333" strokeWidth="1" />
          ))}

          {/* ── OVERHEAD SHOP LIGHTS ── */}
          {/* Left light fixture */}
          <rect x="140" y="0" width="80" height="14" rx="1" fill="#1E1E1E" stroke="#333" strokeWidth="1" />
          <rect x="145" y="6" width="70" height="6" rx="0" fill="#FF9500" fillOpacity="0.9" className="light-flicker" />
          {/* Left light cone */}
          <polygon points="145,14 215,14 280,420 80,420" fill="url(#lightConeL)" className="light-flicker" />

          {/* Center light fixture */}
          <rect x="540" y="0" width="120" height="14" rx="1" fill="#1E1E1E" stroke="#333" strokeWidth="1" />
          <rect x="546" y="6" width="108" height="6" rx="0" fill="#FFB340" fillOpacity="0.95" className="light-flicker" />
          {/* Center light cone */}
          <polygon points="546,14 654,14 780,420 420,420" fill="url(#lightConeC)" className="light-flicker" />

          {/* Right light fixture */}
          <rect x="980" y="0" width="80" height="14" rx="1" fill="#1E1E1E" stroke="#333" strokeWidth="1" />
          <rect x="985" y="6" width="70" height="6" rx="0" fill="#FF9500" fillOpacity="0.9" className="light-flicker" />
          {/* Right light cone */}
          <polygon points="985,14 1055,14 1120,420 920,420" fill="url(#lightConeR)" className="light-flicker" />

          {/* ── HYDRAULIC LIFT ── */}
          {/* Left lift column */}
          <rect x="285" y="430" width="18" height="155" rx="2" fill="#1C1C1C" stroke="#2E2E2E" strokeWidth="1" />
          <rect x="288" y="435" width="12" height="140" rx="1" fill="#181818" />
          {/* Right lift column */}
          <rect x="900" y="430" width="18" height="155" rx="2" fill="#1C1C1C" stroke="#2E2E2E" strokeWidth="1" />
          <rect x="903" y="435" width="12" height="140" rx="1" fill="#181818" />

          {/* Lift arms — left side */}
          <path
            d="M294 500 L370 520 L370 538 L280 538 L280 520 Z"
            fill="#1A1A1A"
            stroke="#FF9500"
            strokeWidth="1"
            strokeOpacity="0.6"
            className="lift-glow"
          />
          {/* Lift arms — right side */}
          <path
            d="M909 500 L833 520 L833 538 L920 538 L920 520 Z"
            fill="#1A1A1A"
            stroke="#FF9500"
            strokeWidth="1"
            strokeOpacity="0.6"
            className="lift-glow"
          />

          {/* Lift platform */}
          <rect x="240" y="430" width="720" height="16" rx="2" fill="#1C1C1C" stroke="#FF9500" strokeWidth="1.2" strokeOpacity="0.7" />
          {/* Platform texture lines */}
          {Array.from({ length: 14 }, (_, i) => (
            <line
              key={`pl${i}`}
              x1={265 + i * 47}
              y1="430"
              x2={265 + i * 47}
              y2="446"
              stroke="#FF9500"
              strokeWidth="0.4"
              strokeOpacity="0.3"
            />
          ))}

          {/* ── CAR SILHOUETTE ON LIFT ── */}
          {/* Car body */}
          <path
            d="M265 430 L280 360 L340 305 L460 278 L740 278 L860 305 L920 360 L935 430 Z"
            fill="#141414"
            stroke="#2E2E2E"
            strokeWidth="2"
          />
          {/* Cabin roofline */}
          <path
            d="M355 428 L375 330 L440 290 L760 290 L825 330 L845 428 Z"
            fill="#0F0F0F"
            stroke="#252525"
            strokeWidth="1"
          />
          {/* Window line */}
          <line x1="600" y1="428" x2="600" y2="290" stroke="#1E1E1E" strokeWidth="1.5" />
          {/* Headlight */}
          <rect x="905" y="355" width="28" height="10" rx="2" fill="#FF9500" fillOpacity="0.5" />
          <rect x="905" y="355" width="28" height="10" rx="2" fill="none" stroke="#FF9500" strokeWidth="0.8" strokeOpacity="0.8" />
          {/* Taillight */}
          <rect x="267" y="355" width="22" height="10" rx="2" fill="#CC3300" fillOpacity="0.4" />

          {/* Left wheel */}
          <circle cx="385" cy="430" r="58" fill="#0F0F0F" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="385" cy="430" r="42" fill="#0C0C0C" stroke="#2A2A2A" strokeWidth="1.5" />
          <circle cx="385" cy="430" r="18" fill="#141414" stroke="#FF9500" strokeWidth="1" strokeOpacity="0.4" />

          {/* Right wheel */}
          <circle cx="815" cy="430" r="58" fill="#0F0F0F" stroke="#1E1E1E" strokeWidth="3" />
          <circle cx="815" cy="430" r="42" fill="#0C0C0C" stroke="#2A2A2A" strokeWidth="1.5" />
          <circle cx="815" cy="430" r="18" fill="#141414" stroke="#FF9500" strokeWidth="1" strokeOpacity="0.4" />

          {/* Floor glow under lift */}
          <ellipse cx="600" cy="590" rx="320" ry="20" fill="url(#floorGlow)" />

          {/* Ambient warm light pooling on floor */}
          <ellipse cx="600" cy="600" rx="200" ry="10" fill="#FF9500" fillOpacity="0.06" />

          {/* ── RIGHT SIDE TOOLBOX ── */}
          <rect x="1000" y="390" width="130" height="190" rx="2" fill="#151515" stroke="#2A2A2A" strokeWidth="1.5" />
          {/* Drawers */}
          {Array.from({ length: 5 }, (_, i) => (
            <g key={`drawer${i}`}>
              <rect x="1006" y={398 + i * 35} width="118" height="28" rx="1" fill="#111" stroke="#252525" strokeWidth="1" />
              {/* Drawer handle */}
              <rect x="1050" y={408 + i * 35} width="30" height="5" rx="2" fill="#2A2A2A" stroke="#333" strokeWidth="1" />
            </g>
          ))}

          {/* Bottom fade */}
          <rect x="0" y="560" width="1200" height="140" fill="url(#ambientGlow)" opacity="0.5" />
        </svg>
      </div>

      {/* CSS Dust Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {DUST_PARTICLES.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.left,
              bottom: p.bottom,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: '#FF9500',
              opacity: 0,
              ['--drift' as string]: p.drift,
              animation: `dustRise ${p.duration} ease-out ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Radial vignette — darkens edges so text is readable */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 50% 45%, transparent 20%, rgba(26,26,26,0.75) 100%)',
        }}
      />

      {/* Bottom fade into next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48"
        style={{ background: 'linear-gradient(to top, #1A1A1A, transparent)' }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="hero-item mb-4">
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: '#FF9500',
            }}
          >
            London, Ontario · Est. 1996
          </span>
        </div>

        <h1
          className="hero-item mb-5 font-bold leading-none tracking-tight"
          style={{ fontSize: 'clamp(2.8rem, 9vw, 6.5rem)', color: '#F5F5F5' }}
        >
          FIXRIGHT
          <br />
          <span style={{ color: '#FF9500' }}>AUTOMOTIVE</span>
        </h1>

        <p
          className="hero-item mb-3 text-xl font-semibold tracking-wide"
          style={{ color: '#F5F5F5' }}
        >
          London Ontario's Most Trusted Independent Garage
        </p>

        <p
          className="hero-item mx-auto mb-10 max-w-lg text-base leading-relaxed"
          style={{ color: '#A0A0A0' }}
        >
          28 years of honest, expert auto care. No dealer markup. No pressure. Just results.
        </p>

        <div className="hero-item flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/book"
            style={{
              display: 'inline-block',
              background: '#FF9500',
              color: '#111111',
              padding: '14px 32px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderRadius: '2px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#FFa930')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.background = '#FF9500')}
          >
            Book Your Service
          </Link>

          <a
            href="tel:5194719462"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid rgba(245,245,245,0.3)',
              color: '#F5F5F5',
              padding: '13px 28px',
              fontSize: '13px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textDecoration: 'none',
              borderRadius: '2px',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(245,245,245,0.6)'
              el.style.background = 'rgba(245,245,245,0.05)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(245,245,245,0.3)'
              el.style.background = 'transparent'
            }}
          >
            <Phone size={15} />
            Call Us: 519.471.9462
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-item absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '10px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#A0A0A0',
          }}
        >
          Scroll
        </span>
        <div
          className="h-10 w-px"
          style={{ background: 'linear-gradient(to bottom, #A0A0A0, transparent)' }}
        />
      </div>
    </section>
  )
}
