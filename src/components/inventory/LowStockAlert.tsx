// src/components/inventory/LowStockAlert.tsx
'use client';

// Make sure the Product type is imported or defined here
type Product = {
  id: number;
  name: string;
  quantity: number;
  description: string | null;
  product_id: string | null;
  created_at: string;
  low_stock_threshold: number;
  category_id: number | null; // <-- ADD THIS
  Categories: { name: string } | null; // <-- AND THIS
};

type LowStockAlertProps = {
  items: Product[];
  onEdit: (product: Product) => void;
};

// A simple warning icon
function WarningIcon() {
  return (
    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function LowStockAlert({ items, onEdit }: LowStockAlertProps) {
  if (items.length === 0) {
    return null; // Don't show anything if no items are low stock
  }

  return (
    <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 p-4 rounded-lg shadow-lg mb-8">
      <div className="flex items-center">
        <WarningIcon />
        <h3 className="ml-3 text-xl font-bold">Low Stock Alerts</h3>
      </div>
      <p className="mt-2 text-sm">
        The following {items.length} item(s) are below their reorder threshold:
      </p>
      <ul className="list-disc list-inside mt-3 space-y-1">
        {items.map((item) => (
          <li key={item.id} className="text-sm">
            <span className="font-semibold">{item.name}</span>
            <span className="text-orange-900"> (Qty: {item.quantity} / Threshold: {item.low_stock_threshold})</span>
            <button
              onClick={() => onEdit(item)}
              className="ml-2 text-blue-600 hover:text-blue-800 hover:underline text-xs"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}