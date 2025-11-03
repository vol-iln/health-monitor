import React from 'react';

const StatsCard = ({ icon, title, value, unit, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    indigo: 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    red: 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    pink: 'bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
    cyan: 'bg-cyan-50 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-lg hover:scale-105`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{title}</span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold">{value}</span>
        {unit && <span className="text-base font-medium opacity-75">{unit}</span>}
      </div>
      {description && (
        <p className="text-xs mt-2 opacity-75">{description}</p>
      )}
    </div>
  );
};

export default StatsCard;