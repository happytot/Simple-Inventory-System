// src/components/AddProductForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { addProduct, FormState } from '@/app/actions'; // Import our new action

// Define the shape of our errors state
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

export default function AddProductForm() {
  // useTransition is for pending states with Server Actions
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

// Real-time validation function
  const validateField = (name: string, value: string | number): string | undefined => {
    switch (name) {
      case 'name':
        // Check if it's not a string or is an empty string
        if (typeof value !== 'string' || !value) return 'Name is required.';
        if (value.length > 100) return 'Name must be 100 characters or less.';
        break;
      case 'description':
        // Only check length if it's a string
        if (typeof value === 'string' && value.length > 500) {
          return 'Description must be 500 characters or less.';
        }
        break;
      case 'quantity':
        // This logic works for both numbers and strings
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

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error, server: undefined }));
    setSuccessMessage('');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Final validation check
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach((key) => {
      const field = key as keyof FormState;
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSuccessMessage('');
      return;
    }

    setErrors({});
    setSuccessMessage('');

    // Call the server action inside startTransition
    startTransition(async () => {
      const result = await addProduct({
        ...formData,
        quantity: Number(formData.quantity), // Ensure quantity is a number
      });

      if (result.success) {
        setSuccessMessage(result.message);
        resetForm();
      } else {
        setErrors({ server: result.message });
      }
    });
  };

  // Clear form
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setSuccessMessage('');
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Success Message */}
        {successMessage && (
          <div className="p-3 bg-green-100 text-green-800 border border-green-300 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Server Error Message */}
        {errors.server && (
          <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded-md">
            {errors.server}
          </div>
        )}
        
        {/* Top row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Name Field */}
          <div className="flex-grow">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              required
              className={`p-2 border rounded-md w-full ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          
          {/* Quantity Field */}
          <div className="w-full sm:w-32">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              step="1"
              required
              className={`p-2 border rounded-md w-full ${errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            className={`p-2 border rounded-md w-full ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isPending ? 'Adding...' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}