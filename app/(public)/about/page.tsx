import GarageScene from "@/components/GarageScene";
import Footer from "@/components/Footer";
import BookingCTA from "@/components/BookingCTA";
import Link from "next/link";
import { Heart, Star, DollarSign, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | FixRight Automotive London Ontario",
  description: "Meet Omar and the FixRight team — 28 years of honest auto care in London Ontario. Family owned, Ontario certified, no pressure.",
};

const values = [
  { icon: Heart, label: 'Honest', desc: 'We tell you exactly what your vehicle needs — nothing more, nothing less.' },
  { icon: Star, label: 'Experienced', desc: '28+ years of hands-on expertise across all makes and models.' },
  { icon: DollarSign, label: 'Fair', desc: 'Dealership-level work at independent shop prices. Always transparent.' },
  { icon: ShieldCheck, label: 'Reliable', desc: 'Every repair backed by our workmanship guarantee. We stand behind our work.' },
]

const team = [
  { initials: 'OM', name: 'Omar', role: 'Owner & Head Mechanic', years: '28 yrs experience' },
  { initials: 'TM', name: 'Team Member', role: 'Senior Technician', years: '12 yrs experience' },
  { initials: 'TM', name: 'Team Member', role: 'Service Technician', years: '8 yrs experience' },
]

export default function AboutPage() {
  return (
    <main style={{ background: '#1E1A16' }}>
      {/* Page hero */}
      <section
        style={{
          background: '#2A2420',
          borderBottom: '1px solid #3A3430',
          padding: '80px 24px 60px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'block', fontFamily: 'monospace', fontSize: '11px',
            letterSpacing: '0.35em', textTransform: 'uppercase', color: '#FF9500', marginBottom: '16px',
          }}
        >
          Est. 1996 · London, Ontario
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 56px)', fontWeight: 800,
            color: '#F0EDE8', letterSpacing: '0.04em', marginBottom: '16px',
          }}
        >
          ABOUT FIXRIGHT
        </h1>
        <div style={{ width: '48px', height: '3px', background: '#FF9500', borderRadius: '2px', margin: '0 auto' }} />
      </section>

      {/* Omar story */}
      <section style={{ padding: '80px 24px', background: '#1E1A16' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gap: '64px', alignItems: 'center' }} className="md:grid-cols-2">
          <div>
            <span style={{ display: 'block', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#FF9500', marginBottom: '16px' }}>
              Our Story
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 40px)', fontWeight: 800, color: '#F0EDE8', marginBottom: '24px', lineHeight: 1.2 }}>
              MEET YOUR<br />MECHANIC
            </h2>
            <div style={{ color: '#9A8E82', lineHeight: 1.8, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                Hi, I&apos;m Omar — owner of FixRight Automotive. I started this garage over two decades ago with one belief: people deserve an auto shop they can actually trust.
              </p>
              <p>
                With over 28 years of combined experience, our team treats every vehicle like it&apos;s our own. We&apos;ve built lasting relationships with thousands of London families because we do what we say, charge what we quote, and stand behind every repair.
              </p>
              <p style={{ color: '#F0EDE8', fontWeight: 500 }}>
                No pressure. No runaround. Just results you can count on — for 28 years and counting.
              </p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#FF9500', fontSize: '18px' }}>★★★★★</span>
              <span style={{ color: '#9A8E82', fontSize: '14px' }}>Trusted by 6,000+ London families</span>
            </div>
            <div style={{ marginTop: '32px', display: 'flex', gap: '32px' }}>
              {[{ head: 'Ontario Certified', sub: 'MTO Safety Inspections' }, { head: 'Fair & Transparent', sub: 'No surprise charges' }].map(item => (
                <div key={item.head} style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ width: '2px', background: '#FF9500', minHeight: '42px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#F0EDE8', fontSize: '14px' }}>{item.head}</div>
                    <div style={{ fontSize: '13px', color: '#9A8E82' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <GarageScene />
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '72px 24px', background: '#2A2420', borderTop: '1px solid #3A3430' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#F0EDE8', marginBottom: '8px' }}>OUR TEAM</h2>
          <div style={{ width: '40px', height: '3px', background: '#FF9500', borderRadius: '2px', margin: '0 auto 48px' }} />
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {team.map((member, i) => (
              <div
                key={i}
                style={{
                  background: '#1E1A16', border: '1px solid #3A3430', borderRadius: '3px',
                  padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'rgba(255,149,0,0.12)', border: '2px solid rgba(255,149,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 800, color: '#FF9500',
                  }}
                >
                  {member.initials}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#F0EDE8', fontSize: '15px' }}>{member.name}</div>
                  <div style={{ color: '#FF9500', fontSize: '12px', letterSpacing: '0.08em', marginTop: '3px' }}>{member.role}</div>
                  <div style={{ color: '#9A8E82', fontSize: '12px', marginTop: '4px' }}>{member.years}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '72px 24px', background: '#1E1A16', borderTop: '1px solid #3A3430' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#F0EDE8', marginBottom: '8px' }}>OUR VALUES</h2>
          <div style={{ width: '40px', height: '3px', background: '#FF9500', borderRadius: '2px', margin: '0 auto 48px' }} />
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div
                  key={i}
                  style={{
                    background: '#2A2420', border: '1px solid #3A3430', borderRadius: '3px',
                    borderTop: '3px solid #FF9500', padding: '28px 20px',
                  }}
                >
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: '3px', padding: '10px', display: 'inline-flex' }}>
                      <Icon size={22} color="#FF9500" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#F0EDE8', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    {v.label}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#9A8E82', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', background: '#2A2420', borderTop: '1px solid #3A3430', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#F0EDE8', marginBottom: '12px' }}>
          Ready to experience the difference?
        </h2>
        <p style={{ color: '#9A8E82', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
          Book your service today and see why thousands of London families trust FixRight.
        </p>
        <Link
          href="/book"
          style={{
            display: 'inline-block', background: '#FF9500', color: '#111008',
            padding: '14px 40px', fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '3px',
          }}
        >
          Book Your Service
        </Link>
      </section>

      <Footer />
    </main>
  );
}
