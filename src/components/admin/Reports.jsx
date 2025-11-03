import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Download, Calendar, TrendingUp, Users, Activity } from 'lucide-react';
import { HEALTH_METRICS } from '../../utils/constants';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 днів тому
    end: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      const healthDataSnapshot = await getDocs(collection(db, 'healthData'));
      
      const healthDataByType = {};
      const healthDataByUser = {};
      let totalRecords = 0;

      healthDataSnapshot.forEach((doc) => {
        const data = doc.data();
        const recordDate = new Date(data.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        if (recordDate >= startDate && recordDate <= endDate) {
          totalRecords++;

          if (!healthDataByType[data.type]) {
            healthDataByType[data.type] = 0;
          }
          healthDataByType[data.type]++;

          if (!healthDataByUser[data.userId]) {
            healthDataByUser[data.userId] = 0;
          }
          healthDataByUser[data.userId]++;
        }
      });

      const activeUsers = Object.keys(healthDataByUser).length;
      const avgRecordsPerUser = activeUsers > 0 ? (totalRecords / activeUsers).toFixed(1) : 0;

      setStatistics({
        totalUsers,
        activeUsers,
        totalRecords,
        avgRecordsPerUser,
        healthDataByType,
        healthDataByUser
      });

    } catch (error) {
      console.error('Load statistics error:', error);
      toast.error('Помилка завантаження статистики');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!statistics) return;

    const reportText = `
ЗВІТ ПРО СИСТЕМУ МОНІТОРИНГУ ЗДОРОВ'Я
Період: ${format(new Date(dateRange.start), 'dd.MM.yyyy', { locale: uk })} - ${format(new Date(dateRange.end), 'dd.MM.yyyy', { locale: uk })}
Дата створення: ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: uk })}

=== ЗАГАЛЬНА СТАТИСТИКА ===
Всього користувачів: ${statistics.totalUsers}
Активних користувачів: ${statistics.activeUsers}
Всього записів: ${statistics.totalRecords}
Середньо записів на користувача: ${statistics.avgRecordsPerUser}

=== СТАТИСТИКА ПО ТИПАХ ПОКАЗНИКІВ ===
${Object.entries(statistics.healthDataByType).map(([type, count]) => {
  const metric = HEALTH_METRICS[type];
  return `${metric.name}: ${count} записів`;
}).join('\n')}

=== НАЙАКТИВНІШІ КОРИСТУВАЧІ (ТОП-10) ===
${Object.entries(statistics.healthDataByUser)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([userId, count], index) => `${index + 1}. Користувач ${userId.slice(0, 8)}: ${count} записів`)
  .join('\n')}

---
Згенеровано системою Health Monitor
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `health_monitor_report_${format(new Date(), 'yyyy-MM-dd')}.txt`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Звіт завантажено! 📄');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Завантаження статистики...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Звіти та статистика
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Аналітика використання системи
          </p>
        </div>
      </div>

      {/* Фільтр по даті */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h4 className="font-bold text-gray-900 dark:text-white">Період</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Початок
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Кінець
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {statistics && (
        <>
          {/* Основна статистика */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
              title="Всього користувачів"
              value={statistics.totalUsers}
              bgColor="bg-blue-100 dark:bg-blue-900"
            />
            
            <StatCard
              icon={<Activity className="w-8 h-8 text-green-600 dark:text-green-400" />}
              title="Активних користувачів"
              value={statistics.activeUsers}
              bgColor="bg-green-100 dark:bg-green-900"
            />
            
            <StatCard
              icon={<TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
              title="Всього записів"
              value={statistics.totalRecords}
              bgColor="bg-purple-100 dark:bg-purple-900"
            />
            
            <StatCard
              icon={<Activity className="w-8 h-8 text-orange-600 dark:text-orange-400" />}
              title="Середньо на користувача"
              value={statistics.avgRecordsPerUser}
              bgColor="bg-orange-100 dark:bg-orange-900"
            />
          </div>

          {/* Статистика по типах */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Розподіл по типах показників
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(statistics.healthDataByType).map(([type, count]) => {
                const metric = HEALTH_METRICS[type];
                const percentage = ((count / statistics.totalRecords) * 100).toFixed(1);
                
                return (
                  <div key={type} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{metric.icon}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {metric.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {percentage}%
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кнопка експорту */}
          <div className="flex justify-center">
            <Button
              onClick={generateReport}
              className="flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Завантажити звіт</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, bgColor }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${bgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default Reports;