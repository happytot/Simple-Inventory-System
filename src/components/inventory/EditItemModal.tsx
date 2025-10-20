// src/components/inventory/EditItemModal.tsx
'use client';

// 1. Add new imports
import { useState, useEffect, useTransition } from 'react';
import { updateProduct, FormState, CategoryData } from '@/app/actions'; // Import updateProduct
import Spinner from '@/components/common/Spinner'; // Import Spinner

// Type definitions
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

type FormErrors = {
  name?: string;
  description?: string;
  quantity?: string;
  low_stock_threshold?: string;
  server?: string;
};

// 2. Update props: onSave is now onSaveSuccess
type EditItemModalProps = {
  product: Product | null;
  onClose: () => void;
  onSaveSuccess: (updatedProduct: Product) => void; // Renamed for clarity
  categories: Category[];
};

export default function EditItemModal({
  product,
  onClose,
  onSaveSuccess,
  categories,
}: EditItemModalProps) {
  // 3. Add internal state for form, errors, and saving
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [categoryData, setCategoryData] = useState<CategoryData>({ categoryId: '', newCategoryName: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string>('');
  
  const showNewCategoryInput = categoryData.categoryId === 'new';

  const getInitialCategoryState = (product: Product | null): CategoryData => {
    return {
      categoryId: product?.category_id?.toString() || '',
      newCategoryName: '',
    };
  }
  
  // Effect to populate form when product prop changes
  useEffect(() => {
    if (product) {
      setFormData(product);
      setCategoryData(getInitialCategoryState(product));
      setErrors({}); // Clear errors
      setSuccessMessage(''); // Clear success message
    }
  }, [product]); // Dependency on product

  // Effect to auto-close on success
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        onClose(); // Close the modal
      }, 2000); // 2 seconds
      return () => clearTimeout(timer);
    }
  }, [successMessage, onClose]);
  
  // Effect for server error auto-clear
  useEffect(() => {
    if (errors.server) {
      const timer = setTimeout(() => {
        setErrors(prev => ({ ...prev, server: undefined }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errors.server]);

  // Validation
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Name is required.";
    if (Number(formData.quantity) < 0) newErrors.quantity = "Quantity can't be negative.";
    if (Number(formData.low_stock_threshold) < 0) newErrors.low_stock_threshold = "Threshold can't be negative.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, server: undefined }));
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryData({ ...categoryData, categoryId: e.target.value });
  };
  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryData({ ...categoryData, newCategoryName: e.target.value });
  };

  // 4. Handle form submission internally
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product || !validate()) return;
    
    const updatedFormData: FormState = {
      name: formData.name || '',
      description: formData.description || '',
      quantity: Number(formData.quantity),
      product_id: formData.product_id || '',
      low_stock_threshold: Number(formData.low_stock_threshold)
    };
    
    startTransition(async () => {
      const result = await updateProduct(
      product.id, 
      updatedFormData, 
      categoryData.categoryId,      // Pass categoryId directly
      categoryData.newCategoryName // Pass newCategoryName directly
    );      
      if (result.success && result.updatedProduct) {
        onSaveSuccess(result.updatedProduct); // Update client state in parent
        setSuccessMessage(result.message); // Show success message
        // Modal will auto-close via useEffect
      } else {
        setErrors({ server: result.message });
      }
    });
  };

  if (!product) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Product</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* 5. Add Animated Success/Error Messages */}
          <div
            className={`transition-all duration-500 ease-in-out ${successMessage ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg">
              {successMessage}
            </div>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out ${errors.server ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
            style={{ overflow: 'hidden' }}
          >
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              {errors.server}
            </div>
          </div>
          
          {/* Form Fields... */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input
                type="text" id="name" name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className={errors.name ? 'border-red-500 ring-1 ring-red-500' : ''}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>
            <div className="w-full sm:w-32">
              <label htmlFor="product_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product ID</label>
              <input
                type="text" id="product_id" name="product_id"
                value={formData.product_id || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-32">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <input
                type="number" id="quantity" name="quantity"
                value={formData.quantity || 0}
                onChange={handleChange}
                min="0" step="1"
                className={errors.quantity ? 'border-red-500 ring-1 ring-red-500' : ''}
              />
              {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
            </div>
            <div className="flex-grow">
              <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Stock Threshold</label>
              <input
                type="number" id="low_stock_threshold" name="low_stock_threshold"
                value={formData.low_stock_threshold || 0}
                onChange={handleChange}
                min="0" step="1"
                className={errors.low_stock_threshold ? 'border-red-500 ring-1 ring-red-500' : ''}
              />
              {errors.low_stock_threshold && <p className="text-red-600 text-sm mt-1">{errors.low_stock_threshold}</p>}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                id="category" name="category"
                value={categoryData.categoryId}
                onChange={handleCategoryChange}
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
                <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Category Name</label>
                <input
                  type="text" id="newCategoryName" name="newCategoryName"
                  value={categoryData.newCategoryName}
                  onChange={handleNewCategoryChange}
                  placeholder="e.g., Hardware"
                />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea
              id="description" name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* 6. Update Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex items-center justify-center gap-2"
            >
              {isSaving && <Spinner />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}