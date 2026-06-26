import ServicesGrid from "@/components/services/ServicesGrid";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | FixRight Automotive London Ontario",
  description: "Full automotive services in London Ontario — oil changes, brakes, engine repair, A/C, electrical diagnostics, safety certifications, and more.",
};

export default function ServicesPage() {
  return (
    <main style={{ background: '#1E1A16' }}>
      {/* Page hero banner */}
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
            display: 'block',
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#FF9500',
            marginBottom: '16px',
          }}
        >
          London, Ontario
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 56px)',
            fontWeight: 800,
            color: '#F0EDE8',
            letterSpacing: '0.04em',
            marginBottom: '16px',
          }}
        >
          OUR SERVICES
        </h1>
        <div style={{ width: '48px', height: '3px', background: '#FF9500', borderRadius: '2px', margin: '0 auto 20px' }} />
        <p style={{ color: '#9A8E82', fontSize: '16px', maxWidth: '520px', margin: '0 auto', lineHeight: '1.7' }}>
          Dealership-quality work at honest prices. Every service backed by our workmanship guarantee.
        </p>
      </section>

      {/* Full services grid */}
      <ServicesGrid />

      {/* Diagnostic CTA */}
      <section
        style={{
          background: '#2A2420',
          borderTop: '1px solid #3A3430',
          borderBottom: '1px solid #3A3430',
          padding: '56px 24px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#F0EDE8', marginBottom: '12px' }}>
          Not sure what you need?
        </h2>
        <p style={{ color: '#9A8E82', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
          Book a diagnostic and we&apos;ll tell you exactly what&apos;s going on — no charge for the assessment.
        </p>
        <Link
          href="/book"
          style={{
            display: 'inline-block',
            background: '#FF9500',
            color: '#111008',
            padding: '14px 36px',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: '3px',
          }}
        >
          Book a Diagnostic
        </Link>
      </section>

      <BookingCTA />
      <Footer />
    </main>
  );
}
