import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { HEALTH_METRICS } from '../../utils/constants';
import Input from '../common/Input';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const ThresholdSettings = () => {
  const [globalSettings, setGlobalSettings] = useState(() => {
    const saved = localStorage.getItem('globalThresholds');
    if (saved) {
      return JSON.parse(saved);
    }
    
    // Дефолтні глобальні налаштування
    return {
      pulse: { min: 60, max: 90 },
      pressure: { 
        systolicMin: 90, 
        systolicMax: 140,
        diastolicMin: 60,
        diastolicMax: 90
      },
      temperature: { min: 36.0, max: 37.5 },
      weight: { min: 0, max: 0 }, // не використовується
      blood_sugar: { min: 3.9, max: 5.5 },
      oxygen: { min: 95, max: 100 }
    };
  });

  const handleChange = (metric, field, value) => {
    setGlobalSettings(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: Number(value)
      }
    }));
  };

  const handleSave = () => {
    localStorage.setItem('globalThresholds', JSON.stringify(globalSettings));
    toast.success('Глобальні налаштування збережено! ✅');
  };

  const handleReset = () => {
    if (window.confirm('Скинути всі порогові значення до стандартних?')) {
      const defaultSettings = {
        pulse: { min: 60, max: 90 },
        pressure: { 
          systolicMin: 90, 
          systolicMax: 140,
          diastolicMin: 60,
          diastolicMax: 90
        },
        temperature: { min: 36.0, max: 37.5 },
        weight: { min: 0, max: 0 },
        blood_sugar: { min: 3.9, max: 5.5 },
        oxygen: { min: 95, max: 100 }
      };
      setGlobalSettings(defaultSettings);
      localStorage.setItem('globalThresholds', JSON.stringify(defaultSettings));
      toast.success('Налаштування скинуто до стандартних');
    }
  };

  const applyToAllUsers = () => {
    if (window.confirm('Застосувати ці налаштування до всіх користувачів?\n\nЦе перезапише їхні персональні налаштування попереджень.')) {
      // Зберігаємо як дефолтні для всіх нових користувачів
      localStorage.setItem('defaultAlertSettings', JSON.stringify({
        pulse: { enabled: true, ...globalSettings.pulse },
        pressure: { enabled: true, ...globalSettings.pressure },
        temperature: { enabled: true, ...globalSettings.temperature },
        weight: { enabled: false, ...globalSettings.weight },
        blood_sugar: { enabled: true, ...globalSettings.blood_sugar },
        oxygen: { enabled: true, ...globalSettings.oxygen }
      }));
      
      toast.success('Налаштування застосовано як дефолтні для всіх користувачів');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Глобальні порогові значення
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Встановіть стандартні межі для попереджень про здоров'я
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={handleReset} className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Скинути</span>
          </Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Зберегти</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(HEALTH_METRICS).map(([key, metric]) => {
          if (key === 'weight') return null; // Вага не має фіксованих норм

          return (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{metric.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {metric.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metric.unit}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {key === 'pressure' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Систолічний мін"
                        type="number"
                        value={globalSettings[key].systolicMin}
                        onChange={(e) => handleChange(key, 'systolicMin', e.target.value)}
                        min="50"
                        max="250"
                      />
                      <Input
                        label="Систолічний макс"
                        type="number"
                        value={globalSettings[key].systolicMax}
                        onChange={(e) => handleChange(key, 'systolicMax', e.target.value)}
                        min="50"
                        max="250"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Діастолічний мін"
                        type="number"
                        value={globalSettings[key].diastolicMin}
                        onChange={(e) => handleChange(key, 'diastolicMin', e.target.value)}
                        min="30"
                        max="150"
                      />
                      <Input
                        label="Діастолічний макс"
                        type="number"
                        value={globalSettings[key].diastolicMax}
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
                      value={globalSettings[key].min}
                      onChange={(e) => handleChange(key, 'min', e.target.value)}
                      step={key === 'temperature' || key === 'blood_sugar' ? '0.1' : '1'}
                    />
                    <Input
                      label="Максимум"
                      type="number"
                      value={globalSettings[key].max}
                      onChange={(e) => handleChange(key, 'max', e.target.value)}
                      step={key === 'temperature' || key === 'blood_sugar' ? '0.1' : '1'}
                    />
                  </div>
                )}
                
                {metric.normalRange && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    💡 Медична норма: {key === 'pressure' ? (
                      `${metric.normalRange.systolic.min}-${metric.normalRange.systolic.max}/${metric.normalRange.diastolic.min}-${metric.normalRange.diastolic.max}`
                    ) : (
                      `${metric.normalRange.min}-${metric.normalRange.max}`
                    )} {metric.unit}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Застосувати до всіх */}
      <div className="bg-blue-50 dark:bg-blue-900 rounded-xl shadow-lg p-6">
        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
          Застосувати до всіх користувачів
        </h4>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
          Ці налаштування будуть використані як дефолтні для всіх нових користувачів. 
          Існуючі користувачі зможуть змінити їх у своїх персональних налаштуваннях.
        </p>
        <Button onClick={applyToAllUsers} variant="secondary">
          Застосувати як дефолтні
        </Button>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Важливо:</strong> Ці порогові значення базуються на загальноприйнятих 
              медичних нормах. Для деяких пацієнтів можуть бути потрібні індивідуальні значення. 
              Завжди консультуйтеся з лікарем.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThresholdSettings;