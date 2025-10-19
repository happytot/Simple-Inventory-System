// src/components/common/NoResults.tsx
function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

export default function NoResults() {
  return (
    <div className="text-center bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-lg">
      <SearchIcon />
      <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">No Matching Items</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        No items were found matching your current search or filter criteria.
      </p>
    </div>
  );
}