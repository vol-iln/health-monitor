import React, { useState } from 'react';
import { Settings, Bell } from 'lucide-react';
import AlertsList from './AlertsList';
import AlertSettings from './AlertSettings';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('alerts'); 

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-10">
      
      <div className="bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 border border-slate-200/50 dark:border-slate-700/50 w-full sm:w-fit mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center justify-center space-x-2 px-8 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
            activeTab === 'alerts'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Попередження</span>
        </button>
        
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center justify-center space-x-2 px-8 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
            activeTab === 'settings'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Налаштування</span>
        </button>
      </div>

      {/* Контент */}
      <div className="transition-all duration-300">
        {activeTab === 'alerts' ? <AlertsList /> : <AlertSettings />}
      </div>
    </div>
  );
};

export default Alerts;