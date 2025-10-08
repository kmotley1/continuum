import { useEffect, useState } from 'react';
import SplitLayout from './components/SplitLayout';
import Onboarding from './components/Onboarding';
import Toast from './components/Toast';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    try {
      // Listen for onboarding
      window.api.onShowOnboarding(() => {
        setShowOnboarding(true);
      });

      // Listen for bridge toasts
      window.api.onBridgeToast((data) => {
        setToast(data);
        setTimeout(() => setToast(null), 3000);
      });

      // Listen for selections from Logos
      window.api.onSelectionFromLogos((data) => {
        console.log('Selection from Logos:', data);
        // This could be used to update sermon notes automatically
      });
    } catch (error) {
      console.error('Error setting up app:', error);
      setHasError(true);
    }
  }, []);

  if (hasError) {
    return (
      <div className="h-screen w-screen bg-red-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-xl font-bold mb-4">Error Loading App</div>
          <div className="text-sm">Check console for details</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50">
      <SplitLayout />
      
      {showOnboarding && (
        <Onboarding onClose={() => setShowOnboarding(false)} />
      )}
      
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}