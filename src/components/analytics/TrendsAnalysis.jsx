import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { useHealthData } from '../../contexts/HealthDataContext';
import { HEALTH_METRICS } from '../../utils/constants';
import { calculateTrend } from '../../utils/calculations';

const TrendsAnalysis = () => {
  const { healthData } = useHealthData();

  const groupedData = {};
  Object.keys(HEALTH_METRICS).forEach(type => {
    groupedData[type] = healthData.filter(item => item.type === type);
  });

  const trends = {};
  Object.keys(groupedData).forEach(type => {
    const data = groupedData[type];
    if (data.length < 2) return;

    if (type === 'pressure') {
      const systolicValues = data.map(item => item.systolic).reverse();
      const diastolicValues = data.map(item => item.diastolic).reverse();
      
      trends[type] = {
        systolic: calculateTrend(systolicValues),
        diastolic: calculateTrend(diastolicValues)
      };
    } else {
      const values = data.map(item => item.value).reverse();
      trends[type] = calculateTrend(values);
    }
  });

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-6 h-6 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="w-6 h-6 text-blue-500" />;
    return <Minus className="w-6 h-6 text-gray-500" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-red-600 dark:text-red-400';
    if (trend === 'down') return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getTrendBgColor = (trend) => {
    if (trend === 'up') return 'bg-red-50 dark:bg-red-900/20';
    if (trend === 'down') return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-gray-50 dark:bg-gray-700/20';
  };

  if (Object.keys(trends).length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Недостатньо даних для аналізу трендів
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Додайте більше показників для відстеження тенденцій
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Аналіз тенденцій
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Динаміка змін ваших показників здоров'я
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(trends).map(([type, trend]) => {
          const metric = HEALTH_METRICS[type];

          if (type === 'pressure') {
            return (
              <div key={type} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{metric.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {metric.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {groupedData[type].length} записів
                    </p>
                  </div>
                </div>

                {/* Систолічний */}
                <div className={`p-4 rounded-lg mb-3 ${getTrendBgColor(trend.systolic.trend)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Систолічний
                    </span>
                    {getTrendIcon(trend.systolic.trend)}
                  </div>
                  <p className={`text-2xl font-bold ${getTrendColor(trend.systolic.trend)}`}>
                    {trend.systolic.percentage > 0 ? '+' : ''}{trend.systolic.percentage}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {trend.systolic.description}
                  </p>
                </div>

                {/* Діастолічний */}
                <div className={`p-4 rounded-lg ${getTrendBgColor(trend.diastolic.trend)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Діастолічний
                    </span>
                    {getTrendIcon(trend.diastolic.trend)}
                  </div>
                  <p className={`text-2xl font-bold ${getTrendColor(trend.diastolic.trend)}`}>
                    {trend.diastolic.percentage > 0 ? '+' : ''}{trend.diastolic.percentage}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {trend.diastolic.description}
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={type} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 ${
              trend.trend === 'up' ? 'border-red-500' :
              trend.trend === 'down' ? 'border-blue-500' :
              'border-gray-500'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{metric.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {metric.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {groupedData[type].length} записів
                    </p>
                  </div>
                </div>
                {getTrendIcon(trend.trend)}
              </div>

              <div className={`p-4 rounded-lg ${getTrendBgColor(trend.trend)}`}>
                <p className={`text-3xl font-bold mb-2 ${getTrendColor(trend.trend)}`}>
                  {trend.percentage > 0 ? '+' : ''}{trend.percentage}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {trend.description}
                </p>
              </div>

              {/* Рекомендація */}
              {Math.abs(parseFloat(trend.percentage)) > 15 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Увага:</strong> Значні зміни показника. Рекомендується консультація лікаря.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Загальний висновок */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl shadow-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-3">📊 Загальний висновок</h3>
        <div className="space-y-2">
          {Object.entries(trends).filter(([_, trend]) => {
            const mainTrend = trend.trend || trend.systolic?.trend;
            return mainTrend !== 'stable';
          }).length === 0 ? (
            <p>Всі ваші показники стабільні. Продовжуйте в тому ж дусі! 🎉</p>
          ) : (
            <p>Виявлено зміни в {Object.entries(trends).filter(([_, trend]) => {
              const mainTrend = trend.trend || trend.systolic?.trend;
              return mainTrend !== 'stable';
            }).length} показниках. Рекомендується регулярний моніторинг.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendsAnalysis;