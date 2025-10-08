import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ColumnHeaderProps {
  title: string;
  icon?: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  actions?: Array<{ label: string; onClick: () => void }>;
  showToggle?: boolean; // Optional prop to hide the toggle button
  customRightElement?: React.ReactNode; // Custom element to show on the right
}

export default function ColumnHeader({ 
  title, 
  icon, 
  collapsed, 
  onToggle, 
  actions = [],
  showToggle = true, // Default to true for backward compatibility
  customRightElement
}: ColumnHeaderProps) {
  return (
    <div className="h-12 bg-gray-700 border-b border-gray-600 flex items-center justify-between px-4 relative z-20 pointer-events-auto shadow-sm">
      <div className="flex items-center gap-2">
        {showToggle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Toggle button clicked');
              onToggle();
            }}
            className="p-2 hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 pointer-events-auto"
            title={collapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-300" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-300" />
            )}
          </button>
        )}
        
        {icon && <span className="text-gray-300">{icon}</span>}
        <span className="font-semibold text-white text-sm">{title}</span>
      </div>

      {/* Custom right element or standard actions */}
      {customRightElement ? (
        customRightElement
      ) : (
        !collapsed && actions.length > 0 && (
          <div className="flex gap-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Action button clicked:', action.label);
                  action.onClick();
                }}
                className="px-3 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 pointer-events-auto"
              >
                {action.label}
              </button>
            ))}
          </div>
        )
      )}
    </div>
  );
}
