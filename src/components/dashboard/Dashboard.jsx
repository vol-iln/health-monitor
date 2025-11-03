import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHealthData } from '../../contexts/HealthDataContext';
import { calculateBMI, getBMICategory, calculateAge } from '../../utils/calculations';
import StatsCard from './StatsCard';
import QuickActions from './QuickActions';
import { TrendingUp, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
  const { userData } = useAuth();
  const { healthData } = useHealthData();

  // Обчислення статистики
  const totalRecords = healthData.length;
  const age = userData?.birthYear ? calculateAge(userData.birthYear) : null;
  const bmi = userData?.height && userData?.weight ? calculateBMI(userData.weight, userData.height) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  // Останні записи
  const recentRecords = healthData.slice(0, 5);

  // Підрахунок записів за останній тиждень
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekRecords = healthData.filter(item => new Date(item.date) >= weekAgo).length;

  return (
   <div className="space-y-6 relative min-h-screen p-6 bg-gradient-to-br from-amber-100 via-yellow-200 to-orange-300 dark:from-stone-900 dark:via-amber-900 dark:to-yellow-800">
  {/* Вітання */}
  <div className="relative overflow-hidden rounded-3xl shadow-2xl p-8 text-gray-900 dark:text-amber-100 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700 dark:from-yellow-700 dark:via-orange-800 dark:to-amber-900 transition-transform transform hover:scale-[1.02]">
    {/* Світлові ефекти */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_60%)] opacity-70 pointer-events-none" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.2),transparent_70%)] opacity-60 pointer-events-none" />

    <div className="relative z-10">
      <h2 className="text-4xl font-extrabold mb-3 drop-shadow-lg">
        Вітаємо, {userData?.name || "користувачу"}! 🎉
      </h2>
      <p className="text-lg">
        Ласкаво просимо в систему моніторингу здоров’я.  
        <span className="block text-sm mt-1">
          Перевірте свої показники, аналізуйте зміни та досягайте цілей 💪
        </span>
      </p>
    </div>
  </div>


      {/* Основна статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          icon="📊"
          title="Всього записів"
          value={totalRecords}
          color="blue"
          description="Загальна кількість"
        />
        
        <StatsCard
          icon="📅"
          title="За тиждень"
          value={weekRecords}
          color="green"
          description="Останні 7 днів"
        />
        
        {age && (
          <StatsCard
            icon="🎂"
            title="Вік"
            value={age}
            unit="років"
            color="purple"
          />
        )}
        
        {bmi && (
          <StatsCard
            icon="⚖️"
            title="BMI"
            value={bmi}
            color={bmiCategory.color}
            description={bmiCategory.text}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Профіль користувача */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <span className="text-2xl">👤</span>
            <span>Ваш профіль</span>
          </h3>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {userData?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userData?.email}
              </p>
            </div>
          </div>

          {userData && (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Ріст:</span>
                <span className="text-blue-700 dark:text-blue-300 font-bold">
                  {userData.height} см
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Вага:</span>
                <span className="text-green-700 dark:text-green-300 font-bold">
                  {userData.weight} кг
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Рік народження:</span>
                <span className="text-purple-700 dark:text-purple-300 font-bold">
                  {userData.birthYear}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Швидкі дії */}
        <QuickActions onNavigate={onNavigate} />
      </div>

      {/* Інструкції */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <span>Швидкий старт</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
            <span className="text-3xl flex-shrink-0">1️⃣</span>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Додайте дані</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Перейдіть до розділу "Показники" та додайте свої перші дані
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
            <span className="text-3xl flex-shrink-0">2️⃣</span>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Аналізуйте</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Переглядайте графіки та аналізуйте тенденції
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <span className="text-3xl flex-shrink-0">3️⃣</span>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-1">Налаштуйте</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Встановіть сповіщення для контролю показників
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;