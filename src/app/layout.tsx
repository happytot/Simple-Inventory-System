import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// We'll need to import your Header and Footer
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory System",
  description: "A simple inventory system built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the base styles to the body tag */}
      <body 
        className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900`}
      >
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}