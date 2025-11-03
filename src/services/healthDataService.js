import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  deleteDoc,
  doc,
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';

// Додати новий показник здоров'я
export const addHealthData = async (userId, data) => {
  try {
    const docRef = await addDoc(collection(db, 'healthData'), {
      userId: userId,
      type: data.type, 
      value: data.value,
      systolic: data.systolic || null, 
      diastolic: data.diastolic || null, 
      note: data.note || '',
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Add health data error:', error);
    return { success: false, error: error.message };
  }
};

// Отримати всі показники користувача
export const getUserHealthData = async (userId) => {
  try {
    const q = query(
      collection(db, 'healthData'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const data = [];
    
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data };
  } catch (error) {
    console.error('Get health data error:', error);
    return { success: false, error: error.message };
  }
};

// Отримати показники по типу
export const getUserHealthDataByType = async (userId, type) => {
  try {
    const q = query(
      collection(db, 'healthData'),
      where('userId', '==', userId),
      where('type', '==', type),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const data = [];
    
    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { success: true, data };
  } catch (error) {
    console.error('Get health data by type error:', error);
    return { success: false, error: error.message };
  }
};

// Видалити показник
export const deleteHealthData = async (dataId) => {
  try {
    await deleteDoc(doc(db, 'healthData', dataId));
    return { success: true };
  } catch (error) {
    console.error('Delete health data error:', error);
    return { success: false, error: error.message };
  }
};

// Оновити показник
export const updateHealthData = async (dataId, data) => {
  try {
    const docRef = doc(db, 'healthData', dataId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Update health data error:', error);
    return { success: false, error: error.message };
  }
};