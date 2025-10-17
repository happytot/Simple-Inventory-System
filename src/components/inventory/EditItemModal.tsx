// src/components/inventory/EditItemModal.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { updateProduct, UpdateFormState } from '@/app/actions';

type Product = {
  id: number; name: string; quantity: number; description: string | null; product_id: string | null; created_at: string;
};

type EditItemModalProps = {
  product: Product | null;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
};

const initialState: UpdateFormState = { name: '', description: '', quantity: 0 };

export default function EditItemModal({ product, onClose, onSave }: EditItemModalProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<UpdateFormState>(initialState);
  const [error, setError] = useState<string>('');

  // When a product is selected to be edited, pre-fill the form
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        quantity: product.quantity,
      });
    } else {
      // Reset form when modal is closed
      setFormData(initialState);
      setError('');
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    // Basic client-side validation
    if (!formData.name.trim()) {
      setError('Product name cannot be empty.');
      return;
    }
    const quantityNum = Number(formData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }

    // Confirmation dialog
    const isConfirmed = window.confirm(`Save changes to "${product.name}"?`);
    if (!isConfirmed) return;

    setError('');
    
    startTransition(async () => {
      const result = await updateProduct(product.id, {
        ...formData,
        quantity: quantityNum,
      });

      if (result.success) {
        // This is the optimistic UI update!
        onSave({ ...product, ...formData, quantity: quantityNum });
        onClose(); // Close the modal on success
      } else {
        setError(result.message);
      }
    });
  };

  if (!product) return null; // Don't render anything if no product is being edited

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      {/* Modal Content */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Item</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Product ID (Read-only)</label>
            <input
              type="text"
              value={product.product_id || 'N/A'}
              readOnly
              className="p-2 border rounded-md w-full bg-gray-100"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              required
              className="p-2 border rounded-md w-full"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
              className="p-2 border rounded-md w-full"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="p-2 border rounded-md w-full"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}