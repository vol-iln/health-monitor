import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { registerUser } from '../../services/authService';
import toast from 'react-hot-toast';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    height: '',
    weight: '',
    birthYear: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Ім'я обов'язкове";
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль має бути мінімум 6 символів';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають';
    }

    if (!formData.height || formData.height < 50 || formData.height > 250) {
      newErrors.height = 'Вкажіть коректний ріст (50-250 см)';
    }

    if (!formData.weight || formData.weight < 20 || formData.weight > 300) {
      newErrors.weight = 'Вкажіть коректну вагу (20-300 кг)';
    }

    const currentYear = new Date().getFullYear();
    if (!formData.birthYear || formData.birthYear < 1900 || formData.birthYear > currentYear) {
      newErrors.birthYear = `Вкажіть коректний рік (1900-${currentYear})`;
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

    const result = await registerUser(
      formData.email,
      formData.password,
      {
        name: formData.name,
        height: Number(formData.height),
        weight: Number(formData.weight),
        birthYear: Number(formData.birthYear)
      }
    );

    setLoading(false);

    if (result.success) {
      toast.success('Реєстрація успішна! 🎉');
    } else {
      toast.error(result.error || 'Помилка реєстрації');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <UserPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Реєстрація
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Створіть свій обліковий запис
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Ім'я"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Введіть ваше ім'я"
            required
            error={errors.name}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            required
            error={errors.email}
          />

          <Input
            label="Пароль"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Мінімум 6 символів"
            required
            error={errors.password}
          />

          <Input
            label="Підтвердіть пароль"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Повторіть пароль"
            required
            error={errors.confirmPassword}
          />

          <div className="grid grid-cols-2 gap-4">
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
              error={errors.height}
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
              error={errors.weight}
            />
          </div>

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
            error={errors.birthYear}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Вже є обліковий запис?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
            >
              Увійти
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;