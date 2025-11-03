import React, { useState } from 'react';
import { Shield, Bell, Eye, Trash2, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { deleteUser, updatePassword } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import Button from '../common/Button';
import Input from '../common/Input';
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const { currentUser } = useAuth();
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const [privacySettings, setPrivacySettings] = useState(() => {
    const saved = localStorage.getItem('privacySettings');
    return saved ? JSON.parse(saved) : {
      shareWithDoctors: false,
      showInSearch: false,
      allowAnalytics: true
    };
  });

  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem('notificationSettings');
    return saved ? JSON.parse(saved) : {
      emailNotifications: true,
      alertNotifications: true,
      weeklyReport: false,
      monthlyReport: false
    };
  });

  const handlePrivacyChange = (key) => {
    const newSettings = {
      ...privacySettings,
      [key]: !privacySettings[key]
    };
    setPrivacySettings(newSettings);
    localStorage.setItem('privacySettings', JSON.stringify(newSettings));
    toast.success('Налаштування збережено');
  };

  const handleNotificationChange = (key) => {
    const newSettings = {
      ...notificationSettings,
      [key]: !notificationSettings[key]
    };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    toast.success('Налаштування збережено');
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword.length < 6) {
      toast.error('Пароль має бути мінімум 6 символів');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Паролі не співпадають');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(currentUser, passwordData.newPassword);
      toast.success('Пароль успішно змінено! ✅');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Password change error:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Для зміни паролю потрібно повторно увійти в систему');
      } else {
        toast.error('Помилка зміни паролю');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ ВИ ВПЕВНЕНІ?\n\nВидалення акаунту незворотнє! Будуть видалені:\n- Ваш профіль\n- Всі показники здоров\'я\n- Всі налаштування\n\nВведіть "ВИДАЛИТИ" для підтвердження'
    );

    if (!confirmed) return;

    const confirmText = window.prompt('Введіть "ВИДАЛИТИ" для підтвердження:');
    
    if (confirmText !== 'ВИДАЛИТИ') {
      toast.error('Скасовано');
      return;
    }

    setLoading(true);

    try {
      const healthDataQuery = query(
        collection(db, 'healthData'),
        where('userId', '==', currentUser.uid)
      );
      const healthDataSnapshot = await getDocs(healthDataQuery);
      
      const deletePromises = healthDataSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, 'users', currentUser.uid));

      await deleteUser(currentUser);

      toast.success('Акаунт видалено');
    } catch (error) {
      console.error('Delete account error:', error);
      if (error.code === 'auth/requires-recent-login') {
        toast.error('Для видалення акаунту потрібно повторно увійти в систему');
      } else {
        toast.error('Помилка видалення акаунту');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Налаштування
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Керуйте налаштуваннями приватності та безпеки
        </p>
      </div>

      {/* Безпека */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Безпека
          </h3>
        </div>

        <div className="space-y-4">
          {/* Зміна паролю */}
          <div>
            {!showPasswordChange ? (
              <Button
                onClick={() => setShowPasswordChange(true)}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <Key className="w-4 h-4" />
                <span>Змінити пароль</span>
              </Button>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
                <Input
                  label="Новий пароль"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Мінімум 6 символів"
                />
                <Input
                  label="Підтвердіть пароль"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Повторіть пароль"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({ newPassword: '', confirmPassword: '' });
                    }}
                    variant="secondary"
                    fullWidth
                  >
                    Скасувати
                  </Button>
                  <Button
                    onClick={handlePasswordChange}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? 'Зміна...' : 'Змінити пароль'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Приватність */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Приватність
          </h3>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="Ділитися даними з лікарями"
            description="Дозволити лікарям переглядати ваші показники здоров'я"
            checked={privacySettings.shareWithDoctors}
            onChange={() => handlePrivacyChange('shareWithDoctors')}
          />

          <SettingToggle
            label="Показувати в пошуку"
            description="Ваш профіль буде видимий іншим користувачам"
            checked={privacySettings.showInSearch}
            onChange={() => handlePrivacyChange('showInSearch')}
          />

          <SettingToggle
            label="Дозволити аналітику"
            description="Допомогти покращити додаток, надаючи анонімні дані використання"
            checked={privacySettings.allowAnalytics}
            onChange={() => handlePrivacyChange('allowAnalytics')}
          />
        </div>
      </div>

      {/* Сповіщення */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Сповіщення
          </h3>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="Email сповіщення"
            description="Отримувати сповіщення на електронну пошту"
            checked={notificationSettings.emailNotifications}
            onChange={() => handleNotificationChange('emailNotifications')}
          />

          <SettingToggle
            label="Попередження про показники"
            description="Сповіщення коли показники виходять за межі норми"
            checked={notificationSettings.alertNotifications}
            onChange={() => handleNotificationChange('alertNotifications')}
          />

          <SettingToggle
            label="Тижневий звіт"
            description="Отримувати звіт про показники кожного тижня"
            checked={notificationSettings.weeklyReport}
            onChange={() => handleNotificationChange('weeklyReport')}
          />

          <SettingToggle
            label="Місячний звіт"
            description="Отримувати звіт про показники кожного місяця"
            checked={notificationSettings.monthlyReport}
            onChange={() => handleNotificationChange('monthlyReport')}
          />
        </div>
      </div>

      {/* Небезпечна зона */}
      <div className="bg-red-50 dark:bg-red-900 rounded-xl shadow-lg p-6 border-2 border-red-200 dark:border-red-700">
        <div className="flex items-center space-x-3 mb-6">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h3 className="text-xl font-bold text-red-900 dark:text-red-100">
            Небезпечна зона
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-red-800 dark:text-red-200 text-sm">
            Після видалення акаунту всі ваші дані будуть безповоротно втрачені. 
            Ця дія незворотня.
          </p>
          
          <Button
            onClick={handleDeleteAccount}
            variant="danger"
            disabled={loading}
            className="flex items-center justify-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{loading ? 'Видалення...' : 'Видалити акаунт назавжди'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

// Компонент перемикача
const SettingToggle = ({ label, description, checked, onChange }) => {
  return (
    <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
          {label}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
      
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};

export default ProfileSettings;