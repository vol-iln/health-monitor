import React, { useState } from 'react';
import { User, Edit2, Mail, Calendar, Ruler, Weight, Save, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { updateProfile } from 'firebase/auth';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ProfileEdit = () => {
  const { currentUser, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    height: userData?.height || '',
    weight: userData?.weight || '',
    birthYear: userData?.birthYear || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      await updateProfile(currentUser, {
        displayName: formData.name
      });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        name: formData.name,
        height: Number(formData.height),
        weight: Number(formData.weight),
        birthYear: Number(formData.birthYear),
        updatedAt: new Date().toISOString()
      });

      toast.success('Профіль оновлено! ✅');
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Помилка оновлення профілю');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: userData?.name || '',
      height: userData?.height || '',
      weight: userData?.weight || '',
      birthYear: userData?.birthYear || ''
    });
    setIsEditing(false);
  };

  const calculateAge = () => {
    if (!userData?.birthYear) return '-';
    return new Date().getFullYear() - userData.birthYear;
  };

  const calculateBMI = () => {
    if (!userData?.height || !userData?.weight) return '-';
    const heightInMeters = userData.height / 100;
    const bmi = userData.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi === '-') return { text: '-', color: 'gray' };
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { text: 'Недостатня вага', color: 'blue' };
    if (bmiNum < 25) return { text: 'Нормальна вага', color: 'green' };
    if (bmiNum < 30) return { text: 'Надлишкова вага', color: 'yellow' };
    return { text: 'Ожиріння', color: 'red' };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Мій профіль
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Керуйте своїми персональними даними
          </p>
        </div>

        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="secondary"
            className="flex items-center space-x-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Редагувати</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основна інформація */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userData?.name || 'Користувач'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 flex items-center mt-1">
                <Mail className="w-4 h-4 mr-2" />
                {currentUser?.email}
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Ім'я"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введіть ваше ім'я"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Ріст (см)"
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="170"
                  required
                  min="50"
                  max="250"
                />

                <Input
                  label="Вага (кг)"
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  required
                  min="20"
                  max="300"
                />

                <Input
                  label="Рік народження"
                  type="number"
                  name="birthYear"
                  value={formData.birthYear}
                  onChange={handleChange}
                  placeholder="1990"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  fullWidth
                  className="flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Скасувати</span>
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  fullWidth
                  className="flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Збереження...' : 'Зберегти'}</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <Ruler className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ріст</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData?.height || '-'} <span className="text-base font-normal">см</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <Weight className="w-6 h-6 text-green-600 dark:text-green-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Вага</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData?.weight || '-'} <span className="text-base font-normal">кг</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Рік народження</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData?.birthYear || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Вік</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculateAge()} <span className="text-base font-normal">років</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Статистика та BMI */}
        <div className="space-y-6">
          {/* BMI */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Індекс маси тіла (BMI)
            </h3>
            
            <div className="text-center mb-4">
              <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {bmi}
              </div>
              <div className={`mt-2 inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                bmiCategory.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                bmiCategory.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                bmiCategory.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                bmiCategory.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {bmiCategory.text}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Недостатня вага:</span>
                <span className="font-medium text-gray-900 dark:text-white">&lt; 18.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Нормальна вага:</span>
                <span className="font-medium text-gray-900 dark:text-white">18.5 - 24.9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Надлишкова вага:</span>
                <span className="font-medium text-gray-900 dark:text-white">25 - 29.9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Ожиріння:</span>
                <span className="font-medium text-gray-900 dark:text-white">&ge; 30</span>
              </div>
            </div>
          </div>

          {/* Додаткова інформація */}
          <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Поради:</strong> Регулярно оновлюйте свою вагу для точного 
                  відстеження змін. BMI - це загальний показник, проконсультуйтеся 
                  з лікарем для персональних рекомендацій.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Інформація про акаунт */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Інформація про акаунт
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
            <p className="text-gray-900 dark:text-white font-medium">{currentUser?.email}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Дата реєстрації</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {userData?.createdAt 
                ? new Date(userData.createdAt).toLocaleDateString('uk-UA', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : '-'
              }
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID користувача</p>
            <p className="text-gray-900 dark:text-white font-medium font-mono text-xs break-all">
              {currentUser?.uid}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Роль</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {userData?.role === 'admin' ? 'Адміністратор' : 'Користувач'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;