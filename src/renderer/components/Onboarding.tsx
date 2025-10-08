import React from 'react';
import { X, Keyboard, MousePointer, BookOpen, Brain } from 'lucide-react';

interface OnboardingProps {
  onClose: () => void;
}

export default function Onboarding({ onClose }: OnboardingProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to LogosBridge</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-gray-600">
              <p className="mb-4">
                LogosBridge is your dedicated sermon preparation workspace that eliminates 
                context-switching between Logos Bible Software and AI tools.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Sermon Planner (Left Panel)</h3>
                  <p className="text-gray-600 text-sm">
                    Organize your sermons by date and series. Click on any Sunday to create or edit sermon details.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Logos Bible Software (Middle Panel)</h3>
                  <p className="text-gray-600 text-sm">
                    Your full Logos web app runs here. Highlight verses, commentaries, or original language notes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI Workspace (Right Panel)</h3>
                  <p className="text-gray-600 text-sm">
                    Your ChatGPT session for brainstorming outlines, illustrations, and simplifying complex concepts.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Keyboard className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Quick Bridge</h3>
              </div>
              <p className="text-yellow-700 text-sm">
                Use <kbd className="bg-yellow-200 px-2 py-1 rounded text-xs">⌘⇧L</kbd> (Mac) or 
                <kbd className="bg-yellow-200 px-2 py-1 rounded text-xs">Ctrl⇧L</kbd> (Windows) 
                to instantly send highlighted text from Logos to AI.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <MousePointer className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Getting Started</h3>
              </div>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. Sign in to Logos in the middle panel</li>
                <li>2. Sign in to ChatGPT in the right panel</li>
                <li>3. Create your first sermon in the planner</li>
                <li>4. Try the bridge shortcut with highlighted text</li>
              </ol>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

