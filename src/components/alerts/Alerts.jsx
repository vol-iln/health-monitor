import React, { useState } from 'react';
import AlertsList from './AlertsList';
import AlertSettings from './AlertSettings';
import { Settings, Bell } from 'lucide-react';
import { AlertTriangle, CheckCircle, Info, Clock, X } from 'lucide-react';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('alerts'); 

  return (
    <div className="space-y-6">
      {/* Вкладки */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all flex-1 ${
              activeTab === 'alerts'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-semibold">Попередження</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all flex-1 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-semibold">Налаштування</span>
          </button>
        </div>
      </div>

      {/* Контент */}
      {activeTab === 'alerts' ? <AlertsList /> : <AlertSettings />}
    </div>
  );
};

export default Alerts;