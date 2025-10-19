// src/components/inventory/InventoryManager.tsx
'use client';

import { useState, useMemo } from 'react';
import ItemListView from './ItemListView';
import ItemGridView from './ItemGridView';
import { deleteProduct } from '@/app/actions';
import EditItemModal from './EditItemModal';
import LowStockAlert from './LowStockAlert';

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
type InventoryManagerProps = {
  initialProducts: Product[];
  categories: Category[]; // <-- ADDED
};

export default function InventoryManager({ initialProducts, categories }: InventoryManagerProps) { // 3. Use prop
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [view, setView] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10 });
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  // 4. Add state for category filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const lowStockItems = useMemo(() =>
    products.filter(p => p.quantity < p.low_stock_threshold),
  [products]);

  // 5. Update processedItems logic
  const processedItems = useMemo(() => {
    let filteredItems = products;

    if (showOnlyLowStock) {
      filteredItems = filteredItems.filter(
        (product) => product.quantity < product.low_stock_threshold
      );
    }
    
    // 6. Apply Category Filter
    if (categoryFilter !== 'all') {
      filteredItems = filteredItems.filter(
        (product) => product.category_id === Number(categoryFilter)
      );
    }

    if (searchTerm) {
      filteredItems = filteredItems.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.product_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filteredItems.sort((a, b) => {
      // ... (sort logic is the same)
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA === null) return 1;
      if (valB === null) return -1;
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filteredItems;
  }, [products, searchTerm, sortConfig, showOnlyLowStock, categoryFilter]); // 7. Add dependency

  const paginatedItems = processedItems.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );
  const totalPages = Math.ceil(processedItems.length / pagination.itemsPerPage);

  const handleSort = (key: keyof Product) => {
    setSortConfig((prevConfig) => {
      const direction = prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
  };
  const handleCloseEditModal = () => {
    setEditingProduct(null);
  };
  const handleSaveEdit = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  if (initialProducts.length === 0) {
    // ... (empty state is the same)
  }

// 8. Update the JSX
  return (
    <div>
      <LowStockAlert items={lowStockItems} onEdit={handleOpenEditModal} />

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        {/* Search Bar */}
        <div className="w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by Name or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPagination({ ...pagination, currentPage: 1 });
            }}
          />
        </div>
        
        {/* 9. Add Category Filter Dropdown */}
        <div className="w-full md:max-w-xs">
          <select
            className="w-full" // Styled by globals.css
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPagination({ ...pagination, currentPage: 1 }); // Reset page
            }}
          >
            <option value="all">Filter by Category (All)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort and View Controls */}
        <div className="flex w-full md:w-auto items-center gap-4">
          <select
            className="flex-grow md:flex-grow-0"
            onChange={(e) => handleSort(e.target.value as keyof Product)}
            value={sortConfig.key}
          >
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="created_at">Sort by Date Added</option>
          </select>

          {/* Segmented Control Style */}
          <div className="hidden md:flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1 rounded-md text-sm font-semibold ${view === 'list' ? 'bg-white text-apple-blue shadow' : 'bg-transparent text-gray-700'}`}
            >
              List
            </button>
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1 rounded-md text-sm font-semibold ${view === 'grid' ? 'bg-white text-apple-blue shadow' : 'bg-transparent text-gray-700'}`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* --- THIS IS THE MISSING CHECKBOX CODE --- */}
      <div className="flex justify-end mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded text-apple-blue focus:ring-apple-blue"
            checked={showOnlyLowStock}
            onChange={(e) => {
              setShowOnlyLowStock(e.target.checked); // <-- This uses setShowOnlyLowStock
              setPagination({ ...pagination, currentPage: 1 }); 
            }}
          />
          <span className="text-sm font-medium text-gray-700">
            Show Only Low Stock Items
          </span>
        </label>
      </div>

      {/* DYNAMIC VIEW (logic is the same) */}
      <div className="md:hidden">
        <ItemGridView items={paginatedItems} deleteAction={deleteProduct} onEdit={handleOpenEditModal} />
      </div>
      <div className="hidden md:block">
        {view === 'list' ? (
          <ItemListView items={paginatedItems} deleteAction={deleteProduct} onEdit={handleOpenEditModal} />
        ) : (
          <ItemGridView items={paginatedItems} deleteAction={deleteProduct} onEdit={handleOpenEditModal} />
        )}
      </div>

      {/* --- THIS IS THE MISSING PAGINATION CODE --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6">
        <div>
          <select 
            value={pagination.itemsPerPage} 
            onChange={(e) => setPagination({ currentPage: 1, itemsPerPage: Number(e.target.value) })}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <button 
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })} 
            disabled={pagination.currentPage === 1} 
            className="btn-secondary"
          >
            Previous
          </button>
          <span className="self-center px-4 text-gray-700">
            Page {pagination.currentPage} of {totalPages} {/* <-- This uses totalPages */}
          </span>
          <button 
            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })} 
            disabled={pagination.currentPage === totalPages} 
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      </div>

      {/* 10. Pass categories to the modal */}
      <EditItemModal
        product={editingProduct}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        categories={categories}
      />
    </div>
  );
}