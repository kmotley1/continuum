// Toast component
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

export default function Toast({ type, message, onClose }: ToastProps) {
  const isSuccess = type === 'success';
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px]
        ${isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
      `}>
        {isSuccess ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        )}
        
        <span className={`text-sm ${isSuccess ? 'text-green-800' : 'text-red-800'}`}>
          {message}
        </span>
        
        <button
          onClick={onClose}
          className={`
            p-1 rounded-full transition-colors flex-shrink-0
            ${isSuccess ? 'hover:bg-green-100' : 'hover:bg-red-100'}
          `}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

