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

  useEffect(() => {
    if (userData && userData.role === 'user') {
      setShowTooltip(true);
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [userData]);

  if (!userData || userData.role !== 'user' || userData.enableSOSButton === false) {
    return null;
  }

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

  const getCoordinates = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      const timeoutId = setTimeout(() => { resolve(null); }, 5000);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({ 
            lat: position.coords.latitude, 
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy) 
          });
        },
        (error) => {
          console.warn('Помилка геоданих:', error);
          clearTimeout(timeoutId);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 4500, maximumAge: 0 }
      );
    });
  };

  // ОТРИМАННЯ АДРЕСИ ЗА КООРДИНАТАМИ 
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || '';
        const street = data.address.road || '';
        const house = data.address.house_number || '';
        
        let fullAddress = '';
        if (city) fullAddress += `м. ${city}`;
        if (street) fullAddress += (fullAddress ? ', ' : '') + `вул. ${street}`;
        if (house) fullAddress += ` ${house}`;
        
        return fullAddress || null;
      }
    } catch (error) {
      console.warn('Не вдалося отримати адресу:', error);
    }
    return null;
  };

  const handleSOSClick = async () => {
    setLoading(true);
    setShowTooltip(false);

    try {
      if (!userData.doctorId) {
        toast.error('⚠️ У вас не підключений лікар для відправки SOS! Терміново телефонуйте 103.');
        setLoading(false);
        return;
      }

      const doctorSnap = await getDoc(doc(db, 'users', userData.doctorId));
      if (!doctorSnap.exists()) {
        toast.error('Не вдалося знайти вашого лікаря в базі. Терміново телефонуйте 103.');
        setLoading(false);
        return;
      }

      const doctorData = doctorSnap.data();

      if (doctorData.enableSOSNotifications === false) {
        toast.error('Лікар тимчасово вимкнув прийом екстрених сповіщень. Терміново телефонуйте 103!', { duration: 8000, icon: '🚑' });
        setLoading(false);
        return;
      }

      if (doctorData.telegramId) {
        toast('Визначаємо локацію та відправляємо виклик...', { icon: '📡' });

        const coords = await getCoordinates();
        const patientName = userData.name || currentUser.email;
        const phoneInfo = userData.phoneNumber ? `\n📞 Телефон: ${userData.phoneNumber}` : '';
        
        let locationText = '';
        if (coords) {
          // Отримуємо назву вулиці та міста
          const address = await getAddressFromCoords(coords.lat, coords.lng);
          const mapsLink = `http://maps.google.com/maps?q=${coords.lat},${coords.lng}`;
          
          locationText = `\n\n📍 Локація пацієнта:\n`;
          if (address) {
            locationText += `🏠 Приблизна адреса: ${address}\n`;
          }
          locationText += `🗺 Карта: ${mapsLink}`;
        } else {
          locationText = `\n\n📍 Локація: Геодані недоступні (немає дозволу або вимкнено GPS).`;
        }

        const message = `🚨 SOS! ЕКСТРЕНИЙ ВИКЛИК! 🚨\n\nПацієнт ${patientName} щойно натиснув кнопку SOS на сайті!${phoneInfo}\n\nМожливо, потрібна швидка допомога. Терміново зв'яжіться з пацієнтом!${locationText}`;
        
        await sendTelegramAlert(doctorData.telegramId, message);
        
        toast.success('Екстрене сповіщення миттєво відправлено лікарю! 🚑 Залишайтеся на місці.', { 
          duration: 8000,
          style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #f87171', fontWeight: 'bold' }
        });
      } else {
        toast.error('У вашого лікаря не підключений Telegram. Терміново телефонуйте 103!');
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
      
      {/* Спливаюче віконце */}
      {showTooltip && (
        <div className="mb-4 w-72 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl relative animate-fade-in-up border border-slate-700/50 transition-all duration-500">
          <button 
            onClick={() => setShowTooltip(false)} 
            className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-full p-1"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start space-x-3">
            <div className="p-1.5 bg-rose-500/20 rounded-lg flex-shrink-0 mt-0.5">
              <Info className="w-5 h-5 text-rose-400" />
            </div>
            <div className="text-sm font-medium leading-relaxed pr-2">
              <span className="text-rose-400 font-bold block mb-1">Обережно!</span>
              Кнопка екстреного виклику. Натискайте <strong className="text-rose-300">лише</strong> в разі реальної загрози здоров'ю.
            </div>
          </div>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900/95 transform rotate-45 border-b border-r border-slate-700/50"></div>
        </div>
      )}

      {/* Сама кнопка SOS */}
      <button
        onClick={handleSOSClick}
        disabled={loading}
        className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white rounded-full shadow-[0_0_20px_rgba(225,29,72,0.5)] hover:shadow-[0_0_30px_rgba(225,29,72,0.8)] transition-all duration-300 animate-pulse group ring-4 ring-rose-500/30"
        title="Екстрений виклик лікаря"
      >
        {loading ? (
          <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <AlertOctagon className="w-8 h-8 group-hover:scale-110 transition-transform" />
        )}
      </button>

    </div>
  );
};

export default SOSButton;