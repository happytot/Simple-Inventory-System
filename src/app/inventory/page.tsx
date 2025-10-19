// src/app/inventory/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import InventoryManager from "@/components/inventory/InventoryManager"; // Import the manager

// --- TYPE DEFINITIONS (Copied from root page) ---
type Category = {
  id: number;
  name: string;
};

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

// This is the new page component
export default async function InventoryListPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // --- DATA FETCHING (Moved from root page) ---
  const { data: products, error: productError } = await supabase
    .from("Products")
    .select("*, Categories(name)")
    .order("created_at", { ascending: false });

  const { data: categories, error: categoryError } = await supabase
    .from("Categories")
    .select("*")
    .order("name", { ascending: true });

  if (productError || categoryError) {
    return (
      <main className="container mx-auto p-8">
        <p className="text-red-500">
          {productError ? `Error fetching products: ${productError.message}` : ''}
          {categoryError ? `Error fetching categories: ${categoryError.message}` : ''}
        </p>
      </main>
    );
  }

  // --- RENDER ---
  return (
    <main className="container mx-auto p-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory List</h1>
      </div>

      {/* Render the Inventory Manager */}
      <InventoryManager
        initialProducts={products as Product[]}
        categories={categories as Category[]}
      />
    </main>
  );
}