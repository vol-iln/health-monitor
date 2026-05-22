import React, { useState } from 'react';
import { X, Send, Filter } from 'lucide-react';
import { HEALTH_METRICS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import { formatDataForTelegram } from '../../utils/exportUtils';

const ShareWithDoctorModal = ({ isOpen, onClose, data }) => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    period: 'week' // 'week', 'month', 'all'
  });

  if (!isOpen) return null;

  const handleSend = async () => {
    setLoading(true);
    try {
      if (!userData?.doctorId) {
        toast.error('У вас не підключений лікар!');
        setLoading(false);
        return;
      }

      // 1. Дістаємо ID лікаря з бази
      const doctorSnap = await getDoc(doc(db, 'users', userData.doctorId));
      if (!doctorSnap.exists()) {
        toast.error('Не вдалося знайти лікаря.');
        setLoading(false);
        return;
      }

      const doctorData = doctorSnap.data();
      if (!doctorData.telegramId) {
        toast.error('У вашого лікаря не підключений Telegram!');
        setLoading(false);
        return;
      }

      // 2. Формуємо повідомлення
      const message = formatDataForTelegram(data, filters, userData.name || currentUser.email);
      
      if (!message) {
        toast.error('За обраний період немає жодних записів!');
        setLoading(false);
        return;
      }

      // 3. Відправляємо в Телеграм
      const botToken = '8679627854:AAGxL1V-FcVfcaqqG1MGMcQ7yOzlh0lV6NQ';
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chat_id: doctorData.telegramId, 
          text: message 
        })
      });

      if (response.ok) {
        toast.success('Звіт успішно відправлено лікарю в Telegram! 🚀');
        onClose();
      } else {
        throw new Error('Помилка API');
      }

    } catch (error) {
      console.error(error);
      toast.error('Не вдалося відправити звіт');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        
        {/* Шапка */}
        <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center">
            <Send className="w-5 h-5 mr-2" /> Відправити лікарю
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Налаштування */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Оберіть, які саме показники та за який час ви хочете надіслати своєму лікуючому лікарю.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Filter className="w-4 h-4 mr-1 text-blue-500" /> Що відправляємо?
              </label>
              <select 
                value={filters.type} 
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">Всі показники</option>
                {Object.entries(HEALTH_METRICS).map(([key, metric]) => (
                  <option key={key} value={key}>{metric.icon} {metric.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">За який період?</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, period: 'week' }))}
                  className={`py-2 px-1 text-sm rounded-lg border font-medium transition ${filters.period === 'week' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'}`}
                >
                  Тиждень
                </button>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, period: 'month' }))}
                  className={`py-2 px-1 text-sm rounded-lg border font-medium transition ${filters.period === 'month' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'}`}
                >
                  Місяць
                </button>
                <button 
                  onClick={() => setFilters(prev => ({ ...prev, period: 'all' }))}
                  className={`py-2 px-1 text-sm rounded-lg border font-medium transition ${filters.period === 'all' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400'}`}
                >
                  Ввесь час
                </button>
              </div>
            </div>
          </div>

          <Button onClick={handleSend} disabled={loading} fullWidth className="py-3 flex justify-center space-x-2">
            <Send className="w-5 h-5" /> <span>{loading ? 'Відправка...' : 'Надіслати в Telegram'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareWithDoctorModal;