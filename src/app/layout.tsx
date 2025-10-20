// src/app/layout.tsx
// NO 'use client' here

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // Import Server Component (now OK)
import Footer from "@/components//Footer"; // Import Server Component (now OK)
import { ToastProvider } from "@/context/ToastContext"; // Just import the provider

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
      <body className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900`}>
        {/* ToastProvider is a Client Component, but it's OK to
            use it inside a Server Component (layout.tsx) */}
        <ToastProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          {/* No ToastContainer here - it's inside the provider now */}
        </ToastProvider>
      </body>
    </html>
  );
}