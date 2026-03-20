import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  startIndex, 
  endIndex 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{startIndex}</span> to{' '}
        <span className="font-medium text-gray-900">{endIndex}</span> of{' '}
        <span className="font-medium text-gray-900">{totalItems}</span> results
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        
        <div className="flex items-center gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 border border-transparent'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
