import React from 'react';

const StatCard = ({ label, value, icon: Icon, color = 'blue', trend, trendLabel }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || colors.blue}`}>
          {Icon && <Icon size={24} />}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {trendLabel && <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
};

export default StatCard;
