import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
  title: "AlgorithmX — Cybersecurity Education for Kids",
  description: "Interactive cybersecurity courses for ages 6-18+. Fun animated adventures, real-world simulations, and accredited learning paths.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "AlgorithmX — Cybersecurity Education for Kids",
    description: "Interactive cybersecurity courses for ages 6-18+. Fun animated adventures with Adam & Layla.",
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
      </body>
    </html>
  );
}
