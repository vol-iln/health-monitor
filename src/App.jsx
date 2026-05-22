import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AuthLayout from './components/auth/AuthLayout';
import AddHealthData from './components/health-data/AddHealthData';
import { Moon, Sun, LogOut, HeartPulse } from 'lucide-react';
import { logoutUser } from './services/authService';
import toast from 'react-hot-toast';
import Analytics from './components/analytics/Analytics';
import ExportData from './components/export/ExportData';
import UserProfile from './components/profile/UserProfile';
import Alerts from './components/alerts/Alerts';
import AdminDashboard from './components/admin/AdminDashboard';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';
import ProfileSettings from './components/profile/ProfileSettings';
import Dashboard from './components/dashboard/Dashboard';
import NutritionWidget from './components/dashboard/NutritionWidget';
import PatientsList from './components/admin/PatientsList'; 
import MyDoctor from './components/profile/MyDoctor'; 

const MainApp = () => {
  const { currentUser, userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = async () => {
    if (window.confirm('Ви впевнені, що хочете вийти?')) {
      const result = await logoutUser();
      if (result.success) {
        toast.success('Ви вийшли з системи');
      }
    }
  };

  const userName = userData?.name || currentUser?.email || 'User';
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10b981&color=fff&rounded=true&bold=true`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-xl text-emerald-500">
                <HeartPulse className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block tracking-tight">
                Health Monitor
              </h1>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-5">
              
              <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 py-1.5 px-1.5 pr-4 rounded-full border border-gray-200/50 dark:border-gray-700">
                <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[120px]">
                  {userName}
                </span>
              </div>
              
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Sun className="w-5 h-5 text-yellow-400" strokeWidth={2} />
                )}
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden sm:block"></div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors group p-2 sm:p-0"
                title="Вийти"
              >
                <span className="text-sm font-medium hidden sm:block">Вийти</span>
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto flex-1 w-full">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        />
        
        <main className="flex-1 p-8">
          {activeTab === 'health-data' && <AddHealthData />}
          {activeTab === 'charts' && <Analytics />}
          {activeTab === 'alerts' && <Alerts />}
          {activeTab === 'export' && <ExportData />}
          {activeTab === 'profile' && <UserProfile />}
          {activeTab === 'admin' && <PatientsList />}
          {activeTab === 'my-doctor' && <MyDoctor />}
          {activeTab === 'settings' && <ProfileSettings />}
          {activeTab === 'home' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'nutrition' && (
            <div className="max-w-3xl mx-auto"><NutritionWidget /></div>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

const HomeContent = ({ userData }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Вітаємо, {userData?.name}! 🎉</h2>
        <p className="text-blue-100 text-lg">
          Ласкаво просимо в систему моніторингу здоров'я
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {userData?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userData?.email}
              </p>
            </div>
          </div>

          {userData && (
            <div className="space-y-3 mt-6">
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Ріст:</span>
                <span className="text-blue-700 dark:text-blue-300 font-bold">{userData.height} см</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Вага:</span>
                <span className="text-green-700 dark:text-green-300 font-bold">{userData.weight} кг</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Рік народження:</span>
                <span className="text-purple-700 dark:text-purple-300 font-bold">{userData.birthYear}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300 font-medium">Вік:</span>
                <span className="text-indigo-700 dark:text-indigo-300 font-bold">
                  {new Date().getFullYear() - userData.birthYear} років
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Швидкий старт 🚀
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <span className="text-2xl">1️⃣</span>
              <p className="text-gray-700 dark:text-gray-300">
                Перейдіть до розділу <strong>"Показники"</strong> та додайте свої перші дані
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-2xl">2️⃣</span>
              <p className="text-gray-700 dark:text-gray-300">
                Переглядайте графіки та аналізуйте тенденції
              </p>
            </li>
            <li className="flex items-start space-x-3">
              <span className="text-2xl">3️⃣</span>
              <p className="text-gray-700 dark:text-gray-300">
                Налаштуйте сповіщення для контролю показників
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser } = useAuth();
  return currentUser ? <MainApp /> : <AuthLayout />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HealthDataProvider>
          <AppContent />    
        </HealthDataProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;