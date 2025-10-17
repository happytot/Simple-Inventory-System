import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header"; // 1. Import Header
import Footer from "@/components/Footer"; // 2. Import Footer

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
      {/* 3. Add flexbox classes to make the footer stick to the bottom.
           - min-h-screen: Makes the layout at least the full height of the screen.
           - flex flex-col: Stacks the children (header, main, footer) vertically.
      */}
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header /> {/* 4. Add the Header at the top */}

        {/* 5. Add flex-grow to the main content.
             - This tells the main area to "grow" and push the footer 
               to the bottom of the page.
        */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer /> {/* 6. Add the Footer at the bottom */}
      </body>
    </html>
  );
}