'use server';

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateProductId } from "@/lib/utils";

// --- Types ---
export type FormState = {
  name: string;
  description: string;
  quantity: number;
  product_id: string | null;
  low_stock_threshold: number;
};

export type CategoryData = {
  categoryId: string; // Will be a number (as a string) or "new"
  newCategoryName: string;
};

export type AddProductResponse = {
  success: boolean;
  message: string;
  newId?: string;
};

export type UpdateFormState = {
  name: string;
  description: string;
  quantity: number;
  low_stock_threshold: number;
  category_id: number | null;
};

// --- Add Product ---
export async function addProduct(
  data: FormState,
  categoryData: CategoryData
): Promise<AddProductResponse> {
  const supabase = createServerActionClient({ cookies });

  // Validation
  if (!data.name || data.name.trim() === "") {
    return { success: false, message: "Product name is required." };
  }
  if (data.quantity <= 0) {
    return { success: false, message: "Quantity must be greater than 0." };
  }

  // 👇 NEW LOGIC START: Prevent Duplicate Product Names (Fix for TC06)
  const trimmedName = data.name.trim();

  // 1. Check for duplicate name
  const { data: duplicateCheck, error: duplicateError } = await supabase
    .from("Products")
    .select("name")
    .eq("name", trimmedName) // Ensure we compare trimmed names
    .maybeSingle(); // Use maybeSingle to get null if no match

  if (duplicateError) {
    return { success: false, message: `DB Error (Duplicate Check): ${duplicateError.message}` };
  }
  
  // 2. If a product with that name is found, return an error
  if (duplicateCheck) {
    return { success: false, message: `Error: A product with the name "${trimmedName}" already exists.` };
  }
  // 👆 NEW LOGIC END
  
  // Category Logic (This block remains the same)
  let category_id_to_insert: number | null = null;

  if (categoryData.categoryId === "new") {
    // User is creating a new category
    if (!categoryData.newCategoryName.trim()) {
      return { success: false, message: "New category name is required." };
    }
    // ... (rest of the category creation logic) ...

    const newCategoryName = categoryData.newCategoryName.trim();

    const { data: newCategory, error: newCatError } = await supabase
      .from("Categories")
      .insert({ name: newCategoryName })
      .select("id")
      .single();

    if (newCatError) {
      if (newCatError.code === "23505") {
        // Handle unique constraint violation
        return {
          success: false,
          message: `Category "${newCategoryName}" already exists.`,
        };
      }
      return {
        success: false,
        message: `DB Error (Category): ${newCatError.message}`,
      };
    }

    category_id_to_insert = newCategory.id;
  } else if (categoryData.categoryId) {
    // Existing category
    category_id_to_insert = Number(categoryData.categoryId);
  } else {
    return { success: false, message: "Category is required." };
  }

  // Generate new product ID
  const newProductId = generateProductId();

  // Insert product
  const { error } = await supabase.from("Products").insert([
    {
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      price: 0,
      product_id: newProductId,
      category_id: category_id_to_insert,
    },
  ]);

  if (error) {
    return { success: false, message: `Database error: ${error.message}` };
  }

  revalidatePath("/inventory");
  revalidatePath("/categories");

  return {
    success: true,
    message: `Item "${data.name}" added successfully with ID ${newProductId}.`,
    newId: newProductId,
  };
}

// --- Update Product ---
export async function updateProduct(
  productId: number,
  data: FormState, // This includes name, description, quantity, product_id, low_stock_threshold
  categoryIdString: string | null,
  newCategoryNameString: string | null
) {
  'use server';
  const supabase = createServerActionClient({ cookies });
  
  let categoryId: number | null = null;
  
  // 1. Handle Category (Logic looks okay, assuming it works for addProduct)
  if (categoryIdString === 'new') {
    if (!newCategoryNameString || !newCategoryNameString.trim()) {
      return { success: false, message: 'New category name is required.' };
    }
    const trimmedNewName = newCategoryNameString.trim();
    // Check for duplicate category name
    const { data: existingCategory } = await supabase
      .from('Categories')
      .select('id')
      .eq('name', trimmedNewName)
      .maybeSingle(); // Use maybeSingle

    if (existingCategory) {
      categoryId = existingCategory.id;
    } else {
      // Create new category
      const { data: newCategory, error: categoryError } = await supabase
        .from('Categories')
        .insert({ name: trimmedNewName })
        .select('id')
        .single();
        
      if (categoryError) {
        console.error('Error creating category:', categoryError);
        return { success: false, message: 'Failed to create new category.' };
      }
      categoryId = newCategory.id;
    }
  } else if (categoryIdString) {
    categoryId = parseInt(categoryIdString, 10);
  }

  // **2. Prepare Product Data to Update (Corrected)**
  //    Include all fields from FormState plus the category_id
  const productDataToUpdate = {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    quantity: data.quantity, // Already a number from FormState
    product_id: data.product_id?.trim() || null,
    low_stock_threshold: data.low_stock_threshold, // Already a number
    category_id: categoryId, // Determined above
  };

  // **3. Update Product in Database (Corrected)**
  const { data: updatedProduct, error } = await supabase
    .from('Products')
    .update(productDataToUpdate) // Pass the data object here
    .eq('id', productId)        // Specify which product to update
    .select('*, Categories(name)') // Select the updated data
    .single();                   // Expect a single result

  // Error Handling
  if (error) {
     console.error('Update failed:', error.message);
     return { success: false, message: `Update failed: ${error.message}` };
  }
  
  // If update is successful but somehow no product is returned (shouldn't happen with .single())
  if (!updatedProduct) {
      return { success: false, message: 'Update succeeded but failed to retrieve updated product data.' };
  }
  
  // Revalidate and Return Success
  revalidatePath('/inventory');
  
  return { 
    success: true, 
    message: `"${updatedProduct.name}" updated successfully.`,
    updatedProduct: updatedProduct 
  };
}

// --- Delete Product ---
export async function deleteProduct(formData: FormData): Promise<void> {
  const supabase = createServerActionClient({ cookies });

  const id = Number(formData.get("id"));
  if (!id) return;

  const { error } = await supabase.from("Products").delete().eq("id", id);

  if (error) {
    console.error("Delete failed:", error.message);
    return;
  }

  // Refresh the page or relevant path so the deleted product disappears immediately
  revalidatePath("/inventory");
}

// --- Sign Out ---
export async function signOut() {
  'use server';
  const supabase = createServerActionClient({ cookies });
  await supabase.auth.signOut();
  redirect('/login');
}
 // --- END OF FILE ---