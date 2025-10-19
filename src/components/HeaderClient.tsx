// src/components/HeaderClient.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signOut } from '@/app/actions'; // This will be used now
import { useRouter } from 'next/navigation'; // This will be used now

// 1. Add props
type HeaderClientProps = {
  lowStockCount: number;
};

export default function HeaderClient({ lowStockCount }: HeaderClientProps) { // 2. Use props
  const [isMenuOpen, setIsMenuOpen] = useState(false); // This will be used now
  const router = useRouter(); // This will be used now

  const handleSignOut = async () => { // This will be used now
    await signOut();
    setIsMenuOpen(false);
    router.push('/login');
  };

  return (
    <header className="w-full bg-white/75 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-2xl font-bold text-gray-900"
            onClick={() => setIsMenuOpen(false)}
          >
            📦 InventorySys
          </Link>
          
          {/* 3. Add the badge here */}
          {lowStockCount > 0 && (
            <div className="bg-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {lowStockCount}
            </div>
          )}
        </div>

        {/* --- THIS IS THE MISSING DESKTOP NAV --- */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleSignOut}
            className="btn-secondary"
          >
            Sign Out
          </button>
        </div>

        {/* --- THIS IS THE MISSING MOBILE BUTTON --- */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} // Uses isMenuOpen
            className="text-gray-900 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-apple-blue"
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* --- THIS IS THE MISSING MOBILE MENU --- */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200">
          <div className="container mx-auto p-4 flex flex-col gap-4">
            <button
              onClick={handleSignOut} // Uses handleSignOut
              className="btn-secondary text-left"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}