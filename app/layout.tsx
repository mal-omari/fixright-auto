import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { SITE_CONFIG } from "@/lib/site-config";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-barlow",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${SITE_CONFIG.business.name} | Fictional Garage Website & Workshop Portal Demo`,
  description: 'A fictional demonstration of a configurable garage website, booking flow, and workshop management portal.',
  robots: {
    index: !SITE_CONFIG.demo.enabled,
    follow: !SITE_CONFIG.demo.enabled,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
