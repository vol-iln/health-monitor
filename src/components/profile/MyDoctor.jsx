import React, { useState, useEffect } from 'react';
import { Stethoscope, CheckCircle, XCircle, UserCheck, Phone, Mail, CalendarPlus, UserMinus, ShieldAlert, Send } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; 
import { db } from '../../services/firebase'; 
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext'; 
import toast from 'react-hot-toast';
import ShareWithDoctorModal from '../dashboard/ShareWithDoctorModal'; 

// Безпечна відправка через Telegram
const sendTelegramAlert = async (chatId, message) => {
  if (!chatId) return;
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN; 
  
  if (!botToken) {
    console.error("Помилка: Токен Telegram бота не знайдено в .env файлі!");
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message })
    });
    
    if (!response.ok) throw new Error("Помилка відправки Telegram");
  } catch (error) {
    console.error('Помилка Телеграм:', error);
    throw error;
  }
};

const MyDoctor = () => {
  const { currentUser, userData } = useAuth();
  const { healthData } = useHealthData();
  const [isLoading, setIsLoading] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); 

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (userData?.doctorId) {
        try {
          const docSnap = await getDoc(doc(db, 'users', userData.doctorId));
          if (docSnap.exists()) {
            setDoctorDetails(docSnap.data());
          }
        } catch (error) {
          console.error("Помилка завантаження даних лікаря:", error);
        }
      } else {
        setDoctorDetails(null);
      }
    };
    fetchDoctorDetails();
  }, [userData?.doctorId]);

  const handleAcceptInvite = async () => {
    setIsLoading(true);
    try {
      const doctorId = userData.pendingDoctorId;
      await updateDoc(doc(db, 'users', currentUser.uid), {
        doctorId: doctorId,
        doctorName: userData.pendingDoctorName,
        pendingDoctorId: null, 
        pendingDoctorName: null
      });
      toast.success('Ви успішно підключені до лікаря! ✅');
      
      const doctorSnap = await getDoc(doc(db, 'users', doctorId));
      if (doctorSnap.exists()) {
        const doctorData = doctorSnap.data();
        setDoctorDetails(doctorData);
        if (doctorData.telegramId) {
          await sendTelegramAlert(doctorData.telegramId, `✅ Успіх!\nПацієнт ${userData.name || currentUser.email} ПІДТВЕРДИВ ваше запрошення.`);
        }
      }
    } catch (error) {
      toast.error('Помилка при підтвердженні');
    }
    setIsLoading(false);
  };

  const handleRejectInvite = async () => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        pendingDoctorId: null,
        pendingDoctorName: null
      });
      toast.success('Запит відхилено');
    } catch (error) {
      toast.error('Помилка відхилення');
    }
    setIsLoading(false);
  };

  const handleRequestConsultation = async () => {
    if (!doctorDetails?.telegramId) {
      return toast.error('У лікаря не підключений Telegram 😔', { duration: 4000 });
    }
    setIsLoading(true);
    try {
      const patientPhone = userData.phoneNumber ? `\n📞 Телефон: ${userData.phoneNumber}` : '\n📞 Телефон: Не вказано';
      await sendTelegramAlert(
        doctorDetails.telegramId, 
        `📅 ЗАПИТ НА КОНСУЛЬТАЦІЮ!\nПацієнт ${userData.name || currentUser.email} просить зв'язатися з ним для консультації.${patientPhone}`
      );
      toast.success('Запит успішно надіслано лікарю! 📨');
    } catch (error) {
      toast.error('Помилка. Перевірте налаштування Telegram бота.');
    }
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    const confirmed = window.confirm('⚠️ Ви впевнені? Лікар повністю втратить доступ до ваших даних.');
    if (!confirmed) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { doctorId: null, doctorName: null });
      toast.success('Лікаря успішно відкріплено 🔒');
      if (doctorDetails?.telegramId) {
        await sendTelegramAlert(doctorDetails.telegramId, `⚠️ Увага!\nПацієнт ${userData.name || currentUser.email} відкликав доступ до своїх даних.`);
      }
      setDoctorDetails(null);
    } catch (error) {
      toast.error('Помилка при відкріпленні');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-10">
      
      {/* ПРЕМІАЛЬНА ШАПКА */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3 flex items-center">
            <Stethoscope className="w-8 h-8 mr-3 text-teal-400" />
            Мій лікуючий лікар
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Керування доступом до ваших медичних даних, швидкий зв'язок та відправка звітів.
          </p>
        </div>
      </div>

      {/* НОВЕ ЗАПРОШЕННЯ */}
      {userData?.pendingDoctorId && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/50 rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-400 mb-2 flex items-center tracking-tight">
            <ShieldAlert className="w-5 h-5 mr-2" strokeWidth={2.5} /> 
            Нове запрошення!
          </h3>
          <p className="text-amber-800/80 dark:text-amber-200/70 mb-6">
            Лікар <span className="font-semibold text-amber-900 dark:text-amber-300">{userData.pendingDoctorName}</span> просить надати доступ до ваших показників.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleAcceptInvite} disabled={isLoading} className="flex items-center px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors">
              <CheckCircle className="w-5 h-5 mr-2" /> Підтвердити
            </button>
            <button onClick={handleRejectInvite} disabled={isLoading} className="flex items-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
              <XCircle className="w-5 h-5 mr-2" /> Відхилити
            </button>
          </div>
        </div>
      )}

      {/* КАРТКА ЛІКАРЯ */}
      {userData?.doctorId ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-8 border-b border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-teal-50 dark:bg-teal-500/10 rounded-[2rem] flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-10 h-10 text-teal-600 dark:text-teal-400" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                {userData.doctorName}
              </h3>
              <div className="inline-flex items-center px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium mb-4">
                <CheckCircle className="w-4 h-4 mr-1.5" /> Має доступ до показників
              </div>
              
              {doctorDetails && (
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                  <a href={`tel:${doctorDetails.phoneNumber}`} className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    <Phone className="w-4 h-4 mr-2.5 text-slate-400" /> {doctorDetails.phoneNumber || 'Телефон не вказано'}
                  </a>
                  <a href={`mailto:${doctorDetails.email}`} className="flex items-center hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                    <Mail className="w-4 h-4 mr-2.5 text-slate-400" /> {doctorDetails.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* ПАНЕЛЬ ДІЙ */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:px-10 flex flex-wrap items-center gap-4">
            
            <button onClick={handleRequestConsultation} disabled={isLoading} className="flex items-center px-5 py-3 bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 rounded-xl font-medium text-sm transition-all shadow-sm border border-slate-200/60 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700">
              <CalendarPlus className="w-4 h-4 mr-2" /> Запит на зв'язок
            </button>
            
            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm shadow-blue-600/20">
              <Send className="w-4 h-4 mr-2" /> Надіслати звіт
            </button>

            <button onClick={handleDisconnect} disabled={isLoading} className="flex items-center px-5 py-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl font-medium text-sm transition-colors sm:ml-auto">
              <UserMinus className="w-4 h-4 mr-2" /> Відкріпити лікаря
            </button>

          </div>
        </div>
      ) : !userData?.pendingDoctorId && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck className="w-8 h-8 text-slate-300 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Немає лікуючого лікаря</h3>
          <p className="text-slate-500 dark:text-slate-400">Очікуйте запрошення від фахівця. Коли лікар додасть вас за email, тут з'явиться запит.</p>
        </div>
      )}

      {/* МОДАЛКА ВІДПРАВКИ */}
      <ShareWithDoctorModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        data={healthData} 
      />
    </div>
  );
};

export default MyDoctor;