import React from 'react';
import { TrendingUp, BarChart3, Activity, PieChart } from 'lucide-react';

const ChartSelector = ({ selectedType, onChange }) => {
  const chartTypes = [
    { id: 'line', name: 'Лінійний', icon: TrendingUp },
    { id: 'bar', name: 'Стовпчиковий', icon: BarChart3 },
    { id: 'area', name: 'Область', icon: Activity },
    { id: 'pie', name: 'Кругова', icon: PieChart },
  ];

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        Тип графіка:
      </span>
      <div className="flex space-x-2">
        {chartTypes.map((type) => {
          const Icon = type.icon;
          const isActive = selectedType === type.id;
          
          return (
            <button
              key={type.id}
              onClick={() => onChange(type.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{type.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChartSelector;