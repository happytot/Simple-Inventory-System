// src/components/inventory/InventoryManager.tsx
'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ItemListView from './ItemListView';
import ItemGridView from './ItemGridView';
import { deleteProduct } from '@/app/actions';
import EditItemModal from './EditItemModal';
import LowStockAlert from './LowStockAlert';
import useDebounce from '@/hooks/useDebounce';
import NoResults from '@/components/common/NoResults';
import FilterDropdown from './FilterDropdown';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import AddProductModal from './AddProductModal'; // Ensure this is imported

// --- TYPE DEFINITIONS ---
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

type InventoryManagerProps = {
 initialProducts: Product[];
 categories: Category[];
};

// --- INITIAL STATE FOR FILTERS ---
const initialFilterState = {
 stockStatus: 'all',
 category: 'all',
 date: 'all',
 quantity: { min: '', max: '' },
};

export default function InventoryManager({ initialProducts, categories }: InventoryManagerProps) {

 // --- STATE MANAGEMENT ---
 const [products, setProducts] = useState<Product[]>(initialProducts);
 const [editingProduct, setEditingProduct] = useState<Product | null>(null);
 const [view, setView] = useState<'list' | 'grid'>('list');
 const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 10 });

 const [searchTerm, setSearchTerm] = useState('');
 const [stockStatusFilter, setStockStatusFilter] = useState(initialFilterState.stockStatus);
 const [categoryFilter, setCategoryFilter] = useState(initialFilterState.category);
 const [dateFilter, setDateFilter] = useState(initialFilterState.date);
 const [quantityFilter, setQuantityFilter] = useState(initialFilterState.quantity);

 const [sortConfig, setSortConfig] = useState<{ key: keyof Product; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });

 const [isDeleting, startDeleteTransition] = useTransition();
 const [productToDelete, setProductToDelete] = useState<Product | null>(null);
 const router = useRouter();

 const [isAddModalOpen, setIsAddModalOpen] = useState(false);

 useEffect(() => {
   setProducts(initialProducts);
 }, [initialProducts]);

 const debouncedSearchTerm = useDebounce(searchTerm, 300);

 // --- MEMOIZED CALCULATIONS ---
 const lowStockItems = useMemo(() =>
   products.filter(p => p.quantity < p.low_stock_threshold),
 [products]);

 const processedItems = useMemo(() => {
   let filteredItems = products;
   // ... (Filtering Logic A-E) ...
    if (stockStatusFilter === 'inStock') {
      filteredItems = filteredItems.filter(p => p.quantity >= p.low_stock_threshold);
    } else if (stockStatusFilter === 'lowStock') {
      filteredItems = filteredItems.filter(p => p.quantity < p.low_stock_threshold && p.quantity > 0);
    } else if (stockStatusFilter === 'outOfStock') {
      filteredItems = filteredItems.filter(p => p.quantity === 0);
    }
    if (categoryFilter !== 'all') {
      filteredItems = filteredItems.filter(p => p.category_id === Number(categoryFilter));
    }
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date(now);
      const daysAgo = dateFilter === '7days' ? 7 : 30;
      filterDate.setDate(now.getDate() - daysAgo);
      filteredItems = filteredItems.filter(p => new Date(p.created_at) >= filterDate);
    }
    const minQty = parseFloat(quantityFilter.min);
    const maxQty = parseFloat(quantityFilter.max);
    if (!isNaN(minQty)) {
      filteredItems = filteredItems.filter(p => p.quantity >= minQty);
    }
    if (!isNaN(maxQty)) {
      filteredItems = filteredItems.filter(p => p.quantity <= maxQty);
    }
    if (debouncedSearchTerm) {
      const lowerSearch = debouncedSearchTerm.toLowerCase();
      filteredItems = filteredItems.filter(p =>
        p.name.toLowerCase().includes(lowerSearch) ||
        (p.description && p.description.toLowerCase().includes(lowerSearch)) ||
        (p.product_id && p.product_id.toLowerCase().includes(lowerSearch))
      );
    }

   // Sorting Logic
   if (sortConfig.key) {
     filteredItems = [...filteredItems].sort((a, b) => {
       const valA = a[sortConfig.key];
       const valB = b[sortConfig.key];
       if (valA === null) return sortConfig.direction === 'asc' ? 1 : -1;
       if (valB === null) return sortConfig.direction === 'asc' ? -1 : 1;
       if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
       if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
       return 0;
     });
   }

   return filteredItems;
 }, [
   products,
   debouncedSearchTerm,
   stockStatusFilter,
   categoryFilter,
   dateFilter,
   quantityFilter,
   sortConfig
 ]);

 // Early return for empty initial products
 if (initialProducts.length === 0) {
   return (
     <div className="text-center bg-white p-12 rounded-2xl shadow-lg dark:bg-gray-800">
       {/* --- ADD BUTTON HERE TOO for empty state --- */}
       <div className="mb-6 flex justify-end">
         <button
           onClick={() => setIsAddModalOpen(true)}
           className="btn-primary mb-4" // Added margin-bottom
         >
           + Add New Product
         </button>
       </div>
       {/* --- END ADD --- */}
       <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">No Products Yet</h3>
       <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
         Add your first product using the button above.
       </p>
        {/* Render Add modal even in empty state */}
       <AddProductModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          categories={categories}
       />
     </div>
   );
 }

 const paginatedItems = processedItems.slice(
   (pagination.currentPage - 1) * pagination.itemsPerPage,
   pagination.currentPage * pagination.itemsPerPage
 );
 const totalPages = Math.ceil(processedItems.length / pagination.itemsPerPage);

 // --- EVENT HANDLERS ---
 const handleOpenEditModal = (product: Product) => setEditingProduct(product);
 const handleCloseEditModal = () => setEditingProduct(null);
 const handleSaveEdit = (updatedProduct: Product) => {
  setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
 };

 const handleClearFilters = () => {
   setSearchTerm('');
   setStockStatusFilter(initialFilterState.stockStatus);
   setCategoryFilter(initialFilterState.category);
   setDateFilter(initialFilterState.date);
   setQuantityFilter(initialFilterState.quantity);
   setSortConfig({ key: 'created_at', direction: 'desc' });
   setPagination({ ...pagination, currentPage: 1 });
 };

 const resetToPageOne = () => setPagination({ ...pagination, currentPage: 1 });

 const handleSort = (key: keyof Product) => {
   setSortConfig((prevConfig) => {
     const direction = prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc';
     return { key, direction };
   });
   resetToPageOne();
 };

 // Delete Handlers
 const handleOpenDeleteModal = (product: Product) => {
  setProductToDelete(product);
 };
 const handleCloseDeleteModal = () => {
  setProductToDelete(null);
 };
 const handleConfirmDelete = () => {
  if (!productToDelete) return;
  startDeleteTransition(async () => {
    const formData = new FormData();
    formData.append('id', productToDelete.id.toString());
    await deleteProduct(formData);
    setProductToDelete(null);
    router.refresh();
  });
 };

 // --- RENDER ---
 // ** REMOVED EXTRA return AND div HERE **
 return (
   <div>
     {/* --- MOVED "Add New Product" BUTTON HERE --- */}
     <div className="mb-6 flex justify-end">
       <button
         onClick={() => setIsAddModalOpen(true)}
         className="btn-primary"
       >
         + Add Product
       </button>
     </div>
     {/* --- END MOVE --- */}

     <LowStockAlert items={lowStockItems} onEdit={handleOpenEditModal} />

     {/* Search Bar */}
     <div className="mb-6">
       <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Products</label>
       <input
         type="text"
         id="search"
         placeholder="Search by Name, ID, or Description..."
         value={searchTerm}
         onChange={(e) => {
           setSearchTerm(e.target.value);
           resetToPageOne();
         }}
       />
     </div>

     {/* Filter Controls Row */}
     <div className="mb-6 p-4 rounded-2xl shadow-lg">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
         {/* Stock Status */}
         <div>
           <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Status</label>
           <select
             id="stockStatus"
             value={stockStatusFilter}
             onChange={(e) => {
               setStockStatusFilter(e.target.value);
               resetToPageOne();
             }}
           >
             <option value="all">All Statuses</option>
             <option value="inStock">In Stock</option>
             <option value="lowStock">Low Stock</option>
             <option value="outOfStock">Out of Stock</option>
           </select>
         </div>
         {/* Category */}
         <div>
           <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
           <select
             id="category"
             value={categoryFilter}
             onChange={(e) => {
               setCategoryFilter(e.target.value);
               resetToPageOne();
             }}
           >
             <option value="all">All Categories</option>
             {categories.map((cat) => (
               <option key={cat.id} value={cat.id}>
                 {cat.name}
               </option>
             ))}
           </select>
         </div>
         {/* Filter Dropdown */}
         <FilterDropdown
           dateFilter={dateFilter}
           quantityFilter={quantityFilter}
           setDateFilter={setDateFilter}
           setQuantityFilter={setQuantityFilter}
           onClearFilters={handleClearFilters}
           resetToPageOne={resetToPageOne}
         />
       </div>
     </div>

     {/* Result Count, Sort & View Toggle Row */}
     <div className="flex flex-col md:flex-row md:items-center mb-4 gap-4">
       {/* Left Side */}
       <div className="flex items-center gap-4 w-full md:w-auto">
         <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0 whitespace-nowrap">
           Showing {processedItems.length} of {products.length} items
         </span>
         {/* Sort Dropdown */}
         <div className="relative min-w-[150px] flex-shrink">
           <label htmlFor="sortOrder" className="sr-only">Sort by</label>
           <select
             id="sortOrder"
             className="text-sm w-full appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-apple-blue"
             value={sortConfig.key}
             onChange={(e) => handleSort(e.target.value as keyof Product)}
           >
             <option value="created_at">Sort: Date Added</option>
             <option value="name">Sort: Name</option>
             <option value="quantity">Sort: Quantity</option>
           </select>
           {/* Arrow */}
           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
               <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
           </div>
         </div>
       </div>
       {/* Right Side (Desktop Toggle) */}
       <div className="hidden md:flex bg-gray-200 p-1 rounded-lg dark:bg-gray-700 flex-shrink-0 md:ml-auto">
         <button
           onClick={() => setView('list')}
           className={`px-3 py-1 rounded-md text-sm font-semibold ${view === 'list' ? 'bg-white text-apple-blue shadow dark:bg-gray-600 dark:text-gray-100' : 'bg-transparent text-gray-700 dark:text-gray-300'}`}
         > List </button>
         <button
           onClick={() => setView('grid')}
           className={`px-3 py-1 rounded-md text-sm font-semibold ${view === 'grid' ? 'bg-white text-apple-blue shadow dark:bg-gray-600 dark:text-gray-100' : 'bg-transparent text-gray-700 dark:text-gray-300'}`}
         > Grid </button>
       </div>
     </div>

     {/* Dynamic View & Pagination */}
     {processedItems.length === 0 ? (
       <NoResults />
     ) : (
       <>
         <div className="md:hidden">
           <ItemGridView items={paginatedItems} onDelete={handleOpenDeleteModal} onEdit={handleOpenEditModal} />
         </div>
         <div className="hidden md:block">
           {view === 'list' ? (
             <ItemListView items={paginatedItems} onDelete={handleOpenDeleteModal} onEdit={handleOpenEditModal} />
           ) : (
             <ItemGridView items={paginatedItems} onDelete={handleOpenDeleteModal} onEdit={handleOpenEditModal} />
           )}
         </div>

         {/* Pagination */}
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
             > Previous </button>
             <span className="self-center px-4 text-gray-700 dark:text-gray-300">
               Page {pagination.currentPage} of {totalPages}
             </span>
             <button
               onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
               disabled={pagination.currentPage === totalPages}
               className="btn-secondary"
             > Next </button>
           </div>
         </div>
       </>
     )}

     {/* Modals */}
     <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isConfirming={isDeleting}
        title="Delete Product?"
        message={
          productToDelete && (
            <>
              Are you sure you want to delete
              <strong className="text-gray-900 dark:text-gray-100"> {productToDelete.name}</strong>?
              <br />
              This action cannot be undone.
            </>
          )
        }
     />

     <EditItemModal
       product={editingProduct}
       onClose={handleCloseEditModal}
       onSaveSuccess={handleSaveEdit}
       categories={categories}
     />

     <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
     />
   </div>
 );
}