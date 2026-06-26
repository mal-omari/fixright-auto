import Hero from "@/components/hero/Hero";
import TrustBar from "@/components/TrustBar";
import ServicesGrid from "@/components/services/ServicesGrid";
import About from "@/components/About";

export default function HomePage() {
  return (
    <main style={{ background: '#0A0A0A' }}>
      <Hero />
      <TrustBar />
      <ServicesGrid />
      <About />
    </main>
  );
}
