import React, { useState, useEffect } from 'react';
import { X, Globe, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  panelType: 'logos' | 'ai';
}

export default function SettingsModal({ isOpen, onClose, panelType }: SettingsModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('SettingsModal rendered with props:', { isOpen, panelType });

  useEffect(() => {
    if (isOpen) {
      // Load current URL when modal opens
      const defaultUrl = panelType === 'logos' 
        ? 'https://app.logos.com/' 
        : 'https://chat.openai.com/';
      setUrl(defaultUrl);
      
      // Add escape key handler
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          console.log('Escape key pressed, closing modal');
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, panelType, onClose]);

  const handleSave = async () => {
    if (!url.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await window.api.changeUrl(panelType, url.trim());
      if (result.success) {
        onClose();
      } else {
        alert(`Failed to update URL: ${result.error}`);
      }
    } catch (error) {
      alert('Failed to update URL');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        // Close modal when clicking the backdrop
        if (e.target === e.currentTarget) {
          console.log('Modal backdrop clicked, closing modal');
          onClose();
        }
      }}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-300" />
              <h2 className="text-xl font-bold text-white">
                {panelType === 'logos' ? 'Logos' : 'AI'} Settings
              </h2>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                onClose();
              }}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="modern-input w-full pl-10 pr-3 py-2 rounded-lg"
                    placeholder="Enter URL..."
                    disabled={isLoading}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {panelType === 'logos' 
                  ? 'Enter the Logos web app URL (default: https://app.logos.com/)'
                  : 'Enter the AI service URL (default: https://chat.openai.com/)'
                }
              </p>
            </div>

            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
              <h4 className="font-medium text-blue-300 text-sm mb-1">Quick Links:</h4>
              <div className="space-y-1">
                {panelType === 'logos' ? (
                  <>
                    <button
                      onClick={() => setUrl('https://app.logos.com/')}
                      className="block text-xs text-blue-400 hover:text-blue-300"
                    >
                      Logos Web App (Official)
                    </button>
                    <button
                      onClick={() => setUrl('https://bible.logos.com/')}
                      className="block text-xs text-blue-400 hover:text-blue-300"
                    >
                      Logos Bible
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setUrl('https://chat.openai.com/')}
                      className="block text-xs text-blue-400 hover:text-blue-300"
                    >
                      ChatGPT (OpenAI)
                    </button>
                    <button
                      onClick={() => setUrl('https://claude.ai/')}
                      className="block text-xs text-blue-400 hover:text-blue-300"
                    >
                      Claude (Anthropic)
                    </button>
                    <button
                      onClick={() => setUrl('https://gemini.google.com/')}
                      className="block text-xs text-blue-400 hover:text-blue-300"
                    >
                      Gemini (Google)
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="modern-button px-4 py-2 rounded-lg"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!url.trim() || isLoading}
              className="accent-button px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
