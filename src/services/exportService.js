import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { HEALTH_METRICS } from '../utils/constants';

// CSV
export const exportToCSV = (data, userData) => {
  if (data.length === 0) {
    throw new Error('Немає даних для експорту');
  }

  const headers = ['Дата', 'Тип', 'Значення', 'Нотатка'];
  

  const rows = data.map(item => {
    const dateStr = format(new Date(item.date), 'dd.MM.yyyy HH:mm', { locale: uk });
    const metric = HEALTH_METRICS[item.type];
    const value = item.type === 'pressure' 
      ? `${item.systolic}/${item.diastolic}` 
      : `${item.value} ${metric.unit}`;
    
    return [
      dateStr,
      metric.name,
      value,
      item.note || '-'
    ];
  });

  // CSV 
  let csvContent = '\uFEFF';
  csvContent += headers.join(';') + '\n';
  
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(';') + '\n';
  });

  // завантажує
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `health_data_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF
export const exportToPDF = (data, userData) => {
  if (data.length === 0) {
    throw new Error('Немає даних для експорту');
  }

  const doc = new jsPDF();
  
  doc.setFont('helvetica');
  
  doc.setFontSize(20);
  doc.text('Health Monitor', 105, 15, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text('Health Report', 105, 25, { align: 'center' });
  
  // Інформація про користувача
  doc.setFontSize(12);
  doc.text(`User: ${transliterate(userData?.name || 'N/A')}`, 14, 35);
  doc.text(`Email: ${userData?.email || 'N/A'}`, 14, 42);
  doc.text(`Report Date: ${format(new Date(), 'dd.MM.yyyy HH:mm')}`, 14, 49);
  
  // Таблиця з даними
  const tableData = data.map(item => {
    const dateStr = '\t' + format(new Date(item.date), 'dd.MM.yyyy HH:mm', { locale: uk });
    const metric = HEALTH_METRICS[item.type];
    const value = item.type === 'pressure' 
      ? `${item.systolic}/${item.diastolic}` 
      : `${item.value}`;
    
    return [
      dateStr,
      transliterate(metric.name),
      `${value} ${transliterate(metric.unit)}`,
      item.note ? transliterate(item.note) : '-'
    ];
  });

  doc.autoTable({
    startY: 55,
    head: [['Date', 'Type', 'Value', 'Note']],
    body: tableData,
    styles: {
      font: 'helvetica',
      fontSize: 10,
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 55 }
  });

  // Статистика
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.text('Statistics:', 14, finalY);
  
  doc.setFontSize(10);
  doc.text(`Total Records: ${data.length}`, 14, finalY + 7);
  
  // Підрахунок записів по типах
  const typeCounts = {};
  data.forEach(item => {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  });
  
  let yPos = finalY + 14;
  Object.entries(typeCounts).forEach(([type, count]) => {
    const metric = HEALTH_METRICS[type];
    doc.text(`${transliterate(metric.name)}: ${count}`, 14, yPos);
    yPos += 7;
  });

  // Збереження PDF
  doc.save(`health_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

const transliterate = (text) => {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu',
    'я': 'ya', 'ы': 'y', 'э': 'e', 'ъ': '',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye',
    'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L',
    'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu',
    'Я': 'Ya', 'Ы': 'Y', 'Э': 'E', 'Ъ': '',
    '\'': ''
  };
  
  return text.split('').map(char => map[char] || char).join('');
};

// Експорт по типу показника
export const exportByType = (data, type, format, userData) => {
  const filteredData = data.filter(item => item.type === type);
  
  if (format === 'csv') {
    exportToCSV(filteredData, userData);
  } else if (format === 'pdf') {
    exportToPDF(filteredData, userData);
  }
};
