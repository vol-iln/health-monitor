import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { HEALTH_METRICS } from '../../utils/constants';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const HealthDataList = ({ data, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Завантаження...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Поки що немає даних
        </p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
          Додайте свій перший показник здоров'я
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const metric = HEALTH_METRICS[item.type];
        
        return (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-3xl">{metric.icon}</div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {metric.name}
                  </h3>
                  
                  <div className="mt-1">
                    {item.type === 'pressure' ? (
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {item.systolic}/{item.diastolic}
                      </span>
                    ) : (
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {item.value}
                      </span>
                    )}
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      {metric.unit}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(item.date), 'dd MMMM yyyy, HH:mm', { locale: uk })}
                  </div>

                  {item.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                      "{item.note}"
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                title="Видалити"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HealthDataList;