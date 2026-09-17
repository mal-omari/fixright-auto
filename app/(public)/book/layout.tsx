import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Booking Flow | ${SITE_CONFIG.business.name} Demo`,
  description: "Try a fictional garage booking flow. Demo submissions are not stored and no emails are sent.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
