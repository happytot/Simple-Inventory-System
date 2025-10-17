// src/app/actions.ts
'use server';

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateProductId } from "@/lib/utils"; // Import our new generator

// Define the type for the data we expect from the form
export type FormState = {
  name: string;
  description: string;
  quantity: number;
};

// Define the type for the object we'll return
type AddProductResponse = {
  success: boolean;
  message: string;
  newId?: string;
};

export async function addProduct(data: FormState): Promise<AddProductResponse> {
  const supabase = createServerActionClient({ cookies });

  // 1. Validation (matches your new criteria)
  if (!data.name || data.name.trim() === "") {
    return { success: false, message: "Product name is required." };
  }
  if (data.quantity <= 0) {
    return { success: false, message: "Quantity must be greater than 0." };
  }
  if (data.name.length > 100) {
    return { success: false, message: "Name must be 100 characters or less." };
  }
  if (data.description && data.description.length > 500) {
    return { success: false, message: "Description must be 500 characters or less." };
  }

  // 2. Generate the new ID
  const newProductId = generateProductId();

  // 3. Check for duplicate name (as requested)
  let warning = "";
  const { data: duplicateCheck } = await supabase
    .from("Products")
    .select("name")
    .eq("name", data.name)
    .single();

  if (duplicateCheck) {
    warning = ` Warning: A product with the name "${data.name}" already exists.`;
  }

  // 4. Insert the new product
  const { error } = await supabase.from("Products").insert([
    {
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      price: 0, // We didn't have price in the new AC, setting to 0
      product_id: newProductId, // Add our new custom ID
    },
  ]);

  if (error) {
    return { success: false, message: `Database error: ${error.message}` };
  }

  // 5. Revalidate the page and return success
  revalidatePath("/");
  return {
    success: true,
    message: `Item "${data.name}" added successfully with ID ${newProductId}.${warning}`,
    newId: newProductId,
  };
}

// --- Other Actions (Moved from page.tsx) ---

export async function deleteProduct(formData: FormData) {
  'use server';
  const supabase = createServerActionClient({ cookies });
  const id = parseInt(formData.get("id") as string, 10);

  const { error } = await supabase.from("Products").delete().eq('id', id);

  if (error) console.error("Error deleting product:", error);

  revalidatePath("/");
}

export async function signOut() {
  'use server';
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();
  redirect('/login');
}

// Define the type for the data we expect for an update
export type UpdateFormState = {
  name: string;
  description: string;
  quantity: number;
};

export async function updateProduct(
  id: number,
  data: UpdateFormState
): Promise<{ success: boolean; message: string }> {
  const supabase = createServerActionClient({ cookies });

  // 1. Server-side validation
  if (!data.name || data.name.trim() === "") {
    return { success: false, message: "Product name is required." };
  }
  if (data.quantity <= 0) {
    return { success: false, message: "Quantity must be greater than 0." };
  }
  // Add other validation rules as needed...

  // 2. Update the product in the database
  const { error } = await supabase
    .from("Products")
    .update({
      name: data.name,
      description: data.description,
      quantity: data.quantity,
    })
    .eq("id", id); // Find the product by its unique database ID

  if (error) {
    return { success: false, message: `Database error: ${error.message}` };
  }

  // 3. Revalidate the path to ensure the list is fresh
  revalidatePath("/");
  return { success: true, message: `Successfully updated "${data.name}".` };
}