// src/context/ToastContext.tsx
'use client';

import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';

// --- TYPE DEFINITIONS ---
export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextProps {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// --- TOAST ITEM COMPONENT (With Animations & Style) ---
interface ToastItemProps {
  message: string;
  type: ToastType;
}

const ToastItem: React.FC<ToastItemProps> = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(false); // Start invisible

  useEffect(() => {
    // 1. Fixes delay: Set visibility almost immediately (10ms)
    // This allows React to render the initial state (invisible)
    // and then apply the transition to the visible state.
    const entryTimer = setTimeout(() => setIsVisible(true), 10);

    // 2. Start exit animation before component is removed
    // Total duration (3000ms) - animation duration (300ms) = 2700ms
    const exitTimer = setTimeout(() => setIsVisible(false), 2700);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
    };
  }, []); // Run only once when the toast is created

  // 3. "Apple Feel" Styles: Semi-transparent backgrounds
  let styleClasses = '';
  if (type === 'success') {
    styleClasses = 'bg-green-500/80'; // Green with 80% opacity
  } else if (type === 'error') {
    styleClasses = 'bg-red-500/80'; // Red with 80% opacity
  } else {
    styleClasses = 'bg-blue-500/80'; // Blue with 80% opacity
  }

  return (
    <div
      className={`
        px-4 py-3 rounded-xl shadow-lg text-white text-sm w-auto max-w-md
        backdrop-blur-sm /* Frosted glass effect */
        transition-all duration-300 ease-in-out transform /* Animation properties */
        ${styleClasses}
        ${
          isVisible
          ? 'translate-x-0 opacity-100' // ENTRANCE: Slide in, fade in
          : 'translate-x-full opacity-0' // EXIT: Slide out, fade out (and initial state)
        }
      `}
      role="alert"
    >
      {message}
    </div>
  );
};


// --- TOAST PROVIDER ---
interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    const newToast: ToastMessage = { id, message, type };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // 3. Remove toast data after 3 seconds (matching animation)
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      
      {/* Container - Remember to adjust top-[88px] if your header height is different */}
      <div className="fixed top-[88px] right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} message={toast.message} type={toast.type} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};