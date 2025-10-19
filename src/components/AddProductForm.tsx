// src/components/AddProductForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { addProduct, FormState, CategoryData } from '@/app/actions'; // 1. Import new type
import Spinner from '@/components/common/Spinner';

// 2. Define Category type
type Category = {
  id: number;
  name: string;
};

// 3. Add categories to props
type AddProductFormProps = {
  categories: Category[];
};

type FormErrors = {
  name?: string;
  description?: string;
  quantity?: string;
  server?: string;
};

const initialState: FormState = {
  name: '',
  description: '',
  quantity: 0,
};

// 4. Add initial state for category
const initialCategoryState: CategoryData = { categoryId: '', newCategoryName: '' };

export default function AddProductForm({ categories }: AddProductFormProps) { // 5. Use prop
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormState>(initialState);
  
  // 6. Add state for category data
  const [categoryData, setCategoryData] = useState<CategoryData>(initialCategoryState);
  const showNewCategoryInput = categoryData.categoryId === 'new';
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const validateField = (name: string, value: string | number): string | undefined => {
    // ... (validation logic is the same)
    switch (name) {
      case 'name':
        if (typeof value !== 'string' || !value) return 'Name is required.';
        if (value.length > 100) return 'Name must be 100 characters or less.';
        break;
      case 'description':
        if (typeof value === 'string' && value.length > 500) {
          return 'Description must be 500 characters or less.';
        }
        break;
      case 'quantity':
        if (value === '') return 'Quantity is required.';
        const num = Number(value);
        if (isNaN(num)) return 'Quantity must be a number.';
        if (!Number.isInteger(num)) return 'Quantity must be a whole number.';
        if (num <= 0) return 'Quantity must be greater than 0.';
        break;
      default:
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error, server: undefined }));
    setSuccessMessage('');
  };
  
  // 7. Add handlers for category inputs
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryData({ ...categoryData, categoryId: e.target.value });
  };
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryData({ ...categoryData, newCategoryName: e.target.value });
  };

// 8. Update handleSubmit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Final validation check
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      // --- THIS IS THE MISSING CODE ---
      const field = key as keyof FormState;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
      // --- END OF MISSING CODE ---
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage('');
      return;
    }
    
    // 9. Add category validation
    if (!categoryData.categoryId) {
      setErrors({ server: 'Please select a category.' });
      return;
    }
    if (showNewCategoryInput && !categoryData.newCategoryName.trim()) {
      setErrors({ server: 'Please enter a name for the new category.' });
      return;
    }

    setErrors({});
    setSuccessMessage('');

    startTransition(async () => {
      // 10. Pass both form data and category data to the action
      const result = await addProduct(
        {
          ...formData,
          quantity: Number(formData.quantity),
        },
        categoryData // <-- Pass new data
      );

      if (result.success) {
        setSuccessMessage(result.message);
        resetForm();
      } else {
        setErrors({ server: result.message });
      }
    });
  };

  const resetForm = () => {
    setFormData(initialState);
    setCategoryData(initialCategoryState); // 11. Reset category
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setSuccessMessage('');
  };

  return (
    // 12. Update container style
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {successMessage && (
          <div className="p-3 bg-green-100 text-green-800 border border-green-300 rounded-lg">
            {successMessage}
          </div>
        )}

        {errors.server && (
          <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded-lg">
            {errors.server}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text" id="name" name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100} required
              className={errors.name ? 'border-red-500' : ''} // Use global style
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="w-full sm:w-32">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number" id="quantity" name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1" step="1" required
              className={errors.quantity ? 'border-red-500' : ''} // Use global style
            />
            {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
          </div>
        </div>

        {/* 13. Add Category Inputs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={categoryData.categoryId}
              onChange={handleCategoryChange}
              required
            >
              <option value="" disabled>-- Select a category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="new">-- Add New Category --</option>
            </select>
          </div>

          {showNewCategoryInput && (
            <div className="flex-grow">
              <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-1">New Category Name</label>
              <input
                type="text"
                id="newCategoryName"
                name="newCategoryName"
                value={categoryData.newCategoryName}
                onChange={handleNewCategoryChange}
                placeholder="e.g., Hardware"
                required
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            id="description" name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500} rows={3}
            className={errors.description ? 'border-red-500' : ''} // Use global style
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary flex items-center justify-center gap-2" // <-- Add flex
          >
            {isPending && <Spinner />} {/* <-- ADD THIS */}
            {isPending ? 'Adding...' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="btn-secondary" // 15. Use global style
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}