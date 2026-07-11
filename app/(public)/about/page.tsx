import GarageScene from "@/components/GarageScene";
import Footer from "@/components/Footer";
import BookingCTA from "@/components/BookingCTA";
import { Button } from "@/components/ui/Button";
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
    <main style={{ background: 'var(--color-bg-primary)' }}>
      {/* Page hero */}
      <section
        style={{
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '80px 24px 60px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'block', fontFamily: 'monospace', fontSize: '11px',
            letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--color-accent-amber)', marginBottom: '16px',
          }}
        >
          Est. 1996 · London, Ontario
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 56px)', fontWeight: 700,
            color: 'var(--color-text-primary)', letterSpacing: '0.04em', marginBottom: '16px',
          }}
        >
          ABOUT FIXRIGHT
        </h1>
        <div style={{ width: '48px', height: '3px', background: 'var(--color-accent-amber)', margin: '0 auto' }} />
      </section>

      {/* Omar story */}
      <section style={{ padding: '80px 24px', background: 'var(--color-bg-primary)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gap: '64px', alignItems: 'center' }} className="md:grid-cols-2">
          <div>
            <span style={{ display: 'block', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-accent-amber)', marginBottom: '16px' }}>
              Our Story
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 40px)', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '24px', lineHeight: 1.2 }}>
              MEET YOUR<br />MECHANIC
            </h2>
            <div style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>
                Hi, I&apos;m Omar — owner of FixRight Automotive. I started this garage over two decades ago with one belief: people deserve an auto shop they can actually trust.
              </p>
              <p>
                With over 28 years of combined experience, our team treats every vehicle like it&apos;s our own. We&apos;ve built lasting relationships with thousands of London families because we do what we say, charge what we quote, and stand behind every repair.
              </p>
              <p style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
                No pressure. No runaround. Just results you can count on — for 28 years and counting.
              </p>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-accent-amber)', fontSize: '18px' }}>★★★★★</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Trusted by 6,000+ London families</span>
            </div>
            <div style={{ marginTop: '32px', display: 'flex', gap: '32px' }}>
              {[{ icon: ShieldCheck, head: 'Ontario Certified', sub: 'MTO Safety Inspections' }, { icon: DollarSign, head: 'Fair & Transparent', sub: 'No surprise charges' }].map(item => {
                const ItemIcon = item.icon
                return (
                  <div key={item.head} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: 'var(--radius-sharp)', padding: '8px', display: 'inline-flex', flexShrink: 0 }}>
                      <ItemIcon size={18} color="var(--color-accent-amber)" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '14px' }}>{item.head}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{item.sub}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <GarageScene />
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '72px 24px', background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>OUR TEAM</h2>
          <div style={{ width: '40px', height: '3px', background: 'var(--color-accent-amber)', margin: '0 auto 48px' }} />
          <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {team.map((member, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', borderRadius: '3px',
                  padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'rgba(255,149,0,0.12)', border: '2px solid rgba(255,149,0,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: 700, color: 'var(--color-accent-amber)',
                  }}
                >
                  {member.initials}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-text-primary)', fontSize: '15px' }}>{member.name}</div>
                  <div style={{ color: 'var(--color-accent-amber)', fontSize: '12px', letterSpacing: '0.08em', marginTop: '3px' }}>{member.role}</div>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginTop: '4px' }}>{member.years}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '72px 24px', background: 'var(--color-bg-primary)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>OUR VALUES</h2>
          <div style={{ width: '40px', height: '3px', background: 'var(--color-accent-amber)', margin: '0 auto 48px' }} />
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '3px',
                    borderTop: '3px solid var(--color-accent-amber)', padding: '28px 20px',
                  }}
                >
                  <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ background: 'rgba(255,149,0,0.1)', borderRadius: '3px', padding: '10px', display: 'inline-flex' }}>
                      <Icon size={22} color="var(--color-accent-amber)" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    {v.label}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '64px 24px', background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          Ready to experience the difference?
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '28px', maxWidth: '400px', margin: '0 auto 28px' }}>
          Book your service today and see why thousands of London families trust FixRight.
        </p>
        <Button href="/book" size="large">
          Book Your Service
        </Button>
      </section>

      <Footer />
    </main>
  );
}
