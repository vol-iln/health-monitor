import React from 'react';
import { useHealthData } from '../../contexts/HealthDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Lightbulb, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  Calendar,
  Activity
} from 'lucide-react';
import { HEALTH_METRICS } from '../../utils/constants';
import { calculateBMI, getBMICategory, calculateAge } from '../../utils/calculations';

const HealthInsights = () => {
  const { healthData } = useHealthData();
  const { userData } = useAuth();

  const generateInsights = () => {
    const insights = [];

    if (healthData.length === 0) {
      insights.push({
        type: 'info',
        icon: Activity,
        title: 'Почніть моніторинг',
        message: 'Додайте свої перші показники здоров\'я для отримання персональних рекомендацій',
        color: 'blue'
      });
      return insights;
    }

    if (healthData.length < 10) {
      insights.push({
        type: 'info',
        icon: Activity,
        title: 'Продовжуйте додавати дані',
        message: `У вас ${healthData.length} записів. Для точнішого аналізу рекомендується мінімум 10 записів.`,
        color: 'blue'
      });
    } else {
      insights.push({
        type: 'success',
        icon: Award,
        title: 'Відмінна активність!',
        message: `Чудово! У вас ${healthData.length} записів. Продовжуйте регулярний моніторинг!`,
        color: 'green'
      });
    }

    if (userData?.height && userData?.weight) {
      const bmi = calculateBMI(userData.weight, userData.height);
      const bmiCategory = getBMICategory(bmi);
      
      if (bmiCategory.color === 'green') {
        insights.push({
          type: 'success',
          icon: Award,
          title: 'Ідеальна вага!',
          message: `Ваш BMI ${bmi} - ${bmiCategory.text}. ${bmiCategory.description}`,
          color: 'green'
        });
      } else if (bmiCategory.color === 'yellow' || bmiCategory.color === 'blue') {
        insights.push({
          type: 'warning',
          icon: AlertCircle,
          title: 'Звернні увагу на вагу',
          message: `Ваш BMI ${bmi} - ${bmiCategory.text}. ${bmiCategory.description}`,
          color: 'yellow'
        });
      } else {
        insights.push({
          type: 'danger',
          icon: AlertCircle,
          title: 'Критичний BMI',
          message: `Ваш BMI ${bmi} - ${bmiCategory.text}. ${bmiCategory.description}`,
          color: 'red'
        });
      }
    }

    const dates = healthData.map(item => new Date(item.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
    const avgPerDay = healthData.length / Math.max(days, 1);

    if (avgPerDay < 0.3) {
      insights.push({
        type: 'info',
        icon: Calendar,
        title: 'Додавайте показники частіше',
        message: 'Рекомендується щонайменше 1 запис на 2-3 дні для кращого контролю здоров\'я.',
        color: 'blue'
      });
    } else if (avgPerDay >= 1) {
      insights.push({
        type: 'success',
        icon: Calendar,
        title: 'Відмінна регулярність!',
        message: `Ви робите в середньому ${avgPerDay.toFixed(1)} записів на день. Чудова дисципліна!`,
        color: 'green'
      });
    }

    const groupedData = {};
    Object.keys(HEALTH_METRICS).forEach(type => {
      groupedData[type] = healthData.filter(item => item.type === type);
    });

    Object.keys(groupedData).forEach(type => {
      const data = groupedData[type];
      if (data.length < 3) return;

      const metric = HEALTH_METRICS[type];
      if (!metric.normalRange) return;

      let inRange = 0;
      let outOfRange = 0;

      data.forEach(item => {
        if (type === 'pressure') {
          const range = metric.normalRange;
          if (
            item.systolic >= range.systolic.min && 
            item.systolic <= range.systolic.max &&
            item.diastolic >= range.diastolic.min && 
            item.diastolic <= range.diastolic.max
          ) {
            inRange++;
          } else {
            outOfRange++;
          }
        } else {
          if (item.value >= metric.normalRange.min && item.value <= metric.normalRange.max) {
            inRange++;
          } else {
            outOfRange++;
          }
        }
      });

      const percentage = (inRange / data.length) * 100;

      if (percentage >= 80) {
        insights.push({
          type: 'success',
          icon: Award,
          title: `Відмінний ${metric.name}!`,
          message: `${percentage.toFixed(0)}% ваших показників ${metric.name.toLowerCase()} в нормі.`,
          color: 'green'
        });
      } else if (percentage < 50) {
        insights.push({
          type: 'danger',
          icon: AlertCircle,
          title: `Увага: ${metric.name}`,
          message: `Лише ${percentage.toFixed(0)}% показників ${metric.name.toLowerCase()} в нормі. Зверніться до лікаря.`,
          color: 'red'
        });
      }
    });

    if (userData?.birthYear) {
      const age = calculateAge(userData.birthYear);
      if (age >= 40) {
        insights.push({
          type: 'info',
          icon: Lightbulb,
          title: 'Рекомендації для вашого віку',
          message: 'В вашому віці особливо важливо регулярно перевіряти артеріальний тиск та рівень цукру в крові.',
          color: 'purple'
        });
      }
    }

    return insights;
  };

  const insights = generateInsights();

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600 dark:text-blue-400',
      green: 'text-green-600 dark:text-green-400',
      yellow: 'text-yellow-600 dark:text-yellow-400',
      red: 'text-red-600 dark:text-red-400',
      purple: 'text-purple-600 dark:text-purple-400'
    };
    return colors[color] || 'text-gray-600';
  };

  const getBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      red: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    };
    return colors[color] || 'bg-gray-50 dark:bg-gray-700/20';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Персональні інсайти
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Рекомендації на основі аналізу ваших даних
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`${getBgColor(insight.color)} border rounded-xl p-6 transition-all hover:shadow-lg`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 ${getIconColor(insight.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {insight.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Загальна порада */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <Lightbulb className="w-8 h-8" />
          <h3 className="text-xl font-bold">Загальні рекомендації</h3>
        </div>
        <ul className="space-y-2 text-purple-50">
          <li>✓ Записуйте показники регулярно, в один і той же час доби</li>
          <li>✓ Ведіть здоровий спосіб життя та збалансоване харчування</li>
          <li>✓ При значних відхиленнях обов'язково консультуйтеся з лікарем</li>
          <li>✓ Не займайтеся самолікуванням</li>
        </ul>
      </div>
    </div>
  );
};

export default HealthInsights;