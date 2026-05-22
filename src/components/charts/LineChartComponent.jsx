import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const LineChartComponent = ({ data, metric }) => {
  const [showStandard, setShowStandard] = useState(true);

  // Словник норм 
  const getStandardValue = (name) => {
    const standards = {
      'Пульс': 80,
      'Температура': 36.6,
      'Цукор': 5.5,
      'Кисень': 98,
      'Вага': 70 
    };
    return standards[name];
  };

  const formattedData = data.map(item => ({
    date: format(new Date(item.date), 'dd.MM HH:mm', { locale: uk }),
    value: item.type === 'pressure' ? item.systolic : item.value,
    diastolic: item.type === 'pressure' ? item.diastolic : null,
    systolic: item.type === 'pressure' ? item.systolic : null
  }));

  const standardVal = getStandardValue(metric.name);

  return (
    <div className="w-full">
      <div className="flex justify-end mb-2">
        <button 
          onClick={() => setShowStandard(!showStandard)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            showStandard 
              ? 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
              : 'bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          {showStandard ? 'Приховати норму' : 'Показати норму'}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
          <XAxis dataKey="date" className="text-gray-600 dark:text-gray-400" tick={{ fontSize: 12 }} />
          <YAxis className="text-gray-600 dark:text-gray-400" domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc', borderRadius: '8px' }} />
          <Legend />

          {/* ЛОГІКА ДЛЯ ЛІНІЙ */}
          {showStandard && metric.name === 'Тиск' && (
            <>
              <ReferenceLine y={120} stroke="#f87171" strokeDasharray="3 3" label={{ value: 'Сист. норма', position: 'right', fontSize: 10, fill: '#f87171' }} />
              <ReferenceLine y={80} stroke="#60a5fa" strokeDasharray="3 3" label={{ value: 'Діаст. норма', position: 'right', fontSize: 10, fill: '#60a5fa' }} />
            </>
          )}

          {showStandard && standardVal && (
            <ReferenceLine 
              y={standardVal} 
              stroke="#22c55e" 
              strokeDasharray="3 3" 
              label={{ value: 'Норма', position: 'right', fontSize: 10, fill: '#22c55e' }} 
            />
          )}

          {/* ЛІНІЇ ДАНИХ */}
          {metric.name === 'Тиск' ? (
            <>
              <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Систолічний" dot={{ r: 4 }} />
              <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Діастолічний" dot={{ r: 4 }} />
            </>
          ) : (
            <Line type="monotone" dataKey="value" stroke={metric.chartColor} strokeWidth={2} name={metric.name} dot={{ r: 4 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent;