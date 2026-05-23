import React, { useState } from 'react';
import { Plus, Activity } from 'lucide-react';
import HealthDataForm from './HealthDataForm';
import HealthDataList from './HealthDataList';
import { useHealthData } from '../../contexts/HealthDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';

const sendTelegramAlert = async (chatId, message) => {
  if (!chatId) return;
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    console.error('Помилка: Токен Telegram бота не знайдено в .env файлі!');
    return;
  }

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

const AddHealthData = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { healthData, addData, deleteData, loading: dataLoading } = useHealthData();
  const { currentUser, userData } = useAuth();

  const handleSubmit = async (data) => {
    setLoading(true);
    const result = await addData(data);
    setLoading(false);
    
    if (result.success) {
      // СИНХРОНІЗАЦІЯ ВАГИ З ПРОФІЛЕМ КОРИСТУВАЧА
      if (data.type === 'weight') {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            weight: data.value 
          });
        } catch (error) {
          console.error('Не вдалося оновити вагу в профілі користувача:', error);
        }
      }

      await checkAlert(data);
      toast.success('Показник успішно додано! 🎉');
      setShowForm(false);
    } else {
      toast.error(result.error || 'Помилка додавання');
    }
  };

  const checkAlert = async (data) => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (!savedSettings) return;

    const settings = JSON.parse(savedSettings);
    const setting = settings[data.type];
    
    if (!setting || !setting.enabled) return;

    let isOutOfRange = false;
    let metricDetails = '';

    if (data.type === 'pressure') {
      if (
        data.systolic < setting.systolicMin || data.systolic > setting.systolicMax ||
        data.diastolic < setting.diastolicMin || data.diastolic > setting.diastolicMax
      ) {
        isOutOfRange = true;
        metricDetails = `Тиск: ${data.systolic}/${data.diastolic}`;
      }
    } else {
      if (data.value < setting.min || data.value > setting.max) {
        isOutOfRange = true;
        
        const metricNames = {
          pulse: 'Пульс',
          temperature: 'Температура',
          weight: 'Вага',
          blood_sugar: 'Цукор',
          oxygen: 'Кисень',
          sleep: 'Сон'
        };
        
        metricDetails = `${metricNames[data.type] || data.type}: ${data.value}`;
      }
    }

    if (isOutOfRange) {
      toast.error('⚠️ Увага! Показник виходить за межі норми!', { duration: 5000 });
      
      if (userData?.doctorId) {
        try {
          const doctorSnap = await getDoc(doc(db, 'users', userData.doctorId));
          if (doctorSnap.exists()) {
            const doctorData = doctorSnap.data();
            
            if (doctorData.telegramId) {
              const patientName = userData.name || currentUser.email;
              const alertMessage = `🚨 КРИТИЧНИЙ ПОКАЗНИК!\nУ пацієнта ${patientName} зафіксовано відхилення від норми.\n\nПоказник: ${metricDetails}\nБудь ласка, перевірте картку пацієнта на сайті.`;
              
              await sendTelegramAlert(doctorData.telegramId, alertMessage);
            }
          }
        } catch (error) {
          console.error('Не вдалося відправити сповіщення лікарю:', error);
        }
      }
    }
  };

  const handleDelete = async (dataId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей показник?')) {
      return;
    }

    const result = await deleteData(dataId);
    
    if (result.success) {
      toast.success('Показник видалено');
    } else {
      toast.error(result.error || 'Помилка видалення');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-10">
      
      {/* ПРЕМІАЛЬНА ШАПКА */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between">
        
        {/* Декоративне світіння */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-emerald-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none"></div>

        <div className="relative z-10 mb-6 sm:mb-0">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight flex items-center mb-2">
            <Activity className="w-8 h-8 mr-3 text-emerald-400" />
            Мої показники
          </h2>
          <p className="text-slate-400 text-lg flex items-center space-x-2">
            <span>Всього записів у системі:</span>
            <span className="inline-flex items-center justify-center bg-white/10 text-white font-bold px-3 py-1 rounded-full text-sm">
              {healthData.length}
            </span>
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="relative z-10 flex items-center px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 hover:scale-[1.02]"
        >
          <Plus className="w-5 h-5 mr-2" strokeWidth={2.5} />
          <span>Додати показник</span>
        </button>
      </div>

      {/* КОНТЕЙНЕР ДЛЯ СПИСКУ ПОКАЗНИКІВ */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8">
        <HealthDataList 
          data={healthData} 
          onDelete={handleDelete}
          loading={dataLoading}
        />
      </div>

      {/* МОДАЛЬНЕ ВІКНО ДОДАВАННЯ */}
      {showForm && (
        <HealthDataForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AddHealthData;