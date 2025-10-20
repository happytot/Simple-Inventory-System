// src/components/AddProductForm.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addProduct, FormState, CategoryData } from '@/app/actions';
import Spinner from '@/components/common/Spinner';

// Type Definitions
type Category = {
  id: number;
  name: string;
};

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

const initialCategoryState: CategoryData = { categoryId: '', newCategoryName: '' };

export default function AddProductForm({ categories }: AddProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [categoryData, setCategoryData] = useState<CategoryData>(initialCategoryState);
  const showNewCategoryInput = categoryData.categoryId === 'new';
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // --- ADD THIS HOOK ---
  useEffect(() => {
    // If there is a success message, set a timer
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(''); // Clear the message after 3 seconds
      }, 3000); // 3000 milliseconds = 3 seconds

      // Clean up the timer if the component unmounts or the message changes
      return () => clearTimeout(timer);
    }
  }, [successMessage]); // This effect runs every time 'successMessage' changes
  // --- END OF HOOK ---

  // ... (after the successMessage useEffect)

  // --- ADD THIS HOOK FOR THE ERROR MESSAGE ---
  useEffect(() => {
    // If there is a server error, set a timer
    if (errors.server) {
      const timer = setTimeout(() => {
        setErrors(prev => ({ ...prev, server: undefined })); // Clear the server error
      }, 3000); // 3000 milliseconds = 3 seconds

      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, [errors.server]); // This effect runs every time 'errors.server' changes
  // --- END OF HOOK ---

  const validateField = (name: string, value: string | number): string | undefined => {
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

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryData({ ...categoryData, categoryId: e.target.value });
  };
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryData({ ...categoryData, newCategoryName: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const field = key as keyof FormState;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage('');
      return;
    }

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
      const result = await addProduct(
        {
          ...formData,
          quantity: Number(formData.quantity),
        },
        categoryData
      );

      if (result.success) {
        setSuccessMessage(result.message);
        resetForm();
        router.refresh();
      } else {
        setErrors({ server: result.message });
      }
    });
  };

  const resetForm = () => {
    setFormData(initialState);
    setCategoryData(initialCategoryState);
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setSuccessMessage('');
  };

  return (
    // **1. Updated Container Style:** Changed background, added border
    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Add New Product</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* **2. Updated Message Styles:** Softer background colors */}
       {/* --- UPDATED SUCCESS MESSAGE WITH ANIMATION --- */}
        <div
          className={`
            transition-all duration-500 ease-in-out
            ${successMessage ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
          `}
          style={{ overflow: 'hidden' }} // This clips the content during animation
        >
          <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
            {successMessage}
          </div>
        </div>

        {/* --- UPDATED ERROR MESSAGE WITH ANIMATION --- */}
        <div
          className={`
            transition-all duration-500 ease-in-out
            ${errors.server ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
          `}
          style={{ overflow: 'hidden' }} // This clips the content during animation
        >
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
            {errors.server}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Name Field */}
          <div className="flex-grow">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text" id="name" name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100} required
              // Use global input style + error border
              className={errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Quantity Field */}
          <div className="w-full sm:w-32">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number" id="quantity" name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1" step="1" required
              // Use global input style + error border
              className={errors.quantity ? 'border-red-500 ring-1 ring-red-500' : ''}
            />
            {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
          </div>
        </div>

        {/* Category Inputs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={categoryData.categoryId}
              onChange={handleCategoryChange}
              required
              // Uses global select style
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
                // Uses global input style
              />
            </div>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea
            id="description" name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500} rows={3}
             // Use global textarea style + error border
            className={errors.description ? 'border-red-500 ring-1 ring-red-500' : ''}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-2"> {/* Added padding-top */}
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {isPending && <Spinner />}
            {isPending ? 'Adding...' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}