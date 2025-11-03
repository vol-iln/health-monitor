import React, { useEffect, useState } from 'react';
import { useHealthData } from '../../contexts/HealthDataContext';
import { HEALTH_METRICS } from '../../utils/constants';
import { CheckCircle } from 'lucide-react';
import AlertCard from './AlertCard';
import toast from 'react-hot-toast';

const AlertsList = () => {
  const { healthData } = useHealthData();
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    const saved = localStorage.getItem('dismissedAlerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    checkForAlerts();
  }, [healthData]);

  const checkForAlerts = () => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (!savedSettings) return;

    const settings = JSON.parse(savedSettings);
    const newAlerts = [];

    healthData.forEach(item => {
      if (dismissedAlerts.includes(item.id)) return;

      const setting = settings[item.type];
      if (!setting || !setting.enabled) return;

      let isOutOfRange = false;
      let message = '';
      let severity = 'warning';
      let isHigh = false;

      if (item.type === 'pressure') {
        const systolicHigh = item.systolic > setting.systolicMax;
        const systolicLow = item.systolic < setting.systolicMin;
        const diastolicHigh = item.diastolic > setting.diastolicMax;
        const diastolicLow = item.diastolic < setting.diastolicMin;

        if (systolicHigh || diastolicHigh) {
          isOutOfRange = true;
          isHigh = true;
          severity = 'critical';
          message = `⚠️ ВИСОКИЙ ТИСК: ${item.systolic}/${item.diastolic} (норма: ${setting.systolicMin}-${setting.systolicMax}/${setting.diastolicMin}-${setting.diastolicMax})`;
        } else if (systolicLow || diastolicLow) {
          isOutOfRange = true;
          severity = 'warning';
          message = `⬇️ Низький тиск: ${item.systolic}/${item.diastolic} (норма: ${setting.systolicMin}-${setting.systolicMax}/${setting.diastolicMin}-${setting.diastolicMax})`;
        }
      } else {
        if (item.value > setting.max) {
          isOutOfRange = true;
          isHigh = true;
          severity = item.value > setting.max * 1.2 ? 'critical' : 'warning';
          message = `⚠️ Підвищене значення: ${item.value} ${HEALTH_METRICS[item.type].unit} (норма: ${setting.min}-${setting.max})`;
        } else if (item.value < setting.min) {
          isOutOfRange = true;
          severity = item.value < setting.min * 0.8 ? 'critical' : 'warning';
          message = `⬇️ Знижене значення: ${item.value} ${HEALTH_METRICS[item.type].unit} (норма: ${setting.min}-${setting.max})`;
        }
      }

      if (isOutOfRange) {
        newAlerts.push({
          id: item.id,
          type: item.type,
          message,
          date: item.date,
          value: item.type === 'pressure' ? `${item.systolic}/${item.diastolic}` : item.value,
          severity,
          isHigh,
          settings: setting
        });
      }
    });

    newAlerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return new Date(b.date) - new Date(a.date);
    });

    setAlerts(newAlerts);
  };

  const handleDismiss = (alertId) => {
    const newDismissed = [...dismissedAlerts, alertId];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    toast.success('Попередження закрито');
  };

  const clearDismissed = () => {
    setDismissedAlerts([]);
    localStorage.removeItem('dismissedAlerts');
    checkForAlerts();
    toast.success('Всі закриті попередження відновлено');
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Попередження
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Показники, що виходять за межі встановлених значень
          </p>
        </div>

        {dismissedAlerts.length > 0 && (
          <button
            onClick={clearDismissed}
            className="px-4 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            Відновити закриті ({dismissedAlerts.length})
          </button>
        )}
      </div>

      {/* Статистика */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Всього</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {alerts.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Критичні</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {criticalCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">🚨</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Попередження</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {warningCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Список попереджень */}
      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Все в нормі! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Всі ваші показники знаходяться в межах встановлених значень
          </p>
          {dismissedAlerts.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              {dismissedAlerts.length} попереджень закрито
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={handleDismiss}
            />
          ))}
        </div>
      )}

      {/* Інформація */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Увага!</strong> Ці попередження мають інформаційний характер. 
              При значних відхиленнях від норми або поганому самопочутті обов'язково 
              проконсультуйтеся з лікарем. Не займайтеся самолікуванням!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsList;