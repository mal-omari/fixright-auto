import Hero from "@/components/hero/Hero";
import TrustBar from "@/components/TrustBar";
import ServicesTeaser from "@/components/ServicesTeaser";
import WhyFixRight from "@/components/WhyFixRight";
import AboutPreview from "@/components/AboutPreview";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main style={{ background: 'var(--color-bg-primary)' }}>
      <Hero />
      <TrustBar />
      <ServicesTeaser />
      <WhyFixRight />
      <AboutPreview />
      <BookingCTA />
      <Footer />
    </main>
  );
}
