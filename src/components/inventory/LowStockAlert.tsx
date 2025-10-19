// src/components/inventory/LowStockAlert.tsx
'use client';

// Product type definition should include category fields
type Product = {
  id: number;
  name: string;
  quantity: number;
  description: string | null;
  product_id: string | null;
  created_at: string;
  low_stock_threshold: number;
  category_id: number | null;
  Categories: { name: string } | null;
};

type LowStockAlertProps = {
  items: Product[];
  onEdit: (product: Product) => void;
};

// Warning Icon - Changed to yellow
function WarningIcon() {
  return (
    <svg className="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  );
}


export default function LowStockAlert({ items, onEdit }: LowStockAlertProps) {
  if (items.length === 0) {
    return null; // Don't show anything if no items are low stock
  }

  return (
    // Container: Changed bg-orange-* to bg-gray-50 and border-gray-200
    <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl shadow-sm mb-8">
      {/* Header */}
      <div className="flex items-center mb-3">
        <WarningIcon />
        {/* Header Text: Changed text-orange-* to text-gray-800 */}
        <h3 className="ml-3 text-lg font-semibold text-gray-800">
          Low Stock Alerts ({items.length})
        </h3>
      </div>

      {/* Item List */}
      <ul className="space-y-3">
        {items.map((item) => (
          // List Item: Use white background, gray border
          <li
            key={item.id}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100"
          >
            {/* Item Info */}
            <div className="flex-1 mb-2 sm:mb-0">
              <span className="font-medium text-gray-900">{item.name}</span>
              {/* Quantity Text: Changed text-orange-* to text-yellow-600 */}
              <p className="text-sm text-yellow-600 font-medium">
                Quantity: {item.quantity} / Threshold: {item.low_stock_threshold}
              </p>
            </div>
            {/* Edit Button */}
            <button
              onClick={() => onEdit(item)}
              className="btn-secondary btn-sm" // Kept secondary style
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}