// src/components/inventory/ItemListView.tsx
import { deleteProduct } from "@/app/actions";

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
  deleteAction: typeof deleteProduct;
  onEdit: (product: Product) => void;
};

export default function ItemListView({ items, deleteAction, onEdit }: ItemListViewProps) {
  const truncate = (text: string | null, length: number) => {
    if (!text) return "—";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const isLowStock = (product: Product) => product.quantity < product.low_stock_threshold;

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
      <table className="min-w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Product ID</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Name</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Category</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Description</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Quantity</th>
            <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
          </tr>
        </thead>

        {/* Force all text in tbody to be black */}
        <tbody className="divide-y divide-gray-200 
             bg-white 
             text-[rgba(0,0,0,1)] 
             [&_*]:text-[rgba(0,0,0,1)] 
             [&_*]:!text-opacity-100 
             [&_*]:!text-black 
             !text-black 
             dark:!text-[rgba(255,255,255,1)]">
          {items.map((product) => (
            <tr
              key={product.id}
              className={isLowStock(product) ? "bg-yellow-50 dark:bg-yellow-950/30" : ""}
            >
              <td className="py-3 px-4 font-mono text-sm">{product.product_id || "—"}</td>
              <td className="py-3 px-4 text-sm font-medium">{product.name}</td>
              <td className="py-3 px-4 text-sm">
                {product.Categories?.name || (
                  <span className="text-gray-400 dark:text-gray-600">N/A</span>
                )}
              </td>
              <td className="py-3 px-4 text-sm">{truncate(product.description, 50)}</td>
              <td
                className={`py-3 px-4 text-sm font-medium ${
                  isLowStock(product) ? "text-yellow-600" : ""
                }`}
              >
                {product.quantity}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="btn-secondary btn-sm"
                  >
                    Edit
                  </button>
                  <form action={deleteAction} className="inline">
                    <input type="hidden" name="id" value={product.id} />
                    <button
                        type="submit"
                        className="btn-danger btn-sm"
                        style={{ color: "#fff !important" }}
                      >
                        Delete
                      </button>  
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
