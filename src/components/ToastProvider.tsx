'use client';

import { Toaster, ToastBar, toast } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster 
      position="top-right" 
      toastOptions={{ 
        duration: 2500,
        style: {
          cursor: 'pointer',
        }
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div 
              className="flex items-center gap-2"
              onClick={() => toast.dismiss(t.id)}
            >
              {icon}
              {message}
              {t.type !== 'loading' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className="ml-2 px-2 py-1 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 rounded-lg border border-stone-300 transition flex items-center gap-1 shrink-0 shadow-xs"
                  title="Dismiss notification"
                >
                  <span>✕</span> Cancel
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
