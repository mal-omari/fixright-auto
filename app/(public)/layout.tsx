import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col" style={{ paddingTop: '64px' }}>
      <Navbar />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
