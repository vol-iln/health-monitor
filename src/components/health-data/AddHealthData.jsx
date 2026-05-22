import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import HealthDataForm from './HealthDataForm';
import HealthDataList from './HealthDataList';
import { useHealthData } from '../../contexts/HealthDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // ДОДАНО updateDoc
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';
import Button from '../common/Button';

// Функція відправки в Телеграм
const sendTelegramAlert = async (chatId, message) => {
  if (!chatId) return;
  const botToken = '8679627854:AAGxL1V-FcVfcaqqG1MGMcQ7yOzlh0lV6NQ';
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
            weight: data.value // Записуємо нову вагу безпосередньо в профіль
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Мої показники
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Всього записів: {healthData.length}
          </p>
        </div>

        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Додати показник</span>
        </Button>
      </div>

      <HealthDataList 
        data={healthData} 
        onDelete={handleDelete}
        loading={dataLoading}
      />

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