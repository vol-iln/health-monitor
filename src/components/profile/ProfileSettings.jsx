import React, { useState } from 'react';
import { Shield, Eye, Trash2, Key, MessageCircle, Save, Phone, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { deleteUser, updatePassword } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Button from '../common/Button';
import Input from '../common/Input';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { currentUser, userData } = useAuth();
  
  const isAdmin = userData?.role === 'admin';
  const isPatient = !isAdmin;

  // Стани
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [telegramId, setTelegramId] = useState(userData?.telegramId || '');
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || '');
  const [loading, setLoading] = useState(false);

  // Стани перемикачів (зберігаємо з БД, за замовчуванням true)
  const [shareWithDoctors, setShareWithDoctors] = useState(userData?.shareWithDoctors ?? true);
  const [enableSOSButton, setEnableSOSButton] = useState(userData?.enableSOSButton ?? true);
  const [enableSOSNotifications, setEnableSOSNotifications] = useState(userData?.enableSOSNotifications ?? true);

  // --- ОБРОБНИКИ ПЕРЕМИКАЧІВ ---

  const handleToggleShare = async () => {
    const newValue = !shareWithDoctors;
    setShareWithDoctors(newValue); 
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { shareWithDoctors: newValue });
      toast.success(newValue ? 'Доступ лікарям відкрито 🟢' : 'Доступ лікарям закрито 🔴', { style: { borderRadius: '12px', background: '#1e293b', color: '#fff' } });
    } catch (error) {
      toast.error('Помилка збереження налаштувань');
      setShareWithDoctors(!newValue);
    }
  };

  const handleToggleSOSButton = async () => {
    const newValue = !enableSOSButton;
    setEnableSOSButton(newValue); 
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { enableSOSButton: newValue });
      toast.success(newValue ? 'Кнопку SOS увімкнено 🚨' : 'Кнопку SOS приховано 🔕');
    } catch (error) {
      toast.error('Помилка збереження');
      setEnableSOSButton(!newValue);
    }
  };

  const handleToggleSOSNotifications = async () => {
    const newValue = !enableSOSNotifications;
    setEnableSOSNotifications(newValue); 
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { enableSOSNotifications: newValue });
      toast.success(newValue ? 'SOS сповіщення увімкнено 🔊' : 'SOS сповіщення вимкнено 🔇');
    } catch (error) {
      toast.error('Помилка збереження');
      setEnableSOSNotifications(!newValue);
    }
  };

  // --- ІНШІ ОБРОБНИКИ ---

  const handlePasswordChange = async () => {
    if (passwordData.newPassword.length < 6) return toast.error('Пароль має бути мінімум 6 символів');
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Паролі не співпадають');
    
    setLoading(true);
    try {
      await updatePassword(currentUser, passwordData.newPassword);
      toast.success('Пароль успішно змінено! ✅');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') toast.error('Для зміни паролю потрібно повторно увійти в систему');
      else toast.error('Помилка зміни паролю');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTelegram = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { telegramId: telegramId });
      toast.success('Telegram ID успішно збережено!');
    } catch (error) { toast.error('Не вдалося зберегти налаштування'); }
    setLoading(false);
  };

  const handleSavePhone = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { phoneNumber: phoneNumber });
      toast.success('Номер телефону успішно збережено!');
    } catch (error) { toast.error('Не вдалося зберегти номер'); }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('⚠️ ВИ ВПЕВНЕНІ?\n\nВидалення акаунту незворотнє! Введіть "ВИДАЛИТИ" для підтвердження');
    if (!confirmed) return;
    const confirmText = window.prompt('Введіть "ВИДАЛИТИ" для підтвердження:');
    if (confirmText !== 'ВИДАЛИТИ') return toast.error('Скасовано');

    setLoading(true);
    try {
      const healthDataQuery = query(collection(db, 'healthData'), where('userId', '==', currentUser.uid));
      const healthDataSnapshot = await getDocs(healthDataQuery);
      const deletePromises = healthDataSnapshot.docs.map(d => deleteDoc(d.ref));
      
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'users', currentUser.uid));
      await deleteUser(currentUser);
      toast.success('Акаунт видалено');
    } catch (error) { toast.error('Помилка видалення акаунту'); } 
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Налаштування</h2>
        <p className="text-slate-500 dark:text-slate-400">Керуйте приватністю, контактами та безпекою вашого акаунту</p>
      </div>

      {/* ПРИВАТНІСТЬ (Лише для пацієнтів) */}
      {isPatient && (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Eye className="w-6 h-6" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">Приватність</h3>
          </div>
          
          <div className="flex items-start justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <div className="flex-1 pr-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5">Ділитися даними з лікарем</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Якщо увімкнено, ваш лікуючий лікар зможе переглядати ваші показники здоров'я та аналітику. Якщо вимкнено — доступ буде закрито.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input type="checkbox" checked={shareWithDoctors} onChange={handleToggleShare} className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      )}

      {/* ЕКСТРЕНІ НАЛАШТУВАННЯ SOS */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">Екстрені налаштування (SOS)</h3>
        </div>
        
        {isPatient && (
          <div className="flex items-start justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <div className="flex-1 pr-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5">Відображати кнопку SOS</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Показувати велику червону кнопку SOS на екрані. Вимкніть, якщо ви випадково її натискаєте або вона вам не потрібна.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input type="checkbox" checked={enableSOSButton} onChange={handleToggleSOSButton} className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
            </label>
          </div>
        )}

        {isAdmin && (
          <div className="flex items-start justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <div className="flex-1 pr-4">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-1.5">Отримувати SOS сповіщення</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Якщо вимкнено, ви не будете отримувати тривожні повідомлення в Telegram, коли ваші пацієнти натискають кнопку SOS.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-1">
              <input type="checkbox" checked={enableSOSNotifications} onChange={handleToggleSOSNotifications} className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-blue-500"></div>
            </label>
          </div>
        )}
      </div>

      {/* БЕЗПЕКА ТА ПАРОЛЬ */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Shield className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">Безпека</h3>
        </div>
        
        {!showPasswordChange ? (
          <button onClick={() => setShowPasswordChange(true)} className="flex items-center space-x-3 px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 font-medium transition-colors border border-slate-200/60 dark:border-slate-700">
            <Key className="w-5 h-5 text-slate-400" />
            <span>Змінити пароль</span>
          </button>
        ) : (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-y-4 max-w-md">
            <Input label="Новий пароль" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Мінімум 6 символів" />
            <Input label="Підтвердіть пароль" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Повторіть пароль" />
            <div className="flex space-x-3 pt-2">
              <Button onClick={() => { setShowPasswordChange(false); setPasswordData({ newPassword: '', confirmPassword: '' }); }} className="bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600" fullWidth>Скасувати</Button>
              <Button onClick={handlePasswordChange} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white" fullWidth>{loading ? 'Збереження...' : 'Зберегти'}</Button>
            </div>
          </div>
        )}
      </div>

      {/* КОНТАКТИ: ТЕЛЕФОН */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400">
            <Phone className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">Номер телефону</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
          Вкажіть актуальний номер, щоб лікар міг оперативно зв'язатися з вами в екстрених випадках.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
          <div className="flex-1">
            <Input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+380..." />
          </div>
          <Button onClick={handleSavePhone} disabled={loading} className="py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 flex items-center justify-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Зберегти</span>
          </Button>
        </div>
      </div>

      {/* КОНТАКТИ: TELEGRAM */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
            <MessageCircle className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">Telegram Сповіщення</h3>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl space-y-2 leading-relaxed">
          <p>Підключіть свій Telegram, щоб отримувати миттєві сповіщення від лікаря або попередження про критичні показники.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Знайдіть бота <strong className="text-slate-700 dark:text-slate-300">@getmyid_bot</strong> та скопіюйте цифри (Your ID).</li>
            <li>Вставте їх сюди і збережіть.</li>
            <li>Запустіть нашого медичного бота <strong className="text-slate-700 dark:text-slate-300">@health_monitors_bot</strong>.</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
          <div className="flex-1">
            <Input type="text" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} placeholder="Наприклад: 424281746" />
          </div>
          <Button onClick={handleSaveTelegram} disabled={loading} className="py-3 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Зберегти</span>
          </Button>
        </div>
      </div>

      {/* НЕБЕЗПЕЧНА ЗОНА */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-[2rem] border border-rose-200/60 dark:border-rose-900/50 p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 rounded-xl text-rose-600 dark:text-rose-400">
            <Trash2 className="w-6 h-6" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-semibold text-rose-900 dark:text-rose-300 tracking-tight">Небезпечна зона</h3>
        </div>
        <p className="text-rose-700 dark:text-rose-400/80 text-sm mb-6">
          Після видалення акаунту всі ваші медичні записи, історія та налаштування будуть безповоротно втрачені. Цю дію неможливо скасувати.
        </p>
        <button onClick={handleDeleteAccount} disabled={loading} className="flex items-center justify-center space-x-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-colors">
          <Trash2 className="w-5 h-5" />
          <span>{loading ? 'Видалення...' : 'Видалити акаунт назавжди'}</span>
        </button>
      </div>

    </div>
  );
};

export default ProfileSettings;