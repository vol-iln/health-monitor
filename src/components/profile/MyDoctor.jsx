import React, { useState, useEffect } from 'react';
import { Stethoscope, CheckCircle, XCircle, UserCheck, Phone, Mail, CalendarPlus, UserMinus, ShieldAlert, Send } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore'; 
import { db } from '../../services/firebase'; 
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext'; 
import toast from 'react-hot-toast';
import ShareWithDoctorModal from '../dashboard/ShareWithDoctorModal'; 

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
  } catch (error) {}
};

const MyDoctor = () => {
  const { currentUser, userData } = useAuth();
  const { healthData } = useHealthData(); // Отримуємо дані про здоров'я
  const [isLoading, setIsLoading] = useState(false);
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false); // Стан для модалки

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
      toast('Ви відхилили запит лікаря', { icon: '❌' });
    } catch (error) {
      toast.error('Помилка відхилення');
    }
    setIsLoading(false);
  };

  const handleRequestConsultation = async () => {
    if (!doctorDetails?.telegramId) {
      return toast.error('У лікаря не підключений Telegram 😔');
    }
    setIsLoading(true);
    try {
      const patientPhone = userData.phoneNumber ? `\n📞 Телефон: ${userData.phoneNumber}` : '\n📞 Телефон: Не вказано';
      await sendTelegramAlert(
        doctorDetails.telegramId, 
        `📅 ЗАПИТ НА КОНСУЛЬТАЦІЮ!\nПацієнт ${userData.name || currentUser.email} просить зв'язатися з ним для консультації.${patientPhone}`
      );
      toast.success('Запит успішно надіслано! 📨');
    } catch (error) {
      toast.error('Не вдалося надіслати запит');
    }
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    const confirmed = window.confirm('⚠️ Ви впевнені? Лікар втратить доступ до ваших даних.');
    if (!confirmed) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { doctorId: null, doctorName: null });
      toast.success('Лікаря успішно відкріплено 🔒');
      if (doctorDetails?.telegramId) {
        await sendTelegramAlert(doctorDetails.telegramId, `⚠️ Увага!\nПацієнт ${userData.name || currentUser.email} відкликав доступ до даних.`);
      }
      setDoctorDetails(null);
    } catch (error) {
      toast.error('Помилка при відкріпленні');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2 flex items-center">
          <Stethoscope className="w-8 h-8 mr-3" />
          Мій лікуючий лікар
        </h2>
        <p className="text-teal-100 text-lg">Керування доступом до ваших медичних даних</p>
      </div>

      {userData?.pendingDoctorId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-yellow-400">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <ShieldAlert className="w-5 h-5 text-yellow-500 mr-2" /> Нове запрошення!
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Лікар <span className="font-bold text-teal-600">{userData.pendingDoctorName}</span> просить надати доступ до показників.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleAcceptInvite} disabled={isLoading} className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
              <CheckCircle className="w-5 h-5 mr-2" /> Підтвердити
            </button>
            <button onClick={handleRejectInvite} disabled={isLoading} className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 font-medium">
              <XCircle className="w-5 h-5 mr-2" /> Відхилити
            </button>
          </div>
        </div>
      )}

      {userData?.doctorId ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 border-b border-gray-100 dark:border-gray-700">
            <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
              <UserCheck className="w-12 h-12 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{userData.doctorName}</h3>
              <p className="text-teal-600 dark:text-teal-400 font-medium flex items-center mb-3">
                <ShieldAlert className="w-4 h-4 mr-1" /> Має доступ до ваших показників
              </p>
              {doctorDetails && (
                <div className="flex flex-col gap-2 mt-4 text-gray-600 dark:text-gray-300">
                  <a href={`tel:${doctorDetails.phoneNumber}`} className="flex items-center hover:text-teal-600 transition-colors w-fit">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" /> {doctorDetails.phoneNumber || 'Телефон не вказано'}
                  </a>
                  <a href={`mailto:${doctorDetails.email}`} className="flex items-center hover:text-teal-600 transition-colors w-fit">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" /> {doctorDetails.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 flex flex-wrap gap-3">
            <button onClick={handleRequestConsultation} disabled={isLoading} className="flex items-center px-4 py-2 bg-teal-100 text-teal-700 hover:bg-teal-200 dark:bg-teal-900/40 dark:text-teal-300 rounded-lg transition-colors font-medium">
              <CalendarPlus className="w-4 h-4 mr-2" /> Запит на зв'язок
            </button>
            
            {/* НОВА КНОПКА ЕКСПОРТУ */}
            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg transition-colors font-medium">
              <Send className="w-4 h-4 mr-2" /> Надіслати звіт
            </button>

            <button onClick={handleDisconnect} disabled={isLoading} className="flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg transition-colors font-medium ml-auto">
              <UserMinus className="w-4 h-4 mr-2" /> Відкріпити
            </button>
          </div>
        </div>
      ) : !userData?.pendingDoctorId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Немає лікуючого лікаря</h3>
          <p className="text-gray-500 dark:text-gray-400">Очікуйте запрошення від фахівця.</p>
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