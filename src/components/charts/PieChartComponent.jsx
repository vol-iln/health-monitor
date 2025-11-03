import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PieChartComponent = ({ data, metric }) => {
  const categorizeData = () => {
    if (!data || data.length === 0) return [];

    const categories = {
      normal: 0,
      high: 0,
      low: 0
    };

    data.forEach(item => {
      if (item.type === 'pressure') {
        const systolicNormal = metric.normalRange.systolic;
        const diastolicNormal = metric.normalRange.diastolic;

        if (
          item.systolic >= systolicNormal.min && 
          item.systolic <= systolicNormal.max &&
          item.diastolic >= diastolicNormal.min && 
          item.diastolic <= diastolicNormal.max
        ) {
          categories.normal++;
        } else if (item.systolic > systolicNormal.max || item.diastolic > diastolicNormal.max) {
          categories.high++;
        } else {
          categories.low++;
        }
      } else {
        const normalRange = metric.normalRange;
        if (!normalRange) {
          categories.normal++;
          return;
        }

        if (item.value >= normalRange.min && item.value <= normalRange.max) {
          categories.normal++;
        } else if (item.value > normalRange.max) {
          categories.high++;
        } else {
          categories.low++;
        }
      }
    });

    return [
      { name: 'В нормі', value: categories.normal, color: '#10b981' },
      { name: 'Вище норми', value: categories.high, color: '#ef4444' },
      { name: 'Нижче норми', value: categories.low, color: '#f59e0b' }
    ].filter(item => item.value > 0);
  };

  const chartData = categorizeData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Записів: {data.value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {((data.value / data.payload.totalRecords) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const dataWithTotal = chartData.map(item => ({
    ...item,
    totalRecords: data.length
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-gray-500 dark:text-gray-400">
          Недостатньо даних для відображення
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {dataWithTotal.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry) => (
            <span className="text-gray-700 dark:text-gray-300">
              {value} ({entry.payload.value})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieChartComponent;