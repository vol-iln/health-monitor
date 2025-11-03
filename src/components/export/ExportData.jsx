import React, { useState } from 'react';
import { Download, FileText, Table } from 'lucide-react';
import { useHealthData } from '../../contexts/HealthDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { exportToCSV, exportToPDF, exportByType } from '../../services/exportService';
import { HEALTH_METRICS } from '../../utils/constants';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ExportData = () => {
  const { healthData } = useHealthData();
  const { userData, currentUser } = useAuth();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [loading, setLoading] = useState(false);

  const groupedData = {};
  Object.keys(HEALTH_METRICS).forEach(type => {
    groupedData[type] = healthData.filter(item => item.type === type);
  });

  const handleExport = () => {
    if (healthData.length === 0) {
      toast.error('Немає даних для експорту');
      return;
    }

    setLoading(true);

    try {
      const userInfo = {
        name: userData?.name || currentUser?.displayName || 'N/A',
        email: currentUser?.email || 'N/A'
      };

      if (selectedType === 'all') {
        if (selectedFormat === 'csv') {
          exportToCSV(healthData, userInfo);
        } else {
          exportToPDF(healthData, userInfo);
        }
      } else {
        exportByType(healthData, selectedType, selectedFormat, userInfo);
      }

      toast.success(`Файл успішно завантажено! 📥`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Помилка експорту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Експорт даних
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Завантажте ваші показники здоров'я у CSV або PDF форматі
        </p>
      </div>

      {healthData.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <div className="text-8xl mb-6">📥</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Немає даних для експорту
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Спочатку додайте показники здоров'я у розділі "Показники"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Налаштування експорту */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Налаштування експорту
            </h3>

            {/* Вибір типу даних */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Які дані експортувати?
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    selectedType === 'all'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    Всі показники
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {healthData.length} записів
                  </span>
                </button>

                {Object.entries(HEALTH_METRICS).map(([key, metric]) => {
                  const count = groupedData[key]?.length || 0;
                  if (count === 0) return null;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedType(key)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        selectedType === key
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{metric.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {metric.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count} записів
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Вибір формату */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Формат файлу
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedFormat('csv')}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    selectedFormat === 'csv'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <Table className="w-8 h-8 mb-2 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">CSV</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Excel, таблиці
                  </span>
                </button>

                <button
                  onClick={() => setSelectedFormat('pdf')}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                    selectedFormat === 'pdf'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  }`}
                >
                  <FileText className="w-8 h-8 mb-2 text-red-600 dark:text-red-400" />
                  <span className="font-medium text-gray-900 dark:text-white">PDF</span>
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Друк, звіти
                  </span>
                </button>
              </div>
            </div>

            {/* Кнопка експорту */}
            <Button
              onClick={handleExport}
              disabled={loading}
              fullWidth
              className="flex items-center justify-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>{loading ? 'Завантаження...' : 'Завантажити'}</span>
            </Button>
          </div>

          {/* Інформація */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Статистика даних
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Всього записів:
                  </span>
                  <span className="text-blue-700 dark:text-blue-300 font-bold text-xl">
                    {healthData.length}
                  </span>
                </div>

                {Object.entries(HEALTH_METRICS).map(([key, metric]) => {
                  const count = groupedData[key]?.length || 0;
                  if (count === 0) return null;

                  return (
                    <div
                      key={key}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{metric.icon}</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {metric.name}:
                        </span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-bold">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Download className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">
                    Про формати експорту:
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>
                      <strong>CSV:</strong> Відкривається в Excel, Google Sheets. Зручно для аналізу.
                    </li>
                    <li>
                      <strong>PDF:</strong> Готовий звіт для друку або надсилання лікарю.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportData;