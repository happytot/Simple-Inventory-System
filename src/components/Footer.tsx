export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-200 text-gray-700 p-4 text-center shadow-inner">
      <p>&copy; {currentYear} InventorySys. All rights reserved.</p>
    </footer>
  );
}