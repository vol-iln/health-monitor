import { format, formatDistance, formatRelative } from 'date-fns';
import { uk } from 'date-fns/locale';

// Форматування дати
export const formatDate = (date, pattern = 'dd.MM.yyyy') => {
  if (!date) return '-';
  try {
    return format(new Date(date), pattern, { locale: uk });
  } catch (error) {
    return '-';
  }
};

// Форматування дати з часом
export const formatDateTime = (date) => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

// Форматування дати відносно поточного часу 
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  try {
    return formatDistance(new Date(date), new Date(), { 
      addSuffix: true, 
      locale: uk 
    });
  } catch (error) {
    return '-';
  }
};

// Форматування дати у зручний формат
export const formatRelativeDate = (date) => {
  if (!date) return '-';
  try {
    return formatRelative(new Date(date), new Date(), { locale: uk });
  } catch (error) {
    return '-';
  }
};

// Форматування числа з одиницями вимірювання
export const formatValue = (value, unit) => {
  if (value === null || value === undefined) return '-';
  return `${value} ${unit}`;
};

// Форматування показника тиску
export const formatPressure = (systolic, diastolic) => {
  if (!systolic || !diastolic) return '-';
  return `${systolic}/${diastolic}`;
};

// Форматування десяткового числа
export const formatDecimal = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return parseFloat(value).toFixed(decimals);
};

// Форматування відсотків
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  return `${parseFloat(value).toFixed(decimals)}%`;
};

// Форматування великих чисел
export const formatLargeNumber = (num) => {
  if (num === null || num === undefined) return '-';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Форматування імені 
export const formatName = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

// Форматування email 
export const formatEmailPrivate = (email) => {
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;
  
  const visibleChars = 2;
  const hiddenPart = '*'.repeat(username.length - visibleChars);
  return `${username.substring(0, visibleChars)}${hiddenPart}@${domain}`;
};

// Форматування телефону
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/);
  
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
  }
  return phone;
};

// Форматування розміру файлу
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// Форматування тривалості 
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Форматування валюти
export const formatCurrency = (amount, currency = 'UAH') => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Форматування BMI категорії з кольором
export const formatBMIWithColor = (bmi) => {
  if (!bmi) return { text: '-', color: 'gray' };
  
  if (bmi < 18.5) return { text: 'Недостатня вага', color: 'text-blue-600' };
  if (bmi < 25) return { text: 'Нормальна вага', color: 'text-green-600' };
  if (bmi < 30) return { text: 'Надлишкова вага', color: 'text-yellow-600' };
  return { text: 'Ожиріння', color: 'text-red-600' };
};

// Скорочення тексту
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};