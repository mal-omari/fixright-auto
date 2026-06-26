import Hero from "@/components/hero/Hero";
import TrustBar from "@/components/TrustBar";
import ServicesGrid from "@/components/services/ServicesGrid";
import WhyFixRight from "@/components/WhyFixRight";
import About from "@/components/About";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main style={{ background: '#1A1A1A' }}>
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <WhyFixRight />
      <About />
      <BookingCTA />
      <Footer />
    </main>
  );
}
