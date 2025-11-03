import React, { useState, useEffect } from 'react';
import { Bell, Save } from 'lucide-react';
import { HEALTH_METRICS } from '../../utils/constants';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const AlertSettings = () => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('alertSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    
    return {
      pulse: { enabled: true, min: 60, max: 100 },
      pressure: { 
        enabled: true, 
        systolicMin: 90, 
        systolicMax: 140,
        diastolicMin: 60,
        diastolicMax: 90
      },
      temperature: { enabled: true, min: 36.0, max: 37.5 },
      weight: { enabled: false, min: 0, max: 0 },
      blood_sugar: { enabled: true, min: 3.9, max: 5.5 },
      oxygen: { enabled: true, min: 95, max: 100 }
    };
  });

  const handleChange = (metric, field, value) => {
    setSettings(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: field === 'enabled' ? value : Number(value)
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('alertSettings', JSON.stringify(settings));
    toast.success('Налаштування збережено! ✅');
  };

  const handleReset = () => {
    if (window.confirm('Скинути всі налаштування до стандартних значень?')) {
      const defaultSettings = {
        pulse: { enabled: true, min: 60, max: 100 },
        pressure: { 
          enabled: true, 
          systolicMin: 90, 
          systolicMax: 140,
          diastolicMin: 60,
          diastolicMax: 90
        },
        temperature: { enabled: true, min: 36.0, max: 37.5 },
        weight: { enabled: false, min: 0, max: 0 },
        blood_sugar: { enabled: true, min: 3.9, max: 5.5 },
        oxygen: { enabled: true, min: 95, max: 100 }
      };
      setSettings(defaultSettings);
      localStorage.setItem('alertSettings', JSON.stringify(defaultSettings));
      toast.success('Налаштування скинуто до стандартних');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Налаштування сповіщень
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Встановіть порогові значення для попереджень
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleReset}>
            Скинути
          </Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Зберегти</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(HEALTH_METRICS).map(([key, metric]) => (
          <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{metric.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {metric.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.unit}
                  </p>
                </div>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[key]?.enabled || false}
                  onChange={(e) => handleChange(key, 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {settings[key]?.enabled && (
              <div className="space-y-3">
                {key === 'pressure' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Систолічний мін"
                        type="number"
                        value={settings[key].systolicMin}
                        onChange={(e) => handleChange(key, 'systolicMin', e.target.value)}
                        min="50"
                        max="250"
                      />
                      <Input
                        label="Систолічний макс"
                        type="number"
                        value={settings[key].systolicMax}
                        onChange={(e) => handleChange(key, 'systolicMax', e.target.value)}
                        min="50"
                        max="250"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Діастолічний мін"
                        type="number"
                        value={settings[key].diastolicMin}
                        onChange={(e) => handleChange(key, 'diastolicMin', e.target.value)}
                        min="30"
                        max="150"
                      />
                      <Input
                        label="Діастолічний макс"
                        type="number"
                        value={settings[key].diastolicMax}
                        onChange={(e) => handleChange(key, 'diastolicMax', e.target.value)}
                        min="30"
                        max="150"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Мінімум"
                      type="number"
                      value={settings[key].min}
                      onChange={(e) => handleChange(key, 'min', e.target.value)}
                      step={key === 'temperature' || key === 'blood_sugar' ? '0.1' : '1'}
                    />
                    <Input
                      label="Максимум"
                      type="number"
                      value={settings[key].max}
                      onChange={(e) => handleChange(key, 'max', e.target.value)}
                      step={key === 'temperature' || key === 'blood_sugar' ? '0.1' : '1'}
                    />
                  </div>
                )}
                
                {metric.normalRange && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    💡 Норма: {key === 'pressure' ? (
                      `${metric.normalRange.systolic.min}-${metric.normalRange.systolic.max}/${metric.normalRange.diastolic.min}-${metric.normalRange.diastolic.max}`
                    ) : (
                      `${metric.normalRange.min}-${metric.normalRange.max}`
                    )} {metric.unit}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Bell className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Як це працює:</strong> Коли ви додаєте новий показник здоров'я, 
              система автоматично перевіряє чи він в межах встановлених значень. 
              Якщо ні - ви отримаєте попередження.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertSettings;