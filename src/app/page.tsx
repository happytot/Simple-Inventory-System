import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import AddProductForm from "@/components/AddProductForm";
import InventoryManager from "@/components/inventory/InventoryManager"; // Import our new manager

// Update the Product type to include created_at for sorting
type Product = {
  id: number;
  name: string;
  quantity: number;
  description: string | null;
  product_id: string | null;
  created_at: string;
};

export default async function InventoryPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch initial data on the server
  // Note: We are ordering by created_at descending by default now
  const { data: products, error } = await supabase
    .from("Products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    // A simple error state
    return (
      <main className="container mx-auto p-8">
        <p className="text-red-500">Error fetching products: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Simple Inventory System</h1>
        <form action={signOut}>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
            Sign Out
          </button>
        </form>
      </div>

      <AddProductForm />

      <hr className="my-8" />

      {/* Render the new interactive inventory manager, passing server-fetched data */}
      <InventoryManager initialProducts={products as Product[]} />
    </main>
  );
}