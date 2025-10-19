// src/components/inventory/EditItemModal.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { updateProduct, UpdateFormState } from '@/app/actions';
import Spinner from '@/components/common/Spinner';

// 1. Define Category type
type Category = {
  id: number;
  name: string;
};

// Product type is already correct
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

// 2. Add categories to props
type EditItemModalProps = {
  product: Product | null;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
  categories: Category[]; // <-- ADDED
};

// 3. Update initialState
const initialState: UpdateFormState = { 
  name: '', 
  description: '', 
  quantity: 0, 
  low_stock_threshold: 5, 
  category_id: null 
};

export default function EditItemModal({ product, onClose, onSave, categories }: EditItemModalProps) { // 4. Use prop
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<UpdateFormState>(initialState);
  const [error, setError] = useState<string>('');

  // 5. Update useEffect
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        quantity: product.quantity,
        low_stock_threshold: product.low_stock_threshold,
        category_id: product.category_id, // <-- ADDED
      });
    } else {
      setFormData(initialState);
      setError('');
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Handle 'category_id' as a number
    const newValue = name === 'category_id' ? (value ? Number(value) : null) : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  // 6. Update handleSubmit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    // ... (existing validation)
    const quantityNum = Number(formData.quantity);
    const thresholdNum = Number(formData.low_stock_threshold);
    // ...

    const isConfirmed = window.confirm(`Save changes to "${product.name}"?`);
    if (!isConfirmed) return;

    setError('');
    
    startTransition(async () => {
      const formDataToSubmit: UpdateFormState = {
        ...formData,
        quantity: quantityNum,
        low_stock_threshold: thresholdNum,
        category_id: formData.category_id ? Number(formData.category_id) : null
      };

      const result = await updateProduct(product.id, formDataToSubmit);

      if (result.success) {
        // Optimistic update
        onSave({ 
          ...product, 
          ...formDataToSubmit,
          // Find the category name for the optimistic update
          Categories: formDataToSubmit.category_id 
            ? { name: categories.find(c => c.id === formDataToSubmit.category_id)?.name || '' } 
            : null
        });
        onClose();
      } else {
        setError(result.message);
      }
    });
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Item</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* ... (Product ID input) ... */}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text" id="name" name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100} required
            />
          </div>
          
          {/* 7. Add Category Dropdown */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id || ''} // Use empty string for "Uncategorized"
              onChange={handleChange}
            >
              <option value="">-- Uncategorized --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number" id="quantity" name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0" required
              />
            </div>
            
            <div className="flex-1">
              <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
              <input
                type="number" id="low_stock_threshold" name="low_stock_threshold"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                min="0" required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description" name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary flex items-center justify-center gap-2" // <-- Add flex
            >
              {isPending && <Spinner />} {/* <-- ADD THIS */}
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}