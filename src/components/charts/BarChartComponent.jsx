import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const BarChartComponent = ({ data, metric }) => {
  const formattedData = data.map(item => ({
    date: format(new Date(item.date), 'dd.MM HH:mm', { locale: uk }),
    value: item.type === 'pressure' ? item.systolic : item.value,
    ...(item.type === 'pressure' && { diastolic: item.diastolic })
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" />
        <XAxis 
          dataKey="date" 
          className="text-gray-600 dark:text-gray-400"
          tick={{ fontSize: 12 }}
        />
        <YAxis className="text-gray-600 dark:text-gray-400" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #ccc',
            borderRadius: '8px'
          }}
        />
        <Legend />
        {metric.name === 'Тиск' ? (
          <>
            <Bar 
              dataKey="value" 
              fill="#ef4444" 
              name="Систолічний"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              dataKey="diastolic" 
              fill="#3b82f6" 
              name="Діастолічний"
              radius={[8, 8, 0, 0]}
            />
          </>
        ) : (
          <Bar 
            dataKey="value" 
            fill={metric.chartColor} 
            name={metric.name}
            radius={[8, 8, 0, 0]}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarChartComponent;