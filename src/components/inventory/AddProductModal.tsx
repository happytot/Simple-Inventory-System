// src/components/inventory/AddProductModal.tsx
'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Keep useRouter
import { addProduct, FormState, CategoryData } from '@/app/actions';
import Spinner from '@/components/common/Spinner';

// Type Definitions (Copied from AddProductForm)
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
  low_stock_threshold: 10, // Default threshold
};

const initialCategoryState: CategoryData = { categoryId: '', newCategoryName: '' };

// --- NEW MODAL PROPS ---
type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  // Optional: Callback after successful add if needed
  // onAddSuccess?: () => void;
};

// --- AddProductForm logic moved inside this component ---
export default function AddProductModal({ isOpen, onClose, categories }: AddProductModalProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // Still need this for refresh
  const [formData, setFormData] = useState<FormState>(initialState);
  const [categoryData, setCategoryData] = useState<CategoryData>(initialCategoryState);
  const showNewCategoryInput = categoryData.categoryId === 'new';
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Auto-clear success message and close modal
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        resetForm(); // Reset form state
        onClose(); // Close the modal
        router.refresh(); // Refresh inventory list AFTER closing
      }, 2000); // Close after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage, onClose, router]); // Added router to dependencies

  // Auto-clear server error message
  useEffect(() => {
    if (errors.server) {
      const timer = setTimeout(() => {
        setErrors(prev => ({ ...prev, server: undefined }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errors.server]);

  // Reset form when modal opens/closes (optional but good practice)
  useEffect(() => {
    if (!isOpen) {
      // Delay reset slightly to allow fade-out animation if you add one
      const timer = setTimeout(() => {
        resetForm();
        setSuccessMessage('');
        setErrors({});
      }, 300); // Adjust timing if needed
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const validateField = (name: string, value: string | number | null | undefined): string | undefined => {
    // ... (Keep existing validation logic) ...
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
    // Handle number inputs specifically if needed, otherwise rely on Number() conversion later
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Re-validate on change
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error, server: undefined }));
    setSuccessMessage(''); // Clear success on edit
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryData({ ...categoryData, categoryId: e.target.value });
    setErrors(prev => ({ ...prev, server: undefined })); // Clear server errors on change
    setSuccessMessage('');
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryData({ ...categoryData, newCategoryName: e.target.value });
     setErrors(prev => ({ ...prev, server: undefined })); // Clear server errors on change
    setSuccessMessage('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage(''); // Clear previous success

    // Final validation
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


    // Prepare data for server action, ensuring correct types
    const dataToSend: FormState = {
       ...formData,
       name: formData.name || '',
       description: formData.description || '',
       quantity: Number(formData.quantity) || 0, // Ensure it's a number
       product_id: formData.product_id || null,
       low_stock_threshold: Number(formData.low_stock_threshold) ?? 10 // Ensure it's a number
    };

    startTransition(async () => {
      const result = await addProduct(dataToSend, categoryData);
      if (result.success) {
        setSuccessMessage(result.message);
        // Don't reset/close here, useEffect handles it
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

  // Use onClose prop for cancel/close actions
  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null; // Don't render if not open

  // --- MODAL JSX STRUCTURE ---
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
        {/* Close Button */}
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Product</h2>

        {/* --- FORM COPIED FROM AddProductForm --- */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Animated Success/Error Messages */}
          <div className={`transition-all duration-500 ease-in-out ${successMessage ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`} style={{ overflow: 'hidden' }}>
            <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg"> {successMessage} </div>
          </div>
          <div className={`transition-all duration-500 ease-in-out ${errors.server ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`} style={{ overflow: 'hidden' }}>
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg"> {errors.server} </div>
          </div>

          {/* Form Fields (Copied and adjusted) */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="modal-name" className="block text-sm font-medium text-white mb-1">Product Name</label>
              <input type="text" id="modal-name" name="name" value={formData.name} onChange={handleChange} maxLength={100} required className={errors.name ? 'border-red-500 ring-1 ring-red-500' : ''} />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="w-full sm:w-32">
              <label htmlFor="modal-quantity" className="block text-sm font-medium text-white mb-1">Quantity</label>
              <input type="number" id="modal-quantity" name="quantity" value={formData.quantity} onChange={handleChange} min="1" step="1" required className={errors.quantity ? 'border-red-500 ring-1 ring-red-500' : ''} />
              {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow">
                  <label htmlFor="modal-product_id" className="block text-sm font-medium text-white mb-1">Product ID (Optional)</label>
                  <input type="text" id="modal-product_id" name="product_id" value={formData.product_id || ''} onChange={handleChange} maxLength={50} className={errors.product_id ? 'border-red-500 ring-1 ring-red-500' : ''} />
                  {errors.product_id && <p className="text-red-600 text-sm mt-1">{errors.product_id}</p>}
              </div>
               <div className="flex-grow"> {/* Adjusted width */}
                  <label htmlFor="modal-low_stock_threshold" className="block text-sm font-medium text-white mb-1">Low Stock Threshold</label>
                  <input type="number" id="modal-low_stock_threshold" name="low_stock_threshold" value={formData.low_stock_threshold ?? 10} onChange={handleChange} min="0" step="1" required className={errors.low_stock_threshold ? 'border-red-500 ring-1 ring-red-500' : ''} />
                  {errors.low_stock_threshold && <p className="text-red-600 text-sm mt-1">{errors.low_stock_threshold}</p>}
              </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="modal-category" className="block text-sm font-medium text-white mb-1">Category</label>
              <select id="modal-category" name="category" value={categoryData.categoryId} onChange={handleCategoryChange} required>
                <option value="" disabled>-- Select a category --</option>
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                <option value="new">-- Add New Category --</option>
              </select>
            </div>
            {showNewCategoryInput && (
              <div className="flex-grow">
                <label htmlFor="modal-newCategoryName" className="block text-sm font-medium text-white mb-1">New Category Name</label>
                <input type="text" id="modal-newCategoryName" name="newCategoryName" value={categoryData.newCategoryName} onChange={handleNewCategoryChange} placeholder="e.g., Hardware" required />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="modal-description" className="block text-sm font-medium text-white mb-1">Description (Optional)</label>
            <textarea id="modal-description" name="description" value={formData.description || ''} onChange={handleChange} maxLength={500} rows={3} className={errors.description ? 'border-red-500 ring-1 ring-red-500' : ''} />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button type="submit" disabled={isPending} className="btn-primary flex items-center justify-center gap-2"> {isPending && <Spinner />} {isPending ? 'Adding...' : 'Add Product'} </button>
            <button type="button" onClick={handleCancel} disabled={isPending} className="btn-secondary"> Cancel </button>
          </div>
        </form>
      </div>
    </div>
  );
}