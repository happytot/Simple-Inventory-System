// src/components/common/ConfirmationModal.tsx
'use client';

import Spinner from '@/components/common/Spinner';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  isConfirming?: boolean; // To show a loading spinner
};

// Warning Icon
function WarningIcon() {
  return (
    <svg className="w-12 h-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  isConfirming = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div 
        className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-md text-center"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <WarningIcon />
        
        {/* Title */}
        <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4">
          {title}
        </h2>
        
        {/* Message */}
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          {message}
        </div>
        
        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="btn-secondary w-full"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="btn-danger w-full flex items-center justify-center gap-2"
          >
            {isConfirming && <Spinner />}
            {isConfirming ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}