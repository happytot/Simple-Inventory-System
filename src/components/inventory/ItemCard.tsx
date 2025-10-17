// src/components/inventory/ItemCard.tsx
import type { deleteProduct } from "@/app/actions";

type Product = {
  id: number; name: string; quantity: number; description: string | null; product_id: string | null; created_at: string;
};

// FIX: Add onEdit to the props type
type ItemCardProps = { 
  product: Product; 
  deleteAction: typeof deleteProduct; 
  onEdit: (product: Product) => void; 
};

// FIX: Destructure onEdit from the props
export default function ItemCard({ product, deleteAction, onEdit }: ItemCardProps) {
  const isLowStock = product.quantity < 5;

  return (
    <div className={`p-4 border rounded-lg shadow-sm ${isLowStock ? 'bg-yellow-100 border-yellow-300' : 'bg-white'}`}>
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg">{product.name}</h3>
        <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">{product.product_id}</span>
      </div>
      <p className="text-gray-600 my-2 text-sm">{product.description}</p>
      <div className="flex justify-between items-center mt-4">
        <span className={`font-semibold ${isLowStock ? 'text-orange-600' : ''}`}>
          Quantity: {product.quantity}
        </span>
        <div className="flex gap-2">
          {/* FIX: Use the onEdit function in the onClick handler */}
          <button
            onClick={() => onEdit(product)}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600"
          >
            Edit
          </button>
          <form action={deleteAction}>
            <input type="hidden" name="id" value={product.id} />
            <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">
              Delete
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}