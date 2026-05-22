import React, { useState } from 'react';
import { X, Send, Filter, CalendarDays, Activity } from 'lucide-react';
import { HEALTH_METRICS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';
import { formatDataForTelegram } from '../../utils/exportUtils';

const ShareWithDoctorModal = ({ isOpen, onClose, data }) => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    period: 'week' 
  });

  if (!isOpen) return null;

  const handleSend = async () => {
    setLoading(true);
    try {
      if (!userData?.doctorId) {
        toast.error('У вас не підключений лікар!');
        return;
      }

      // 1. Дістаємо ID лікаря з бази
      const doctorSnap = await getDoc(doc(db, 'users', userData.doctorId));
      if (!doctorSnap.exists()) {
        toast.error('Не вдалося знайти лікаря.');
        return;
      }

      const doctorData = doctorSnap.data();
      if (!doctorData.telegramId) {
        toast.error('У вашого лікаря не підключений Telegram!');
        return;
      }

      // 2. Формуємо повідомлення
      const message = formatDataForTelegram(data, filters, userData.name || currentUser.email);
      
      if (!message) {
        toast.error('За обраний період немає жодних записів!');
        return;
      }

      const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        toast.error('Помилка системи: Не налаштовано Telegram бота');
        console.error("Токен не знайдено в .env");
        return;
      }

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
        throw new Error('Помилка API Телеграму');
      }

    } catch (error) {
      console.error(error);
      toast.error('Не вдалося відправити звіт. Перевірте налаштування бота.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-w-md w-full border border-slate-200/60 dark:border-slate-800 overflow-hidden transform transition-all">
        
        {/* Шапка */}
        <div className="bg-blue-600 dark:bg-blue-600/90 p-6 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-32 h-32 bg-blue-400/30 rounded-full blur-2xl"></div>
          
          <h2 className="text-xl font-bold text-white flex items-center tracking-tight relative z-10">
            <Send className="w-5 h-5 mr-3" /> Надіслати звіт
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors relative z-10 bg-blue-700/50 hover:bg-blue-700 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Налаштування */}
        <div className="p-8 space-y-8">
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Оберіть необхідні показники та період для формування детального медичного звіту вашому лікарю.
          </p>

          <div className="space-y-6">
            
            {/* Вибір показника */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center uppercase tracking-wider">
                <Activity className="w-4 h-4 mr-2 text-blue-500" /> Що відправляємо?
              </label>
              <div className="relative">
                <select 
                  value={filters.type} 
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full pl-4 pr-10 py-3.5 appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                >
                  <option value="all">Всі показники</option>
                  {Object.entries(HEALTH_METRICS).map(([key, metric]) => (
                    <option key={key} value={key}>{metric.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <Filter className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Вибір періоду */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center uppercase tracking-wider">
                <CalendarDays className="w-4 h-4 mr-2 text-blue-500" /> За який період?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'week', label: 'Тиждень' },
                  { id: 'month', label: 'Місяць' },
                  { id: 'all', label: 'Увесь час' }
                ].map((period) => (
                  <button 
                    key={period.id}
                    onClick={() => setFilters(prev => ({ ...prev, period: period.id }))}
                    className={`py-2.5 px-2 text-[13px] rounded-xl font-bold transition-all duration-200 ${
                      filters.period === period.id 
                        ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500 shadow-sm' 
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSend} 
            disabled={loading} 
            className="w-full py-4 mt-4 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Відправка...
              </span>
            ) : (
              <>
                <Send className="w-5 h-5" /> 
                <span>Надіслати в Telegram</span>
              </>
            )}
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default ShareWithDoctorModal;