// src/components/inventory/AddProductModal.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addProduct, FormState, CategoryData } from '@/app/actions';
import Spinner from '@/components/common/Spinner';
import { useToast } from '@/context/ToastContext';
import Portal from '@/components/common/Portal'; // <-- 1. IMPORT THE PORTAL

// --- Type Definitions (No change) ---
type Category = {
  id: number;
  name: string;
};
type FormErrors = {
  name?: string;
  description?: string;
  quantity?: string;
  product_id?: string;
  low_stock_threshold?: string;
  server?: string;
};
const initialState: FormState = {
  name: '',
  description: '',
  quantity: 0,
  product_id: null,
  low_stock_threshold: 10,
};
const initialCategoryState: CategoryData = { categoryId: '', newCategoryName: '' };
type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
};

export default function AddProductModal({ isOpen, onClose, categories }: AddProductModalProps) {
  // --- All component logic (state, useEffects, handleSubmit) stays the same ---
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { addToast: showToast } = useToast();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [categoryData, setCategoryData] = useState<CategoryData>(initialCategoryState);
  const showNewCategoryInput = categoryData.categoryId === 'new';
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (errors.server) {
      const timer = setTimeout(() => setErrors(prev => ({ ...prev, server: undefined })), 3000);
      return () => clearTimeout(timer);
    }
  }, [errors.server]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        resetForm();
        setErrors({});
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateField = (name: string, value: string | number | null | undefined): string | undefined => {
    switch (name) {
        case 'name':
          if (typeof value !== 'string' || !value.trim()) return 'Name is required.';
          if (value.length > 100) return 'Name must be 100 characters or less.';
          break;
        case 'description':
          if (typeof value === 'string' && value.length > 500) return 'Description must be 500 characters or less.';
          break;
        case 'quantity':
           if (value === '' || value === null || value === undefined) return 'Quantity is required.';
           const num = Number(value);
           if (isNaN(num)) return 'Quantity must be a number.';
           if (!Number.isInteger(num)) return 'Quantity must be a whole number.';
           if (num <= 0) return 'Quantity must be greater than 0.';
           break;
        case 'low_stock_threshold':
           if (value === '' || value === null || value === undefined) return 'Low stock threshold is required.';
           const thresholdNum = Number(value);
           if (isNaN(thresholdNum)) return 'Threshold must be a number.';
           if (!Number.isInteger(thresholdNum)) return 'Threshold must be a whole number.';
           if (thresholdNum < 0) return 'Threshold cannot be negative.';
           break;
        case 'product_id':
           if (typeof value === 'string' && value.length > 50) return 'Product ID must be 50 characters or less.';
           break;
        default: break;
      }
      return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error, server: undefined }));
  };
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryData({ ...categoryData, categoryId: e.target.value });
    setErrors(prev => ({ ...prev, server: undefined }));
  };
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryData({ ...categoryData, newCategoryName: e.target.value });
    setErrors(prev => ({ ...prev, server: undefined }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, server: undefined }));
    const newErrors: FormErrors = {};
    let isValid = true;
    (Object.keys(initialState) as Array<keyof FormState>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    if (!categoryData.categoryId) {
       newErrors.server = 'Please select a category.';
       isValid = false;
    }
    if (showNewCategoryInput && !categoryData.newCategoryName.trim()) {
       newErrors.server = 'Please enter a name for the new category.';
       isValid = false;
    }
    setErrors(newErrors);
    if (!isValid) return;
     const dataToSend: FormState = {
       ...formData,
       name: formData.name || '',
       description: formData.description || '',
       quantity: Number(formData.quantity) || 0,
       product_id: formData.product_id || null,
       low_stock_threshold: Number(formData.low_stock_threshold) ?? 10
    };
    onClose();
    startTransition(async () => {
      const result = await addProduct(dataToSend, categoryData);
      if (result.success) {
        showToast(result.message, 'success');
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
    onClose();
  };
  // --- End of logic ---

  if (!isOpen) return null;

  return (
    <Portal> {/* <-- 2. WRAP in Portal */}
      
      {/* 3. Backdrop Div
          - z-50: This now works because it's a sibling of your header.
          - top-16: (MOBILE) Starts 4rem below the top.
          - sm:inset-0: (DESKTOP) Resets to fullscreen.
          - sm:items-center: (DESKTOP) Vertically centers the modal.
      */}
      <div className="fixed top-16 left-0 right-0 bottom-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-0 backdrop-blur-sm sm:inset-0 sm:items-center sm:p-4">

        {/* 4. Modal Container
            - z-[60]: Sits on top of its own backdrop.
        */}
        <div className="relative z-[60] flex h-full w-full flex-col overflow-hidden rounded-none bg-white shadow-none dark:bg-gray-800 sm:h-auto sm:max-w-lg sm:rounded-2xl sm:shadow-xl">

          {/* 5. Modal Header (Unchanged) */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Add New Product
            </h2>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:hover:text-gray-200"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 6. Form Content: Scrollable (Unchanged) */}
          <form onSubmit={handleSubmit} id="add-product-form" className="flex flex-grow flex-col gap-4 overflow-y-auto p-6">

            {/* Server Error Message (Unchanged) */}
            <div className={`transition-all duration-500 ease-in-out ${errors.server ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`} style={{ overflow: 'hidden' }}>
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg"> {errors.server} </div>
            </div>

            {/* Form Fields (Unchanged) */}
            <div className="flex flex-col gap-4">
               <div className="w-full">
                <label htmlFor="modal-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                <input type="text" id="modal-name" name="name" value={formData.name} onChange={handleChange} maxLength={100} required className={`w-full ${errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>
              <div className="w-full sm:w-32">
                <label htmlFor="modal-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input type="number" id="modal-quantity" name="quantity" value={formData.quantity} onChange={handleChange} min="1" step="1" required className={`w-full ${errors.quantity ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
                {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                    <label htmlFor="modal-product_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product ID (Optional)</label>
                    <input type="text" id="modal-product_id" name="product_id" value={formData.product_id || ''} onChange={handleChange} maxLength={50} className={`w-full ${errors.product_id ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
                    {errors.product_id && <p className="text-red-600 text-sm mt-1">{errors.product_id}</p>}
                </div>
                 <div className="flex-grow">
                    <label htmlFor="modal-low_stock_threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Stock Threshold</label>
                    <input type="number" id="modal-low_stock_threshold" name="low_stock_threshold" value={formData.low_stock_threshold ?? 10} onChange={handleChange} min="0" step="1" required className={`w-full ${errors.low_stock_threshold ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
                    {errors.low_stock_threshold && <p className="text-red-600 text-sm mt-1">{errors.low_stock_threshold}</p>}
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                <label htmlFor="modal-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select id="modal-category" name="category" value={categoryData.categoryId} onChange={handleCategoryChange} required className="w-full">
                  <option value="" disabled>-- Select a category --</option>
                  {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                  <option value="new">-- Add New Category --</option>
                </select>
              </div>
              {showNewCategoryInput && (
                <div className="flex-grow">
                  <label htmlFor="modal-newCategoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Category Name</label>
                  <input type="text" id="modal-newCategoryName" name="newCategoryName" value={categoryData.newCategoryName} onChange={handleNewCategoryChange} placeholder="e.g., Hardware" required className="w-full" />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="modal-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
              <textarea id="modal-description" name="description" value={formData.description || ''} onChange={handleChange} maxLength={500} rows={3} className={`w-full ${errors.description ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

          </form>

          {/* 7. Modal Footer (Unchanged) */}
          <div className="flex flex-shrink-0 flex-col gap-4 border-t border-gray-200 p-6 dark:border-gray-700 sm:flex-row">
            <button
              type="submit"
              form="add-product-form"
              disabled={isPending}
              className="btn-primary flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              {isPending && <Spinner />} {isPending ? 'Adding...' : 'Add Product'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="btn-secondary w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </Portal> // <-- 2. End Portal
  );
}