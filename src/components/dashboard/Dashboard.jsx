import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext';
import { calculateBMI, getBMICategory, calculateAge } from '../../utils/calculations';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import HealthRadarWidget from './HealthRadarWidget';
import SOSButton from './SOSButton';

const Dashboard = ({ onNavigate }) => {
  const { userData } = useAuth();
  const { healthData } = useHealthData();

  // Обчислення статистики
  const totalRecords = healthData.length;
  const age = userData?.birthYear ? calculateAge(userData.birthYear) : null;
  const bmi = userData?.height && userData?.weight ? calculateBMI(userData.weight, userData.height) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  // Підрахунок записів за останній тиждень
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRecords = healthData.filter(item => new Date(item.date) >= weekAgo).length;

  const userName = userData?.name || 'Користувач';
  const firstLetter = userName.charAt(0).toUpperCase();

  // Перевіряємо, чи ввімкнена кнопка SOS у налаштуваннях профілю пацієнта (за замовчуванням true)
  const isSOSButtonEnabled = userData?.enableSOSButton !== false;

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in relative pb-10">
      
      {/* 1. ПРИВІТАННЯ (Преміум картка) */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-80 h-80 bg-sky-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-wide text-emerald-50 uppercase">
              {userData?.role === 'admin' ? 'Кабінет лікаря' : 'Особистий кабінет'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3">
            Вітаємо, {userName}! 🎉
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Ваша панель управління здоров'ям. Перевірте свої показники, аналізуйте зміни та досягайте нових цілей.
          </p>
        </div>
      </div>

      {/* 2. ОСНОВНА СТАТИСТИКА */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon="📊" title="Всього записів" value={totalRecords} color="blue" description="Загальна кількість" />
        <StatsCard icon="📅" title="За тиждень" value={weekRecords} color="green" description="Останні 7 днів" />
        
        {age && userData?.role === 'user' && (
          <StatsCard icon="🎂" title="Вік" value={age} unit="років" color="purple" />
        )}
        {bmi && userData?.role === 'user' && (
          <StatsCard icon="⚖️" title="BMI" value={bmi} color={bmiCategory.color} description={bmiCategory.text} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. ВАШ ПРОФІЛЬ */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300 flex flex-col h-full">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 tracking-tight flex items-center space-x-2">
            <span className="text-2xl drop-shadow-sm">👤</span>
            <span>Ваш профіль</span>
          </h3>
          
          <div className="flex items-center space-x-5 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-500/30">
              {firstLetter}
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">
                {userData?.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {userData?.email}
              </p>
              <span className="inline-block mt-2 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider rounded-lg">
                {userData?.role === 'admin' ? 'Лікар' : 'Пацієнт'}
              </span>
            </div>
          </div>

          {userData?.role === 'user' && (
            <div className="space-y-3 flex-grow">
              <div className="flex justify-between items-center p-4 bg-sky-50 dark:bg-sky-900/10 rounded-2xl border border-transparent">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Ріст</span>
                <span className="text-sky-700 dark:text-sky-400 font-semibold">{userData.height} см</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-transparent">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Вага</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{userData.weight} кг</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-transparent">
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Рік народження</span>
                <span className="text-indigo-700 dark:text-indigo-400 font-semibold">{userData.birthYear}</span>
              </div>
            </div>
          )}
        </div>

        {/* 4. ШВИДКІ ДІЇ */}
        <div className="h-full">
          <QuickActions onNavigate={onNavigate} />
        </div>
      </div>

      {/* 5. АНАЛІТИКА (Радар здоров'я) */}
      <div className="w-full">
        <HealthRadarWidget />
      </div>
      
      {/* 6. ІНСТРУКЦІЇ */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-colors duration-300">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6 tracking-tight flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
          <span>Швидкий старт</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex items-start space-x-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <span className="text-2xl mt-0.5 drop-shadow-sm">1️⃣</span>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-1.5">Додайте дані</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Перейдіть до розділу "Показники" та додайте свої перші дані</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <span className="text-2xl mt-0.5 drop-shadow-sm">2️⃣</span>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-1.5">Аналізуйте</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Переглядайте графіки та аналізуйте свої життєві тенденції</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
            <span className="text-2xl mt-0.5 drop-shadow-sm">3️⃣</span>
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-white mb-1.5">Налаштуйте</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Встановіть сповіщення для безпечного контролю показників</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚨 Рендеримо кнопку SOS ТІЛЬКИ якщо вона не вимкнена в налаштуваннях пацієнта */}
      {isSOSButtonEnabled && <SOSButton />}
      
    </div>
  );
};

export default Dashboard;