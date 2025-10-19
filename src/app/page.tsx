// src/app/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from 'next/link'; // Import Link
import AddProductForm from "@/components/AddProductForm";

// Define Category type needed for AddProductForm
type Category = {
  id: number;
  name: string;
};

// This is now the Dashboard/Homepage
export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch only the categories needed for the AddProductForm
  const { data: categories, error: categoryError } = await supabase
    .from("Categories")
    .select("*")
    .order("name", { ascending: true });

  if (categoryError) {
    return (
      <main className="container mx-auto p-8">
        <p className="text-red-500">
          Error fetching categories: {categoryError.message}
        </p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-8">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Keep the Add Product Form */}
      <AddProductForm categories={categories as Category[]} />

      <hr className="my-8" />

      {/* Add a link to the new inventory page */}
      <div className="text-center">
        <Link href="/inventory" className="btn-primary">
          View Full Inventory
        </Link>
      </div>
    </main>
  );
}