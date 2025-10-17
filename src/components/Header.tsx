import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-300">
          📦 InventorySys
        </Link>
        {/* We can add a simple "Sign Out" button here later if we want */}
      </nav>
    </header>
  );
}