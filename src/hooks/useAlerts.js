import { useState, useEffect } from 'react';
import { useHealthData } from './useHealthData';
import { HEALTH_METRICS } from '../utils/constants';

export const useAlerts = () => {
  const { healthData } = useHealthData();
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    const saved = localStorage.getItem('dismissedAlerts');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    checkForAlerts();
  }, [healthData, dismissedAlerts]);

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
          message = `⚠️ ВИСОКИЙ ТИСК: ${item.systolic}/${item.diastolic}`;
        } else if (systolicLow || diastolicLow) {
          isOutOfRange = true;
          severity = 'warning';
          message = `⬇️ Низький тиск: ${item.systolic}/${item.diastolic}`;
        }
      } else {
        if (item.value > setting.max) {
          isOutOfRange = true;
          isHigh = true;
          severity = item.value > setting.max * 1.2 ? 'critical' : 'warning';
          message = `⚠️ Підвищене значення: ${item.value} ${HEALTH_METRICS[item.type].unit}`;
        } else if (item.value < setting.min) {
          isOutOfRange = true;
          severity = item.value < setting.min * 0.8 ? 'critical' : 'warning';
          message = `⬇️ Знижене значення: ${item.value} ${HEALTH_METRICS[item.type].unit}`;
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

    // Сортуємо: критичні спочатку
    newAlerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return new Date(b.date) - new Date(a.date);
    });

    setAlerts(newAlerts);
  };

  const dismissAlert = (alertId) => {
    const newDismissed = [...dismissedAlerts, alertId];
    setDismissedAlerts(newDismissed);
    localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
  };

  const clearDismissed = () => {
    setDismissedAlerts([]);
    localStorage.removeItem('dismissedAlerts');
  };

  const getCriticalCount = () => {
    return alerts.filter(a => a.severity === 'critical').length;
  };

  const getWarningCount = () => {
    return alerts.filter(a => a.severity === 'warning').length;
  };

  return {
    alerts,
    dismissedAlerts,
    dismissAlert,
    clearDismissed,
    getCriticalCount,
    getWarningCount,
    totalAlerts: alerts.length
  };
};