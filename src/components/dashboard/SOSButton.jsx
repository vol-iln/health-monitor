import React, { useState, useEffect } from 'react';
import { AlertOctagon, Info, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';

const SOSButton = () => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Показуємо підказку при завантаженні компонента і ховаємо через 10 секунд
  useEffect(() => {
    if (userData && userData.role === 'user') {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [userData]);

  if (!userData || userData.role !== 'user') return null;

  const sendTelegramAlert = async (chatId, message) => {
    if (!chatId) return;
    const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN; 
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message })
      });
    } catch (error) {
      console.error('Помилка Телеграм:', error);
    }
  };

  const handleSOSClick = async () => {
    setLoading(true);
    
    // Якщо підказка ще висіла, ховаємо її при натисканні
    setShowTooltip(false);

    try {
      if (!userData.doctorId) {
        toast.error('⚠️ У вас не підключений лікар для відправки SOS!');
        setLoading(false);
        return;
      }

      const doctorSnap = await getDoc(doc(db, 'users', userData.doctorId));
      if (!doctorSnap.exists()) {
        toast.error('Не вдалося знайти вашого лікаря в базі.');
        setLoading(false);
        return;
      }

      const doctorData = doctorSnap.data();

      if (doctorData.telegramId) {
        const patientName = userData.name || currentUser.email;
        const message = `🚨 SOS! ЕКСТРЕНИЙ ВИКЛИК! 🚨\n\nПацієнт ${patientName} щойно натиснув кнопку SOS!\n\nМожливо, потрібна швидка допомога. Терміново зв'яжіться з пацієнтом!`;
        
        await sendTelegramAlert(doctorData.telegramId, message);
        
        toast.success('Екстрене сповіщення миттєво відправлено лікарю! 🚑 Залишайтеся на місці.', { 
          duration: 8000,
          style: {
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #f87171',
            fontWeight: 'bold'
          }
        });
      } else {
        toast.error('На жаль, у вашого лікаря не підключений Telegram для отримання SOS.');
      }
    } catch (error) {
      console.error('Помилка SOS:', error);
      toast.error('Не вдалося відправити SOS. Терміново телефонуйте 103 самостійно!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Спливаюче віконце*/}
      {showTooltip && (
        <div className="mb-4 w-64 bg-gray-900 dark:bg-gray-800 text-white p-4 rounded-2xl shadow-2xl relative animate-fade-in-up border border-gray-700 transition-opacity duration-500">
          <button 
            onClick={() => setShowTooltip(false)} 
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed pr-2">
              <span className="text-red-400 font-bold block mb-1">Увага!</span>
              Це кнопка екстреного виклику. Натискайте <strong>лише</strong> в разі реальної загрози здоров'ю. Вона спрацює миттєво!
            </div>
          </div>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-gray-900 dark:bg-gray-800 transform rotate-45 border-b border-r border-gray-700"></div>
        </div>
      )}

      {/* Сама кнопка SOS */}
      <button
        onClick={handleSOSClick}
        disabled={loading}
        className="flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-[0_0_30px_rgba(220,38,38,0.9)] transition-all duration-300 animate-pulse group"
        title="Екстрений виклик лікаря"
      >
        <AlertOctagon className="w-8 h-8 group-hover:scale-110 transition-transform" />
      </button>

    </div>
  );
};

export default SOSButton;