import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Activity } from 'lucide-react';
import { HEALTH_METRICS } from '../../utils/constants';

const QuickActions = () => {
  const { currentUser } = useAuth();
  const [lastMetrics, setLastMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'healthData'),
          where('userId', '==', currentUser.uid),
          orderBy('date', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const grouped = {};
        data.forEach(item => {
          if (!grouped[item.type]) grouped[item.type] = item;
        });

        setLastMetrics(Object.values(grouped));
      } catch (error) {
        console.error('Помилка при завантаженні останніх показників:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Завантаження...</p>
      </div>
    );
  }

  if (lastMetrics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Немає даних для відображення</p>
      </div>
    );
  }

  const getDisplayDate = (metric) => {
    const dateStr = metric.date || metric.createdAt;
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayValue = (metric) => {
    if (metric.type === 'pressure' && metric.systolic && metric.diastolic) {
      return `${metric.systolic}/${metric.diastolic}`;
    }
    return metric.value ?? '-';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <span>Ваші останні показники</span>
      </h3>

      <div className="space-y-3">
        {lastMetrics.map(metric => {
          const metricInfo = HEALTH_METRICS[metric.type] || {};
          return (
            <div
              key={metric.id}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metricInfo.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {metricInfo.name || metric.type}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getDisplayDate(metric)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {getDisplayValue(metric)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {metricInfo.unit}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
