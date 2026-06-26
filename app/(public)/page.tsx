import Hero from "@/components/hero/Hero";
import TrustBar from "@/components/TrustBar";
import WhyFixRight from "@/components/WhyFixRight";
import AboutPreview from "@/components/AboutPreview";
import BookingCTA from "@/components/BookingCTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main style={{ background: '#1E1A16' }}>
      <Hero />
      <TrustBar />
      <WhyFixRight />
      <AboutPreview />
      <BookingCTA />
      <Footer />
    </main>
  );
}
