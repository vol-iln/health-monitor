import React from 'react';
import { Home, Activity, BarChart3, Bell, Download, User, Shield, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { userData } = useAuth();

  const menuItems = [
    { 
      id: 'home', 
      name: 'Головна', 
      icon: Home, 
      description: 'Огляд',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700'
    },
    { 
      id: 'health-data', 
      name: 'Показники', 
      icon: Activity, 
      description: 'Дані здоров\'я',
      gradient: 'from-red-500 to-pink-600',
      hoverGradient: 'hover:from-red-600 hover:to-pink-700'
    },
    { 
      id: 'charts', 
      name: 'Графіки', 
      icon: BarChart3, 
      description: 'Аналітика',
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-700'
    },
    { 
      id: 'alerts', 
      name: 'Сповіщення', 
      icon: Bell, 
      description: 'Попередження',
      gradient: 'from-yellow-500 to-orange-600',
      hoverGradient: 'hover:from-yellow-600 hover:to-orange-700'
    },
    { 
      id: 'export', 
      name: 'Експорт', 
      icon: Download, 
      description: 'Завантаження',
      gradient: 'from-purple-500 to-indigo-600',
      hoverGradient: 'hover:from-purple-600 hover:to-indigo-700'
    },
    { 
      id: 'profile', 
      name: 'Профіль', 
      icon: User, 
      description: 'Персональні дані',
      gradient: 'from-cyan-500 to-blue-600',
      hoverGradient: 'hover:from-cyan-600 hover:to-blue-700'
    },
    { 
      id: 'settings', 
      name: 'Налаштування', 
      icon: Settings, 
      description: 'Параметри системи',
      gradient: 'from-gray-500 to-gray-600',
      hoverGradient: 'hover:from-gray-600 hover:to-gray-700'
    },
    ...(userData?.role === 'admin' ? [{
      id: 'admin', 
      name: 'Адмін', 
      icon: Shield, 
      description: 'Адмін панель',
      gradient: 'from-rose-500 to-red-600',
      hoverGradient: 'hover:from-rose-600 hover:to-red-700'
    }] : [])
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg min-h-[calc(100vh-64px)] sticky top-16">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105`
                  : `bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ${item.hoverGradient} hover:text-white hover:shadow-md hover:scale-102`
              }`}
              title={item.description}
            >
              {/* Ефект блиску */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 ${!isActive && 'group-hover:opacity-20'} transition-opacity duration-500`}></div>
              
              <div className="relative flex items-center space-x-3 px-4 py-3">
                <div className={`p-2 rounded-lg ${
                  isActive 
                    ? 'bg-white/20' 
                    : 'bg-white/50 dark:bg-gray-800/50 group-hover:bg-white/20'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 text-left">
                  <span className={`font-semibold block transition-all ${
                    isActive ? 'text-white' : 'group-hover:text-white'
                  }`}>
                    {item.name}
                  </span>
                  <span className={`text-xs transition-all ${
                    isActive 
                      ? 'text-white/80' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-white/80'
                  }`}>
                    {item.description}
                  </span>
                </div>
                
                {isActive && (
                  <div className="w-1 h-8 bg-white rounded-full shadow-lg"></div>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;