// src/components/inventory/InventoryManager.tsx
'use client';

import { useState, useMemo } from 'react';
import ItemListView from './ItemListView';
import ItemGridView from './ItemGridView';
import { deleteProduct } from '@/app/actions';
import EditItemModal from './EditItemModal'; // 1. Import the new modal

// ... (keep the Product type definition the same)
type Product = {
  id: number; name: string; quantity: number; description: string | null; product_id: string | null; created_at: string;
};
// ... (keep the InventoryManagerProps type the same)
type InventoryManagerProps = {
  initialProducts: Product[];
};

export default function InventoryManager({ initialProducts }: InventoryManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  // 2. Add state for the modal and the product being edited
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // ... (keep all the other state and the `useMemo` block the same)
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10 });

  const processedItems = useMemo(() => {
    // ... no changes inside here
    let filteredItems = products;

    if (searchTerm) {
      filteredItems = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.product_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    filteredItems.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA === null) return 1;
      if (valB === null) return -1;
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return filteredItems;
  }, [products, searchTerm, sortConfig]);

  const paginatedItems = processedItems.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );
  const totalPages = Math.ceil(processedItems.length / pagination.itemsPerPage);

  const handleSort = (key: keyof Product) => {
    // ... no changes here
    setSortConfig((prevConfig) => {
      const direction = prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
      return { key, direction };
    });
  };

  // 3. Add handlers for opening/closing the modal and saving
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
  };
  const handleCloseEditModal = () => {
    setEditingProduct(null);
  };
  const handleSaveEdit = (updatedProduct: Product) => {
    // This is the optimistic UI update logic!
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };


  // ... (keep the `if (initialProducts.length === 0)` block the same)

  return (
    <div>
      {/* ... (keep the CONTROLS section the same) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="w-full md:max-w-xs">
          <input type="text" placeholder="Search by Name or ID..." className="p-2 border rounded-md w-full" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPagination({ ...pagination, currentPage: 1 }); }} />
        </div>
        <div className="flex items-center gap-4">
          <select className="p-2 border rounded-md" onChange={(e) => handleSort(e.target.value as keyof Product)} value={sortConfig.key}>
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="created_at">Sort by Date Added</option>
          </select>
          <div className="flex border rounded-md">
            <button onClick={() => setView('list')} className={`px-3 py-2 ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-white'}`}>List</button>
            <button onClick={() => setView('grid')} className={`px-3 py-2 ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-white'}`}>Grid</button>
          </div>
        </div>
      </div>

      {/* 4. Update the view components to pass the onEdit handler */}
      {view === 'list' ? (
        <ItemListView items={paginatedItems} deleteAction={deleteProduct} onEdit={handleOpenEditModal} />
      ) : (
        <ItemGridView items={paginatedItems} deleteAction={deleteProduct} onEdit={handleOpenEditModal} />
      )}

      {/* ... (keep the PAGINATION CONTROLS section the same) */}
      <div className="flex justify-between items-center mt-6">
        <div>
          <select className="p-2 border rounded-md" value={pagination.itemsPerPage} onChange={(e) => setPagination({ currentPage: 1, itemsPerPage: Number(e.target.value) })}>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })} disabled={pagination.currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">Previous</button>
          <span className="self-center">Page {pagination.currentPage} of {totalPages}</span>
          <button onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })} disabled={pagination.currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">Next</button>
        </div>
      </div>

      {/* 5. Render the modal conditionally */}
      <EditItemModal 
        product={editingProduct} 
        onClose={handleCloseEditModal} 
        onSave={handleSaveEdit}
      />
    </div>
  );
}