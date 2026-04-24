import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import DevFpsCounter from "./components/DevFpsCounter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AlgorithmX — Technology Education for Every Age",
  description: "Six subjects, four age tracks each. Interactive cybersecurity, game development, AI, app development, entrepreneurship, and robotics courses for ages 6 to adult. UK-based, accreditation aligned, lifetime access.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "AlgorithmX — Technology Education for Every Age",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <DevFpsCounter />
      </body>
    </html>
  );
}
