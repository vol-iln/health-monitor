import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserHealthData, addHealthData, deleteHealthData } from '../services/healthDataService';

const HealthDataContext = createContext();

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within HealthDataProvider');
  }
  return context;
};

export const HealthDataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadHealthData();
    } else {
      setHealthData([]);
    }
  }, [currentUser]);

  const loadHealthData = async () => {
    if (!currentUser) return;

    setLoading(true);
    const result = await getUserHealthData(currentUser.uid);
    
    if (result.success) {
      setHealthData(result.data);
    }
    
    setLoading(false);
  };

  const addData = async (data) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    const result = await addHealthData(currentUser.uid, data);
    
    if (result.success) {
      await loadHealthData(); 
    }
    
    return result;
  };

  const deleteData = async (dataId) => {
    const result = await deleteHealthData(dataId);
    
    if (result.success) {
      await loadHealthData(); 
    }
    
    return result;
  };

  const getDataByType = (type) => {
    return healthData.filter(item => item.type === type);
  };

  const value = {
    healthData,
    loading,
    addData,
    deleteData,
    getDataByType,
    refreshData: loadHealthData
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};