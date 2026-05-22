import React, { useState } from 'react';
import { User, Edit2, Mail, Calendar, Ruler, Weight, Save, X, ShieldCheck, Info, Fingerprint } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { updateProfile } from 'firebase/auth';
import Input from '../common/Input';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { currentUser, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    height: userData?.height || '',
    weight: userData?.weight || '',
    birthYear: userData?.birthYear || ''
  });

  const isPatient = userData?.role === 'user'; // Перевіряємо, чи це пацієнт

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(currentUser, { displayName: formData.name });

      const updateData = {
        name: formData.name,
        updatedAt: new Date().toISOString()
      };

      // Зберігаємо медичні дані ТІЛЬКИ якщо це пацієнт
      if (isPatient) {
        updateData.height = Number(formData.height);
        updateData.weight = Number(formData.weight);
        updateData.birthYear = Number(formData.birthYear);
      }

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, updateData);

      toast.success('Профіль успішно оновлено! 🎉');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Помилка оновлення профілю');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || '',
      height: userData?.height || '',
      weight: userData?.weight || '',
      birthYear: userData?.birthYear || ''
    });
    setIsEditing(false);
  };

  const calculateAge = () => {
    if (!userData?.birthYear) return '-';
    return new Date().getFullYear() - userData.birthYear;
  };

  const calculateBMI = () => {
    if (!userData?.height || !userData?.weight) return '-';
    const heightInMeters = userData.height / 100;
    const bmi = userData.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi === '-') return { text: '-', color: 'slate', bg: 'bg-slate-100 dark:bg-slate-800' };
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { text: 'Недостатня вага', color: 'sky', bg: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-500/20' };
    if (bmiNum < 25) return { text: 'Нормальна вага', color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' };
    if (bmiNum < 30) return { text: 'Надлишкова вага', color: 'amber', bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' };
    return { text: 'Ожиріння', color: 'rose', bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-10">
      
      {/* ПРЕМІАЛЬНА ШАПКА */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        
        <div className="relative z-10 mb-6 sm:mb-0">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-2 flex items-center">
            <User className="w-8 h-8 mr-3 text-cyan-400" />
            Мій профіль
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Керуйте своїми {isPatient ? 'персональними та медичними' : 'особистими'} даними.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="relative z-10 flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all backdrop-blur-md border border-white/10"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            <span>Редагувати</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* ЛІВА КОЛОНКА (Розширюється на весь екран, якщо це лікар) */}
        <div className={`space-y-6 ${isPatient ? 'xl:col-span-8' : 'xl:col-span-12'}`}>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 h-full">
            
            {/* Аватар та ім'я */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center text-white text-5xl font-bold shadow-lg flex-shrink-0 ${isPatient ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/20' : 'bg-gradient-to-br from-rose-500 to-red-500 shadow-rose-500/20'}`}>
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                  {userData?.name || 'Користувач'}
                </h3>
                <div className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  {currentUser?.email}
                </div>
              </div>
            </div>

            {/* Блок перегляду/редагування */}
            {isEditing ? (
              <div className="space-y-6 animate-fade-in">
                <Input
                  label="Ваше ім'я"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Введіть ваше ім'я"
                  required
                />

                {isPatient && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Input
                      label="Ріст (см)"
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="170"
                      required
                      min="50"
                      max="250"
                    />
                    <Input
                      label="Вага (кг)"
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="70"
                      required
                      min="20"
                      max="300"
                    />
                    <Input
                      label="Рік народження"
                      type="number"
                      name="birthYear"
                      value={formData.birthYear}
                      onChange={handleChange}
                      placeholder="1990"
                      required
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                  >
                    <X className="w-5 h-5 mr-2" />
                    <span>Скасувати</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    <span>{loading ? 'Збереження...' : 'Зберегти зміни'}</span>
                  </button>
                </div>
              </div>
            ) : (
              isPatient && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                  
                  {/* ВИПРАВЛЕНО КОЛЬОРИ ДЛЯ ТЕМНОЇ ТЕМИ */}
                  <div className="flex flex-col p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center space-x-2 mb-3 opacity-80 text-slate-700 dark:text-slate-300">
                      <Ruler className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Ріст</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {userData?.height || '-'} <span className="text-sm font-medium ml-1 text-slate-500 dark:text-slate-400">см</span>
                    </div>
                  </div>

                  <div className="flex flex-col p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center space-x-2 mb-3 opacity-80 text-slate-700 dark:text-slate-300">
                      <Weight className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Вага</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {userData?.weight || '-'} <span className="text-sm font-medium ml-1 text-slate-500 dark:text-slate-400">кг</span>
                    </div>
                  </div>

                  <div className="flex flex-col p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center space-x-2 mb-3 opacity-80 text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Рік нар.</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {userData?.birthYear || '-'}
                    </div>
                  </div>

                  <div className="flex flex-col p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center space-x-2 mb-3 opacity-80 text-slate-700 dark:text-slate-300">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">Вік</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {calculateAge()} <span className="text-sm font-medium ml-1 text-slate-500 dark:text-slate-400">років</span>
                    </div>
                  </div>

                </div>
              )
            )}
          </div>
        </div>

        {/* ПРАВА КОЛОНКА: BMI (Показуємо ТІЛЬКИ пацієнтам) */}
        {isPatient && (
          <div className="xl:col-span-4 space-y-6">
            <div className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border ${bmiCategory.text !== '-' ? `border-${bmiCategory.color}-200 dark:border-${bmiCategory.color}-900/50` : 'border-slate-200/60 dark:border-slate-800'} shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 overflow-hidden relative transition-colors duration-500 h-full flex flex-col`}>
              
              {/* Фонове світіння для BMI */}
              {bmiCategory.text !== '-' && (
                <div className={`absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-${bmiCategory.color}-500/10 rounded-full blur-[40px] pointer-events-none`}></div>
              )}

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 relative z-10 tracking-tight">
                Індекс маси тіла (BMI)
              </h3>
              
              <div className="text-center mb-8 relative z-10 flex-1">
                <div className={`text-6xl font-black tracking-tighter mb-4 ${bmiCategory.text !== '-' ? `text-${bmiCategory.color}-500 dark:text-${bmiCategory.color}-400` : 'text-slate-300 dark:text-slate-700'}`}>
                  {bmi}
                </div>
                <div className={`inline-flex px-4 py-1.5 rounded-xl text-sm font-bold border ${bmiCategory.bg}`}>
                  {bmiCategory.text}
                </div>
              </div>

              <div className="space-y-3 text-sm relative z-10 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Недостатня вага:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">&lt; 18.5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Норма:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">18.5 - 24.9</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Надлишкова вага:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">25 - 29.9</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Ожиріння:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">&ge; 30</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* НИЖНІЙ БЛОК: ІНФОРМАЦІЯ ПРО АКАУНТ */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center tracking-tight">
          <ShieldCheck className="w-6 h-6 mr-3 text-slate-400" />
          Системна інформація
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Основний Email</p>
            <p className="text-slate-900 dark:text-white font-semibold truncate">{currentUser?.email}</p>
          </div>
          
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Дата реєстрації</p>
            <p className="text-slate-900 dark:text-white font-semibold">
              {userData?.createdAt 
                ? new Date(userData.createdAt).toLocaleDateString('uk-UA', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })
                : '-'}
            </p>
          </div>
          
          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Права доступу</p>
            <p className="text-slate-900 dark:text-white font-semibold flex items-center">
              {userData?.role === 'admin' ? (
                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded-md text-xs">Лікар</span>
              ) : (
                <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-md text-xs">Пацієнт</span>
              )}
            </p>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
              <Fingerprint className="w-3 h-3 mr-1.5" /> ID Користувача
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] break-all">
              {currentUser?.uid}
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default UserProfile;