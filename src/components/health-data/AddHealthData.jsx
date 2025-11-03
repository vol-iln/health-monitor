import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import HealthDataForm from './HealthDataForm';
import HealthDataList from './HealthDataList';
import { useHealthData } from '../../contexts/HealthDataContext';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const AddHealthData = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { healthData, addData, deleteData, loading: dataLoading } = useHealthData();

  const handleSubmit = async (data) => {
    setLoading(true);
    
    const result = await addData(data);
    
    setLoading(false);
    
    if (result.success) {
      checkAlert(data);
      toast.success('Показник успішно додано! 🎉');
      setShowForm(false);
    } else {
      toast.error(result.error || 'Помилка додавання');
    }
  };

  const checkAlert = (data) => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (!savedSettings) return;

    const settings = JSON.parse(savedSettings);
    const setting = settings[data.type];
    
    if (!setting || !setting.enabled) return;

    let isOutOfRange = false;

    if (data.type === 'pressure') {
      if (
        data.systolic < setting.systolicMin || data.systolic > setting.systolicMax ||
        data.diastolic < setting.diastolicMin || data.diastolic > setting.diastolicMax
      ) {
        isOutOfRange = true;
      }
    } else {
      if (data.value < setting.min || data.value > setting.max) {
        isOutOfRange = true;
      }
    }

    if (isOutOfRange) {
      toast.error('⚠️ Увага! Показник виходить за межі норми!', { duration: 5000 });
    }
  };

  const handleDelete = async (dataId) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей показник?')) {
      return;
    }

    const result = await deleteData(dataId);
    
    if (result.success) {
      toast.success('Показник видалено');
    } else {
      toast.error(result.error || 'Помилка видалення');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Мої показники
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Всього записів: {healthData.length}
          </p>
        </div>

        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Додати показник</span>
        </Button>
      </div>

      <HealthDataList 
        data={healthData} 
        onDelete={handleDelete}
        loading={dataLoading}
      />

      {showForm && (
        <HealthDataForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AddHealthData;
