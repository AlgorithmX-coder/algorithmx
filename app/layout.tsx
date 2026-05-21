import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import DevFpsCounter from "./components/DevFpsCounter";
import PlausibleScript from "./components/PlausibleScript";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Inter as display font for the redesigned `/landing-v2` cinematic
// landing. Other routes continue using Geist via `--font-geist-sans`.
const inter = Inter({
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AlgorithmX - Technology Education for Every Age",
  description: "Six subjects, four age tracks each. Interactive cybersecurity, game development, AI, app development, entrepreneurship, and robotics courses for ages 6 to adult. UK-based, accreditation aligned, lifetime access.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "AlgorithmX - Technology Education for Every Age",
    description: "Six subjects, four age tracks each. Interactive cybersecurity, game development, AI, app development, entrepreneurship, and robotics courses for ages 6 to adult. UK-based, accreditation aligned, lifetime access.",
    type: "website",
    url: "https://algorithmx.co.uk",
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
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <PlausibleScript />
        <DevFpsCounter />
      </body>
    </html>
  );
}
