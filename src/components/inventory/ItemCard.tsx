// src/components/inventory/ItemCard.tsx
import { deleteProduct } from "@/app/actions";

// Product type is correct
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
  const isLowStock = product.quantity < product.low_stock_threshold;

  return (
    <div className={`p-4 bg-white rounded-2xl shadow-lg ${isLowStock ? 'ring-2 ring-orange-300' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
          <span className="text-sm font-medium text-apple-blue">
            {product.Categories?.name || "Uncategorized"}
          </span>
        </div>
        <span className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{product.product_id}</span>
      </div>
      <p className="text-gray-600 my-2 text-sm">{product.description || '—'}</p>
      <div className="flex justify-between items-center mt-4">
        <span className={`font-semibold ${isLowStock ? 'text-orange-600' : 'text-gray-800'}`}>
          Quantity: {product.quantity}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="btn-primary" // Use global style
          >
            Edit
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={product.id} />
            <button type="submit" className="btn-danger"> {/* Use global style */}
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}