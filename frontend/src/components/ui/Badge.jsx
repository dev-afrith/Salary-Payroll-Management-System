import React from 'react';

const Badge = ({ children, variant = 'pending', className = '' }) => {
  const variants = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    active: 'bg-blue-100 text-blue-700',
    inactive: 'bg-gray-100 text-gray-700',
    present: 'bg-green-100 text-green-700',
    absent: 'bg-red-100 text-red-700',
    'half-day': 'bg-orange-100 text-orange-700',
    holiday: 'bg-purple-100 text-purple-700',
    lop: 'bg-red-100 text-red-700',
    'on-leave': 'bg-blue-100 text-blue-700'
  };

  const status = variant.toLowerCase();
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block whitespace-nowrap ${variants[status] || variants.inactive} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
