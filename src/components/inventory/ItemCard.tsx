// src/components/inventory/ItemCard.tsx
import { deleteProduct } from "@/app/actions"; // Ensure this is a regular import

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

type ItemCardProps = {
  product: Product;
  deleteAction: typeof deleteProduct;
  onEdit: (product: Product) => void;
};

export default function ItemCard({ product, deleteAction, onEdit }: ItemCardProps) {
  // Use the specific low stock threshold for the item
  const isLowStock = product.quantity < product.low_stock_threshold;

  return (
    // **1. Container Style:** White bg, rounded, border, shadow-sm
    <div className={`p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-between h-full
        ${isLowStock ? 'ring-2 ring-yellow-300' : ''}`}> {/* Keep ring for low stock */}

      {/* Top Section: Info */}
      <div>
        <div className="flex justify-between items-start mb-2">
          {/* Left: Name & Category */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
            <span className="text-sm font-medium text-apple-blue">
              {product.Categories?.name || "Uncategorized"}
            </span>
          </div>
          {/* Right: Product ID */}
          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md flex-shrink-0 ml-2">
            {product.product_id}
          </span>
        </div>
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2"> {/* Limit description lines */}
          {product.description || <span className="text-gray-400">—</span>}
        </p>
      </div>

      {/* Bottom Section: Quantity & Actions */}
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100"> {/* Added top border */}
        {/* Quantity */}
        <span className={`font-semibold text-sm ${isLowStock ? 'text-yellow-600' : 'text-gray-800'}`}> {/* Use yellow for low stock qty */}
          Qty: {product.quantity}
        </span>
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="btn-secondary btn-sm" // Use secondary and small style
          >
            Edit
          </button>
          <form action={deleteAction} className="inline"> {/* Use inline form */}
            <input type="hidden" name="id" value={product.id} />
            <button
              type="submit"
              className="btn-danger btn-sm" // Use danger and small style
              // Add confirmation dialog if needed:
              // onClick={(e) => { if (!window.confirm(`Delete "${product.name}"?`)) e.preventDefault(); }}
            >
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}