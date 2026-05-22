import React, { useState } from 'react';
import { UserPlus, Stethoscope, User } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { registerNewAccount } from '../../services/authService';
import toast from 'react-hot-toast';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    phoneNumber: '', 
    height: '',
    weight: '',
    birthYear: '',
    telegramId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Ім'я обов'язкове";
    if (!formData.email.trim()) newErrors.email = 'Email обов\'язковий';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Невірний формат email';
    if (!formData.password) newErrors.password = 'Пароль обов\'язковий';
    else if (formData.password.length < 6) newErrors.password = 'Пароль має бути мінімум 6 символів';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Паролі не співпадають';
    
    // Перевірка телефону
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Номер телефону обов\'язковий';

    if (formData.role === 'user') {
      if (!formData.height || formData.height < 50 || formData.height > 250) newErrors.height = 'Вкажіть коректний ріст (50-250 см)';
      if (!formData.weight || formData.weight < 20 || formData.weight > 300) newErrors.weight = 'Вкажіть коректну вагу (20-300 кг)';
      const currentYear = new Date().getFullYear();
      if (!formData.birthYear || formData.birthYear < 1900 || formData.birthYear > currentYear) newErrors.birthYear = `Вкажіть коректний рік (1900-${currentYear})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Будь ласка, виправте помилки у формі');
      return;
    }

    setLoading(true);
    const result = await registerNewAccount(
      formData.email,
      formData.password,
      {
        name: formData.name,
        role: formData.role,
        telegramId: formData.telegramId.trim(),
        phoneNumber: formData.phoneNumber.trim(), 
        height: formData.role === 'user' ? Number(formData.height) : null,
        weight: formData.role === 'user' ? Number(formData.weight) : null,
        birthYear: formData.role === 'user' ? Number(formData.birthYear) : null
      }
    );

    setLoading(false);
    if (result.success) toast.success('Реєстрація успішна! 🎉');
    else toast.error(result.error || 'Помилка реєстрації');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Реєстрація</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4 mb-2">
            <label className={`flex-1 flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'user' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30' : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700'}`}>
              <input type="radio" name="role" value="user" checked={formData.role === 'user'} onChange={handleChange} className="hidden" />
              <User className="w-6 h-6 mb-1" /><span className="font-semibold">Пацієнт</span>
            </label>
            <label className={`flex-1 flex flex-col items-center justify-center p-3 border-2 rounded-xl cursor-pointer transition-all ${formData.role === 'admin' ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/30' : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700'}`}>
              <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleChange} className="hidden" />
              <Stethoscope className="w-6 h-6 mb-1" /><span className="font-semibold">Лікар</span>
            </label>
          </div>

          <Input label="Ім'я та прізвище" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Введіть ваше ім'я" required error={errors.name} />
          
          {/* Номер телефону */}
          <Input label="Номер телефону" type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+380..." required error={errors.phoneNumber} />
          
          <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required error={errors.email} />
          <Input label="Пароль" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Мінімум 6 символів" required error={errors.password} />
          <Input label="Підтвердіть пароль" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Повторіть пароль" required error={errors.confirmPassword} />

          {formData.role === 'user' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Ріст (см)" type="number" name="height" value={formData.height} onChange={handleChange} placeholder="170" required min="50" max="250" error={errors.height} />
                <Input label="Вага (кг)" type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="70" required min="20" max="300" error={errors.weight} />
              </div>
              <Input label="Рік народження" type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} placeholder="1990" required min="1900" max={new Date().getFullYear()} error={errors.birthYear} />
            </>
          )}

          <Input label="Telegram Chat ID (необов'язково)" type="text" name="telegramId" value={formData.telegramId} onChange={handleChange} placeholder="Наприклад: 424281746" />

          <Button type="submit" fullWidth disabled={loading} className={formData.role === 'admin' ? 'bg-rose-600 hover:bg-rose-700' : ''}>
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Вже є обліковий запис? <button onClick={onSwitchToLogin} className="text-blue-600 hover:text-blue-700 font-semibold">Увійти</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;