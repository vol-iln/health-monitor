import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { loginUser } from '../../services/authService';
import toast from 'react-hot-toast';

const LoginForm = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    const result = await loginUser(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      toast.success('Вхід успішний! 🎉');
    } else {
      toast.error(result.error || 'Помилка входу');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Вхід
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Увійдіть у свій обліковий запис
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Введіть пароль"
            required
            error={errors.password}
          />

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Немає облікового запису?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold"
            >
              Зареєструватися
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;