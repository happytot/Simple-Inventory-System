// src/components/inventory/ItemCard.tsx

// Product type definition
type Product = {
  id: number; name: string; quantity: number; description: string | null; product_id: string | null; created_at: string;
  low_stock_threshold: number; category_id: number | null; Categories: { name: string } | null;
};

// **1. UPDATE PROPS HERE**
type ItemCardProps = {
  product: Product;
  onDelete: (product: Product) => void; // Changed from deleteAction
  onEdit: (product: Product) => void;
};

export default function ItemCard({ product, onDelete, onEdit }: ItemCardProps) {
  const isLowStock = product.quantity < product.low_stock_threshold;

  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col justify-between h-full
        ${isLowStock ? 'ring-2 ring-yellow-300' : ''}`}>
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
            <span className="text-sm font-medium text-apple-blue">
              {product.Categories?.name || "Uncategorized"}
            </span>
          </div>
          <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md flex-shrink-0 ml-2">
            {product.product_id}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description || <span className="text-gray-400">—</span>}
        </p>
      </div>
      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
        <span className={`font-semibold text-sm ${isLowStock ? 'text-yellow-600' : 'text-gray-800'}`}>
          Qty: {product.quantity}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="btn-secondary btn-sm"
          >
            Edit
          </button>
          
          {/* **2. UPDATE DELETE BUTTON (REMOVE FORM)** */}
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="btn-danger btn-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}