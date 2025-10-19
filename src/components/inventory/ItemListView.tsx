// src/components/inventory/ItemListView.tsx
import { deleteProduct } from "@/app/actions"; // <-- THIS IS THE FIX

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

type ItemListViewProps = {
  items: Product[];
  deleteAction: typeof deleteProduct; // Now 'typeof' can read the imported function
  onEdit: (product: Product) => void;
};

export default function ItemListView({ items, deleteAction, onEdit }: ItemListViewProps) {
  const truncate = (text: string | null, length: number) => {
    if (!text) return '—'; // Use em-dash
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const isLowStock = (product: Product) => product.quantity < product.low_stock_threshold;

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Product ID</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* This mapping must not have any whitespace between <tr> tags */}
          {items.map((product) => (
            <tr
              key={product.id}
              className={`border-b border-gray-100 ${
                isLowStock(product) ? 'bg-orange-50' : 'hover:bg-gray-50'
              }`}
            >
              <td className="py-3 px-4 font-mono text-sm text-gray-700">{product.product_id}</td>
              <td className="py-3 px-4 text-sm font-medium text-gray-900">{product.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {product.Categories?.name || <span className="text-gray-400">N/A</span>}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">{truncate(product.description, 50)}</td>
              <td className={`py-3 px-4 text-sm font-medium ${
                isLowStock(product) ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {product.quantity}
              </td>
              <td className="py-3 px-4 flex justify-center gap-2">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}