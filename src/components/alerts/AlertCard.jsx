import React from 'react';
import { AlertTriangle, CheckCircle, Info, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { HEALTH_METRICS } from '../../utils/constants';

const AlertCard = ({ alert, onDismiss }) => {
  const metric = HEALTH_METRICS[alert.type];
  
  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-8 h-8 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getBorderColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      case 'info':
        return 'border-blue-500';
      default:
        return 'border-green-500';
    }
  };

  const getBackgroundColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'bg-green-50 dark:bg-green-900/20';
    }
  };

  const getRecommendation = (type, value, settings) => {
    const recommendations = {
      pulse: {
        high: 'Відпочиньте, зменште фізичне навантаження. При триваючому високому пульсі зверніться до лікаря.',
        low: 'Якщо відчуваєте слабкість або запаморочення, зверніться до лікаря.'
      },
      pressure: {
        high: 'Відпочиньте в тихому місці, уникайте стресу. При стійко високому тиску зверніться до лікаря.',
        low: 'Випийте склянку води, з\'їжте щось солоне. При поганому самопочутті зверніться до лікаря.'
      },
      temperature: {
        high: 'Випийте жарознижуючий засіб, пийте більше рідини. При температурі вище 38.5°C зверніться до лікаря.',
        low: 'Зігрійтеся, випийте теплий напій. При стійко низькій температурі зверніться до лікаря.'
      },
      blood_sugar: {
        high: 'Випийте води, уникайте солодкого. Якщо маєте діабет - діяти за призначенням лікаря.',
        low: 'З\'їжте щось солодке (цукор, сік). При частих гіпоглікеміях зверніться до лікаря.'
      },
      oxygen: {
        low: 'Провітріть приміщення, дихайте глибоко. При стійко низькому рівні кисню терміново зверніться до лікаря.'
      }
    };

    return recommendations[type]?.[alert.isHigh ? 'high' : 'low'] || 'Проконсультуйтеся з лікарем.';
  };

  return (
    <div
      className={`${getBackgroundColor(alert.severity || 'warning')} rounded-xl shadow-lg p-6 border-l-4 ${getBorderColor(alert.severity || 'warning')} transition-all hover:shadow-xl`}
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getAlertIcon(alert.severity || 'warning')}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{metric.icon}</span>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {metric.name}
            </h3>
          </div>
          
          <p className={`font-medium mb-2 ${
            alert.severity === 'critical' 
              ? 'text-red-600 dark:text-red-400' 
              : alert.severity === 'warning'
              ? 'text-yellow-700 dark:text-yellow-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}>
            {alert.message}
          </p>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
            <Clock className="w-4 h-4 mr-1" />
            {format(new Date(alert.date), 'dd MMMM yyyy, HH:mm', { locale: uk })}
          </div>

          {/* Рекомендація */}
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-blue-600 dark:text-blue-400">💡 Рекомендація:</strong>{' '}
              {getRecommendation(alert.type, alert.value, alert.settings)}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={() => onDismiss(alert.id)}
            className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Закрити"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;