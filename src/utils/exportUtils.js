import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { HEALTH_METRICS } from './constants';

// Функція форматування даних для Телеграм-звіту 
export const formatDataForTelegram = (data, filters, patientName) => {
  let filteredData = [...data];

  // 1. Фільтрація за типом
  if (filters.type !== 'all') {
    filteredData = filteredData.filter(item => item.type === filters.type);
  }

  // 2. Фільтрація за часом
  const now = new Date();
  if (filters.period === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredData = filteredData.filter(item => new Date(item.date) >= weekAgo);
  } else if (filters.period === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filteredData = filteredData.filter(item => new Date(item.date) >= monthAgo);
  }

  if (filteredData.length === 0) return null;

  filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

  const typeLabel = filters.type === 'all' ? 'Всі показники' : (HEALTH_METRICS[filters.type]?.name || filters.type);
  const periodLabel = filters.period === 'week' ? 'Останні 7 днів' : filters.period === 'month' ? 'Останні 30 днів' : 'Ввесь час';
  
  let message = `🏥 Звіт для лікаря\n👤 Пацієнт: ${patientName}\n📅 Період: ${periodLabel}\n📊 Показник: ${typeLabel}\n\n`;

  filteredData.slice(0, 50).forEach(item => {
    const metric = HEALTH_METRICS[item.type];
    const dateStr = format(new Date(item.date), 'dd.MM HH:mm');
    const val = item.type === 'pressure' 
      ? `${item.systolic}/${item.diastolic}` 
      : `${item.value} ${metric?.unit || ''}`;
    
    const noteStr = item.note ? ` (💬 ${item.note})` : '';
    message += `• ${dateStr} - ${metric?.name || item.type}: ${val}${noteStr}\n`;
  });

  return message;
};

// Експорт у CSV 
export const exportToCSV = (data, userData) => {
  if (data.length === 0) throw new Error('Немає даних для експорту');

  const headers = ['Дата', 'Тип', 'Значення', 'Нотатка'];
  const rows = data.map(item => {
    const dateStr = format(new Date(item.date), 'dd.MM.yyyy HH:mm', { locale: uk });
    const metric = HEALTH_METRICS[item.type];
    const value = item.type === 'pressure' ? `${item.systolic}/${item.diastolic}` : `${item.value} ${metric?.unit || ''}`;
    return [dateStr, metric?.name || item.type, value, item.note || '-'];
  });

  let csvContent = '\uFEFF' + headers.join(';') + '\n';
  rows.forEach(row => { csvContent += row.map(cell => `"${cell}"`).join(';') + '\n'; });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `health_data_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
};

// Експорт у PDF
export const exportToPDF = (data, userData) => {
  if (data.length === 0) throw new Error('Немає даних для експорту');

  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('Health Monitor Report', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`User: ${userData?.name || 'N/A'}`, 14, 30);
  doc.text(`Report Date: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 14, 37);

  const tableData = data.map(item => {
    const dateStr = format(new Date(item.date), 'dd.MM.yyyy HH:mm', { locale: uk });
    const metric = HEALTH_METRICS[item.type];
    const value = item.type === 'pressure' ? `${item.systolic}/${item.diastolic}` : `${item.value} ${metric?.unit || ''}`;
    return [dateStr, metric?.name || item.type, value, item.note || '-'];
  });

  doc.autoTable({
    startY: 45,
    head: [['Date', 'Type', 'Value', 'Note']],
    body: tableData
  });

  doc.save(`health_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};