// src/components/inventory/FilterDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

// Define the shape of the props this component expects
type FilterDropdownProps = {
  // Filter states
  dateFilter: string;
  quantityFilter: { min: string; max: string };
  // Filter setters
  setDateFilter: (value: string) => void;
  // Explicitly type the setter function
  setQuantityFilter: React.Dispatch<React.SetStateAction<{ min: string; max: string }>>;
  // Clear function
  onClearFilters: () => void;
  // Reset pagination
  resetToPageOne: () => void;
};

// Filter Icon
function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.572a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
  );
}

export default function FilterDropdown({
  dateFilter, quantityFilter,
  setDateFilter, setQuantityFilter,
  onClearFilters, resetToPageOne
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary w-full flex items-center justify-center"
      >
        <FilterIcon />
        More Filters
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        // --- REMOVED bg-white dark:bg-gray-800 FROM THIS LINE ---
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-10 p-4">
          <div className="flex flex-col gap-4">
            {/* Date Added Filter */}
            <div>
              <label htmlFor="dateFilterDropdown" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Added</label>
              <select
                id="dateFilterDropdown"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  resetToPageOne();
                }}
              >
                <option value="all">Any Date</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>

            {/* Quantity Min Filter */}
            <div>
              <label htmlFor="minQtyDropdown" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. Quantity</label>
              <input
                type="number"
                id="minQtyDropdown"
                placeholder="0"
                min="0"
                value={quantityFilter.min}
                onChange={(e) => {
                  // Add explicit type for 'prev'
                  setQuantityFilter((prev: { min: string; max: string; }) => ({ ...prev, min: e.target.value }));
                  resetToPageOne();
                }}
              />
            </div>

            {/* Quantity Max Filter */}
            <div>
              <label htmlFor="maxQtyDropdown" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max. Quantity</label>
              <input
                type="number"
                id="maxQtyDropdown"
                placeholder="Any"
                min="0"
                value={quantityFilter.max}
                onChange={(e) => {
                  // Add explicit type for 'prev'
                  setQuantityFilter((prev: { min: string; max: string; }) => ({ ...prev, max: e.target.value }));
                  resetToPageOne();
                }}
              />
            </div>

            {/* Clear Button */}
            <button
              onClick={() => {
                 onClearFilters();
                 setIsOpen(false); // Close dropdown after clearing
              }}
              className="btn-secondary w-full mt-2"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}