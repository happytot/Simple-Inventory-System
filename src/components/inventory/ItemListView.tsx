// src/components/inventory/ItemListView.tsx

import type { deleteProduct } from "@/app/actions";

type Product = {
  id: number;
  name: string;
  quantity: number;
  description: string | null;
  product_id: string | null;
  // Make sure your Product type here matches the one in InventoryManager
  created_at: string; 
};

// FIX 1: Add onEdit to the props type definition here.
type ItemListViewProps = {
  items: Product[];
  deleteAction: typeof deleteProduct;
  onEdit: (product: Product) => void; 
};

// FIX 2: Add onEdit to the function's parameters here.
export default function ItemListView({ items, deleteAction, onEdit }: ItemListViewProps) {
  const truncate = (text: string | null, length: number) => {
    if (!text) return 'N/A';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-3 px-4 text-left">Product ID</th>
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Description</th>
            <th className="py-3 px-4 text-left">Quantity</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((product) => (
            <tr
              key={product.id}
              className={`border-b hover:bg-gray-50 ${product.quantity < 5 ? 'bg-yellow-100' : ''}`}
            >
              <td className="py-3 px-4 font-mono">{product.product_id}</td>
              <td className="py-3 px-4">{product.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{truncate(product.description, 50)}</td>
              <td className={`py-3 px-4 font-semibold ${product.quantity < 5 ? 'text-orange-600' : ''}`}>
                {product.quantity}
              </td>
              <td className="py-3 px-4 flex justify-center gap-2">
                <button
                  onClick={() => onEdit(product)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">
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