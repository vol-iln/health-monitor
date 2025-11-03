import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const LineChartComponent = ({ data, metric }) => {
  const formattedData = data.map(item => ({
    date: format(new Date(item.date), 'dd.MM HH:mm', { locale: uk }),
    value: item.type === 'pressure' ? item.systolic : item.value,
    ...(item.type === 'pressure' && { diastolic: item.diastolic })
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
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
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Систолічний"
              dot={{ r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="diastolic" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Діастолічний"
              dot={{ r: 4 }}
            />
          </>
        ) : (
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={metric.chartColor} 
            strokeWidth={2}
            name={metric.name}
            dot={{ r: 4 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;