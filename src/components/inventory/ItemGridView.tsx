// src/components/inventory/ItemGridView.tsx
import ItemCard from "./ItemCard";
import type { deleteProduct } from "@/app/actions";

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

// FIX: Add onEdit to the props type
type ItemGridViewProps = { 
  items: Product[]; 
  deleteAction: typeof deleteProduct;
  onEdit: (product: Product) => void;
};

// FIX: Destructure onEdit and pass it down to ItemCard
export default function ItemGridView({ items, deleteAction, onEdit }: ItemGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((product) => (
        <ItemCard key={product.id} product={product} deleteAction={deleteAction} onEdit={onEdit} />
      ))}
    </div>
  );
}