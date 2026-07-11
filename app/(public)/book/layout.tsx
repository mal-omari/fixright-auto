import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Service | FixRight Automotive London Ontario",
  description: "Book your auto service online at FixRight Automotive in London Ontario. Tell us about your vehicle and we'll confirm your appointment by phone within the hour.",
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
