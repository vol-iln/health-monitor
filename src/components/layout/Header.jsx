import React from 'react';
import { Moon, Sun, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useAlerts } from '../../hooks/useAlerts';
import { logoutUser } from '../../services/authService';
import toast from 'react-hot-toast';

const Header = () => {
  const { currentUser, userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { totalAlerts, getCriticalCount } = useAlerts();

  const handleLogout = async () => {
    if (window.confirm('Ви впевнені, що хочете вийти?')) {
      const result = await logoutUser();
      if (result.success) {
        toast.success('Ви вийшли з системи');
      }
    }
  };

  const criticalAlerts = getCriticalCount();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Health Monitor
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Моніторинг здоров'я
              </p>
            </div>
          </div>

          {/* Права частина */}
          <div className="flex items-center space-x-3">
            {/* Сповіщення */}
            {totalAlerts > 0 && (
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                    criticalAlerts > 0 ? 'bg-red-500' : 'bg-yellow-500'
                  } animate-pulse`}></span>
                </button>
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {totalAlerts > 9 ? '9+' : totalAlerts}
                  </span>
                )}
              </div>
            )}

            {/* Інформація про користувача */}
            <div className="hidden md:flex items-center space-x-3 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {userData?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData?.name || 'Користувач'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {currentUser?.email}
                </p>
              </div>
            </div>

            {/* Перемикач теми */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={theme === 'light' ? 'Перемкнути на темну тему' : 'Перемкнути на світлу тему'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-700" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-400" />
              )}
            </button>

            {/* Кнопка виходу */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              title="Вийти з системи"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Вийти</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;