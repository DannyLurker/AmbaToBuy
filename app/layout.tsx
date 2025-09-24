import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/helper/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AmbaToBuy - Makanan & Minuman Murah di Batam | SMK Advent",
    template: "%s | AmbaToBuy - I'm about to buy it now 🔥",
  },
  description:
    "Nikmati kelezatan makanan dan minuman dengan harga ramah kantong di AmbaToBuy. Kentang spiral, sushi, jasuke, dan es milo di SMK Advent Batam. Pesan sekarang juga!",
  keywords: [
    "makanan murah batam",
    "minuman murah batam",
    "kentang spiral",
    "sushi murah",
    "jasuke",
    "es milo",
    "SMK Advent Batam",
    "kantin sekolah",
    "ambatobuy",
    "jajanan sekolah",
  ],
  authors: [{ name: "AmbaToBuy Tim 9" }],
  creator: "Danny & Teams",
  publisher: "AmbaToBuy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://ambatobuy.com"
  ),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        {children}
      </body>
    </html>
  );
}
