import Skeleton from "@/components/common/Skeleton";

// This component mimics the AddProductForm
function SkeletonForm() {
  return (
    // Use rounded-2xl to match your component's style
    <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="flex flex-col gap-4">
        {/* Name and Quantity */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-grow" />
          <Skeleton className="h-10 w-full sm:w-32" />
        </div>
        {/* Category and New Category */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-grow" />
        </div>
        {/* Description */}
        <Skeleton className="h-20" />
        {/* Buttons */}
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </div>
  );
}

// This component mimics the InventoryManager
function SkeletonTable() {
  return (
    // Use rounded-2xl to match your component's style
    <div className="bg-white rounded-2xl shadow-lg p-4">
      {/* Skeleton controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <Skeleton className="h-10 w-full md:max-w-xs" />
        <Skeleton className="h-10 w-full md:max-w-xs" />
        <div className="flex w-full md:w-auto items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      {/* Skeleton table content */}
      <div>
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-4/5" />
      </div>
    </div>
  );
}

export default function Loading() {
  // This layout matches your src/app/page.tsx layout
  return (
    <main className="container mx-auto p-8">
      <div className="mb-6">
        {/* This isn't a skeleton, it's part of the static layout */}
        <h1 className="text-3xl font-bold">Inventory</h1>
      </div>
      
      <SkeletonForm />

      <hr className="my-8" />
      
      <SkeletonTable />
    </main>
  );
}