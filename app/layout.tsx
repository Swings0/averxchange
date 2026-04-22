import type { Metadata } from "next";
import { Inter, Manrope, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ConstellationBackground } from "@/components/ui/constellation";
import "swiper/swiper-bundle.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AverExchange",
  description: "Modern crypto & forex trading platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        manrope.variable,
        geist.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full relative flex flex-col font-sans">

        {/* 🌌 GLOBAL CONSTELLATION BACKGROUND */}
        <ConstellationBackground className="fixed inset-0 -z-10" />

        {/* MAIN CONTENT */}
        <main className="relative z-10">
          <Navbar />
          {children}
          <Footer />
        </main>

      </body>
    </html>
  )
}