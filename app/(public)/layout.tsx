import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { DemoBanner } from "@/components/DemoBanner";
import { SITE_CONFIG } from "@/lib/site-config";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-full flex flex-col"
      style={{ paddingTop: SITE_CONFIG.demo.enabled ? '94px' : '64px' }}
    >
      <DemoBanner />
      <Navbar />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
