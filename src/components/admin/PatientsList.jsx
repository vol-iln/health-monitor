import React, { useState, useEffect } from 'react';
import { Users, Search, UserPlus, Activity, BellRing, Eye, Heart, Clock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const sendTelegramAlert = async (chatId, message) => {
  if (!chatId) return; 
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN; 
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text: message }) });
  } catch (error) { console.error('Помилка Телеграм:', error); }
};

const PatientsList = () => {
  const { currentUser, userData } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]); 
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHealthData, setPatientHealthData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const formatKyivTime = (dateInput) => {
    if (!dateInput) return { date: '-', time: '-' };
    let d;
    try {
      if (dateInput?.toDate) d = dateInput.toDate();
      else {
        let dateStr = String(dateInput);
        if (dateStr.includes('T') && !dateStr.endsWith('Z')) dateStr += 'Z';
        d = new Date(dateStr);
      }
      if (isNaN(d.getTime())) return { date: '-', time: '-' };
      return {
        date: d.toLocaleDateString('uk-UA', { timeZone: 'Europe/Kyiv' }),
        time: d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Kyiv' })
      };
    } catch (e) { return { date: '-', time: '-' }; }
  };

  const getLatestVitals = (data) => {
    const vitals = { pressure: { value: '-' }, pulse: { value: '-' }, sugar: { value: '-' }, temperature: { value: '-' }, oxygen: { value: '-' }, weight: { value: '-' } };
    const p = data.find(r => r.type === 'pressure' || (r.systolic && r.diastolic));
    if (p) vitals.pressure.value = p.value || `${p.systolic}/${p.diastolic} мм рт.ст.`;
    const pulse = data.find(r => r.type === 'pulse');
    if (pulse) vitals.pulse.value = `${pulse.value} уд/хв`;
    const sugar = data.find(r => r.type === 'blood_sugar' || r.type === 'sugar');
    if (sugar) vitals.sugar.value = `${sugar.value} ммоль/л`;
    const temp = data.find(r => r.type === 'temperature');
    if (temp) vitals.temperature.value = `${temp.value} °C`;
    const oxy = data.find(r => r.type === 'oxygen');
    if (oxy) vitals.oxygen.value = `${oxy.value} %`;
    const weight = data.find(r => r.type === 'weight');
    if (weight) vitals.weight.value = `${weight.value} кг`;
    return vitals;
  };

  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(collection(db, 'users'), where('doctorId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingPatients(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedPatient?.id) return;
    setLoadingData(true);
    const q = query(collection(db, 'healthData'), where('userId', '==', selectedPatient.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dataList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dataList.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });
      setPatientHealthData(dataList);
      setLoadingData(false);
    });
    return () => unsubscribe();
  }, [selectedPatient?.id]);

  const handleInvitePatient = async (e) => {
    e.preventDefault();
    if (!searchEmail) return toast.error('Введіть email пацієнта');
    setIsLoading(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) { toast.error('Пацієнта з таким email не знайдено'); setIsLoading(false); return; }
      const patientDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'users', patientDoc.id), { pendingDoctorId: currentUser.uid, pendingDoctorName: userData?.name || 'Лікар' });
      toast.success('Запрошення надіслано!');
      if (patientDoc.data().telegramId) await sendTelegramAlert(patientDoc.data().telegramId, `🔔 Нове запрошення від лікаря!`);
      setSearchEmail('');
    } catch (error) { toast.error('Помилка відправки'); }
    setIsLoading(false);
  };

  const handleNotifyPatient = async (patient) => {
    try {
      await updateDoc(doc(db, 'users', patient.id), { needUpdate: true });
      toast.success('Сповіщення надіслано!');
      if (patient.telegramId) await sendTelegramAlert(patient.telegramId, `🔔 Лікар просить оновити показники.`);
    } catch (error) { toast.error('Помилка'); }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2 flex items-center"><Users className="w-8 h-8 mr-3 text-emerald-400" /> Кабінет Лікаря</h2>
        <p className="text-slate-400 text-lg">Запрошення та моніторинг пацієнтів</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center"><UserPlus className="w-5 h-5 mr-2 text-rose-500" /> Додати пацієнта</h3>
        <form onSubmit={handleInvitePatient} className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input type="email" placeholder="Email пацієнта..." value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none" />
          </div>
          <button type="submit" disabled={isLoading} className="px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-medium">Відправити</button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 p-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Мої пацієнти</h3>
        {loadingPatients ? <div className="text-center py-4 text-slate-500">Завантаження...</div> : (
          <div className="space-y-4">
            {patients.map(patient => {
              const isSelected = selectedPatient?.id === patient.id;
              const latestVitals = isSelected ? getLatestVitals(patientHealthData) : null;
              
              const colors = { pressure: 'text-blue-600 dark:text-blue-400', pulse: 'text-rose-600 dark:text-rose-400', sugar: 'text-amber-600 dark:text-amber-400', temperature: 'text-emerald-600 dark:text-emerald-400', oxygen: 'text-cyan-600 dark:text-cyan-400', weight: 'text-indigo-600 dark:text-indigo-400' };
              const labels = { pressure: 'Тиск', pulse: 'Пульс', sugar: 'Цукор', temperature: 'Температура', oxygen: 'Кисень', weight: 'Вага' };

              return (
                <div key={patient.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">{patient.name || 'Користувач без імені'}</span>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap gap-x-4">
                        <span>{patient.email}</span>
                        <span className="flex items-center text-blue-600 dark:text-blue-400"><Phone className="w-3 h-3 mr-1" /> {patient.phoneNumber || 'Не вказано'}</span>
                      </p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {
                          if (patient.shareWithDoctors === false) {
                            return toast.error("⚠️ Пацієнт заборонив перегляд своїх даних");
                          }
                          setSelectedPatient(isSelected ? null : patient);
                        }}
                        className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                          isSelected ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                      >
                        {isSelected ? 'Сховати' : 'Актуальний стан'}
                      </button>
                      <button onClick={() => handleNotifyPatient(patient)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition">
                        <BellRing className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {loadingData ? <p className="text-sm text-slate-500">Синхронізація...</p> : (
                        Object.entries(latestVitals).filter(([k]) => k !== 'notes').map(([key, data]) => (
                          <div key={key} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] uppercase text-slate-400 font-bold">{labels[key]}</p>
                            <p className={`font-bold ${colors[key]}`}>{data.value}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsList;