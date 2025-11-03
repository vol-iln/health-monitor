import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

const AreaChartComponent = ({ data, metric }) => {
  const formattedData = data.map(item => ({
    date: format(new Date(item.date), 'dd.MM HH:mm', { locale: uk }),
    value: item.type === 'pressure' ? item.systolic : item.value,
    ...(item.type === 'pressure' && { diastolic: item.diastolic })
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData}>
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
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#ef4444" 
              fill="#ef444450"
              strokeWidth={2}
              name="Систолічний"
            />
            <Area 
              type="monotone" 
              dataKey="diastolic" 
              stroke="#3b82f6" 
              fill="#3b82f650"
              strokeWidth={2}
              name="Діастолічний"
            />
          </>
        ) : (
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={metric.chartColor} 
            fill={`${metric.chartColor}50`}
            strokeWidth={2}
            name={metric.name}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AreaChartComponent;