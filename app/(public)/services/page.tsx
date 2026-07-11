import ServicesGrid from "@/components/services/ServicesGrid";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | FixRight Automotive London Ontario",
  description: "Full automotive services in London Ontario — oil changes, brakes, engine repair, A/C, electrical diagnostics, safety certifications, and more.",
};

export default function ServicesPage() {
  return (
    <main style={{ background: 'var(--color-bg-primary)' }}>
      {/* Page hero banner */}
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
            display: 'block',
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-amber)',
            marginBottom: '16px',
          }}
        >
          London, Ontario
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 56px)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            marginBottom: '16px',
          }}
        >
          OUR SERVICES
        </h1>
        <div style={{ width: '48px', height: '3px', background: 'var(--color-accent-amber)', margin: '0 auto 20px' }} />
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
          Dealership-quality work at honest prices. Every service backed by our workmanship guarantee.
        </p>
      </section>

      {/* Full services grid */}
      <ServicesGrid />

      {/* Diagnostic CTA */}
      <section
        style={{
          background: 'var(--color-bg-surface)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: '56px 24px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          Not sure what you need?
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
          Book a diagnostic and we&apos;ll tell you exactly what&apos;s going on — no charge for the assessment.
        </p>
        <Button href="/book" size="large">
          Book a Diagnostic
        </Button>
      </section>

      <BookingCTA />
      <Footer />
    </main>
  );
}
