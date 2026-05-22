import React from 'react';
import { Home, Activity, BarChart3, Bell, Download, User, Shield, Settings, Apple, Users, Stethoscope } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { userData } = useAuth();

  // Повернули твої унікальні градієнти для кожного пункту
  const menuItems = [
    { id: 'home', name: 'Головна', icon: Home, description: 'Огляд', gradient: 'from-blue-500 to-blue-600' },
    { id: 'health-data', name: 'Показники', icon: Activity, description: 'Дані здоров\'я', gradient: 'from-red-500 to-pink-600' },
    { id: 'nutrition', name: 'Харчування', icon: Apple, description: 'Трекер калорій', gradient: 'from-orange-400 to-amber-500' },
    { id: 'charts', name: 'Графіки', icon: BarChart3, description: 'Аналітика', gradient: 'from-green-500 to-emerald-600' },
    { id: 'alerts', name: 'Сповіщення', icon: Bell, description: 'Попередження', gradient: 'from-yellow-500 to-orange-600' },
    { id: 'export', name: 'Експорт', icon: Download, description: 'Завантаження', gradient: 'from-purple-500 to-indigo-600' },
    { id: 'profile', name: 'Мій профіль', icon: User, description: 'Картка пацієнта', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'settings', name: 'Налаштування', icon: Settings, description: 'Параметри системи', gradient: 'from-slate-500 to-slate-600' },
    ...(userData?.role === 'admin' ? [{ id: 'admin', name: 'Мої пацієнти', icon: Users, description: 'Кабінет лікаря', gradient: 'from-rose-500 to-red-600' }] : []),
    ...(userData?.role !== 'admin' ? [{ id: 'my-doctor', name: 'Мій лікар', icon: Stethoscope, description: 'Зв\'язок з лікарем', gradient: 'from-teal-500 to-emerald-600' }] : [])
  ];

  return (
    <aside className="w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800 min-h-[calc(100vh-64px)] sticky top-16 z-30 transition-colors duration-300">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 outline-none ${
                isActive
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-${item.gradient.split('-')[1]}/30 transform scale-105`
                  : `bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:scale-[1.02]`
              }`}
              title={item.description}
            >
              <div className="relative flex items-center space-x-3 px-4 py-3.5">
                
                {/* Іконка */}
                <div className={`p-2 rounded-lg transition-colors duration-300 ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                }`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                
                {/* Текст */}
                <div className="flex-1 text-left">
                  <span className={`block transition-all duration-300 ${
                    isActive 
                      ? 'font-bold text-white text-[15px]' 
                      : 'font-semibold text-slate-700 dark:text-slate-200 text-sm group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    {item.name}
                  </span>
                  <span className={`block transition-all duration-300 ${
                    isActive 
                      ? 'text-white/80 text-xs font-medium' 
                      : 'text-slate-400 dark:text-slate-500 text-[11px]'
                  }`}>
                    {item.description}
                  </span>
                </div>

              </div>
            </button>
          );
        })} 
      </nav>
    </aside>
  );
};

export default Sidebar;