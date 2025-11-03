import React, { useState } from 'react';
import { Users, Activity, AlertTriangle, FileText } from 'lucide-react';
import UserManagement from './UserManagement';
import ThresholdSettings from './ThresholdSettings';
import Reports from './Reports';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); 

  const menuItems = [
    { id: 'users', name: 'Користувачі', icon: Users },
    { id: 'thresholds', name: 'Порогові значення', icon: AlertTriangle },
    { id: 'reports', name: 'Звіти', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Адміністративна панель
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Керування користувачами та системними налаштуваннями
        </p>
      </div>

      {/* Вкладки */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all flex-1 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Контент */}
      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'thresholds' && <ThresholdSettings />}
      {activeTab === 'reports' && <Reports />}
    </div>
  );
};

export default AdminDashboard;