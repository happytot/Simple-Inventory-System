import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AddProductForm from "@/components/AddProductForm";
import InventoryManager from "@/components/inventory/InventoryManager";

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

export default async function InventoryPage() {
  // ✅ Must await cookies() in Next.js 15
const cookieStore = cookies(); // no await
const supabase = createServerComponentClient({ cookies: () => cookieStore });


  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");

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
          {productError ? `Error fetching products: ${productError.message}` : ""}
          {categoryError ? `Error fetching categories: ${categoryError.message}` : ""}
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory</h1>
      </div>

      <AddProductForm categories={categories as Category[]} />

      <hr className="my-8" />

      <InventoryManager
        initialProducts={products as Product[]}
        categories={categories as Category[]}
      />
    </main>
  );
}
