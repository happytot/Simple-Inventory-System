// src/components/Header.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import HeaderClient from './HeaderClient'; // Import the component we just renamed

// Define the type here for our fetch
type Product = {
  quantity: number;
  low_stock_threshold: number;
};

export default async function Header() {
  // 1. Fix the cookies() call for Next.js 15
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // 2. Check for active session (optional but good)
  const { data: { session } } = await supabase.auth.getSession();

  let lowStockCount = 0;

  // 3. Only fetch count if user is logged in
  if (session) {
    const { data: products, error } = await supabase
      .from("Products")
      .select("quantity, low_stock_threshold");

    if (products) {
      lowStockCount = products.filter(
        (p: Product) => p.quantity < p.low_stock_threshold
      ).length;
    }
  }

  // 4. Render the Client Component and pass the count as a prop
  return <HeaderClient lowStockCount={lowStockCount} />;
}