import React, { useState } from 'react';
import { X } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';
import { HEALTH_METRICS } from '../../utils/constants';

const HealthDataForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    type: 'pulse',
    value: '',
    systolic: '',
    diastolic: '',
    note: '',
    date: new Date().toISOString().slice(0, 16)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      type: formData.type,
      note: formData.note,
      date: new Date(formData.date).toISOString()
    };

    if (formData.type === 'pressure') {
      dataToSubmit.systolic = Number(formData.systolic);
      dataToSubmit.diastolic = Number(formData.diastolic);
      dataToSubmit.value = `${formData.systolic}/${formData.diastolic}`;
    } else {
      dataToSubmit.value = Number(formData.value);
    }

    onSubmit(dataToSubmit);
  };

  const selectedMetric = HEALTH_METRICS[formData.type];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Додати показник
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Вибір типу показника */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Тип показника <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(HEALTH_METRICS).map(([key, metric]) => (
                <option key={key} value={key}>
                  {metric.icon} {metric.name}
                </option>
              ))}
            </select>
          </div>

          {/* Поля для введення значень */}
          {formData.type === 'pressure' ? (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Систолічний"
                type="number"
                name="systolic"
                value={formData.systolic}
                onChange={handleChange}
                placeholder="120"
                required
                min="50"
                max="250"
              />
              <Input
                label="Діастолічний"
                type="number"
                name="diastolic"
                value={formData.diastolic}
                onChange={handleChange}
                placeholder="80"
                required
                min="30"
                max="150"
              />
            </div>
          ) : (
            <Input
              label={`Значення (${selectedMetric.unit})`}
              type="number"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder={
                formData.type === 'pulse' ? '75' :
                formData.type === 'temperature' ? '36.6' :
                formData.type === 'weight' ? '70' :
                formData.type === 'blood_sugar' ? '5.0' :
                formData.type === 'oxygen' ? '98' : '0'
              }
              required
              step={formData.type === 'temperature' || formData.type === 'blood_sugar' ? '0.1' : '1'}
            />
          )}

          {/* Дата і час */}
          <Input
            label="Дата і час"
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          {/* Нотатка */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Нотатка (необов'язково)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Додайте коментар..."
              rows="3"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Кнопки */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              fullWidth
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Додавання...' : 'Додати'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthDataForm;