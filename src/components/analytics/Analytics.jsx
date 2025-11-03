import React, { useState } from 'react';
import { BarChart3, TrendingUp, Lightbulb } from 'lucide-react';
import { useHealthData } from '../../contexts/HealthDataContext';
import { HEALTH_METRICS } from '../../utils/constants';
import LineChartComponent from '../charts/LineChartComponent';
import BarChartComponent from '../charts/BarChartComponent';
import AreaChartComponent from '../charts/AreaChartComponent';
import PieChartComponent from '../charts/PieChartComponent';
import ChartSelector from '../charts/ChartSelector';
import TrendsAnalysis from './TrendsAnalysis';
import HealthInsights from './HealthInsights';

const Analytics = () => {
  const { healthData, loading } = useHealthData();
  const [activeTab, setActiveTab] = useState('charts'); 
  const [selectedMetric, setSelectedMetric] = useState('pulse');
  const [chartTypes, setChartTypes] = useState({
    pulse: 'line',
    pressure: 'line',
    temperature: 'line',
    weight: 'line',
    blood_sugar: 'line',
    oxygen: 'line'
  });

  const groupedData = {};
  Object.keys(HEALTH_METRICS).forEach(type => {
    groupedData[type] = healthData.filter(item => item.type === type);
  });

  const handleChartTypeChange = (metricType, chartType) => {
    setChartTypes(prev => ({
      ...prev,
      [metricType]: chartType
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-4">Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Вкладки */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all flex-1 ${
              activeTab === 'charts'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-semibold">Графіки</span>
          </button>
          
          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all flex-1 ${
              activeTab === 'trends'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Тенденції</span>
          </button>

          <button
            onClick={() => setActiveTab('insights')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all flex-1 ${
              activeTab === 'insights'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Lightbulb className="w-5 h-5" />
            <span className="font-semibold">Інсайти</span>
          </button>
        </div>
      </div>

      {/* Контент */}
      {activeTab === 'charts' && (
        <ChartsView
          healthData={healthData}
          groupedData={groupedData}
          selectedMetric={selectedMetric}
          setSelectedMetric={setSelectedMetric}
          chartTypes={chartTypes}
          handleChartTypeChange={handleChartTypeChange}
        />
      )}

      {activeTab === 'trends' && <TrendsAnalysis />}
      
      {activeTab === 'insights' && <HealthInsights />}
    </div>
  );
};

const ChartsView = ({ 
  healthData, 
  groupedData, 
  selectedMetric, 
  setSelectedMetric, 
  chartTypes, 
  handleChartTypeChange 
}) => {
  if (healthData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
        <div className="text-8xl mb-6">📊</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Немає даних для відображення
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Спочатку додайте показники здоров'я у розділі "Показники"
        </p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Графіки та статистика
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Візуалізація ваших показників здоров'я
        </p>
      </div>

      {/* Вкладки для вибору метрики */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(HEALTH_METRICS).map(([key, metric]) => {
            const count = groupedData[key]?.length || 0;
            if (count === 0) return null;

            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                  selectedMetric === key
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-2xl">{metric.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{metric.name}</div>
                  <div className="text-xs opacity-75">{count} записів</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Графік для обраної метрики */}
      {groupedData[selectedMetric]?.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span className="text-3xl">{HEALTH_METRICS[selectedMetric].icon}</span>
                <span>{HEALTH_METRICS[selectedMetric].name}</span>
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Всього записів: {groupedData[selectedMetric].length}
              </p>
            </div>
            
            <ChartSelector
              selectedType={chartTypes[selectedMetric]}
              onChange={(type) => handleChartTypeChange(selectedMetric, type)}
            />
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Останнє значення"
              value={getLastValue(groupedData[selectedMetric], selectedMetric)}
              unit={HEALTH_METRICS[selectedMetric].unit}
              color="blue"
            />
            <StatCard
              label="Середнє"
              value={getAverage(groupedData[selectedMetric], selectedMetric)}
              unit={HEALTH_METRICS[selectedMetric].unit}
              color="green"
            />
            <StatCard
              label="Мінімум"
              value={getMin(groupedData[selectedMetric], selectedMetric)}
              unit={HEALTH_METRICS[selectedMetric].unit}
              color="orange"
            />
            <StatCard
              label="Максимум"
              value={getMax(groupedData[selectedMetric], selectedMetric)}
              unit={HEALTH_METRICS[selectedMetric].unit}
              color="red"
            />
          </div>

          {/* Відображення графіка */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            {chartTypes[selectedMetric] === 'line' && (
              <LineChartComponent
                data={groupedData[selectedMetric].slice().reverse()}
                metric={HEALTH_METRICS[selectedMetric]}
              />
            )}
            {chartTypes[selectedMetric] === 'bar' && (
              <BarChartComponent
                data={groupedData[selectedMetric].slice().reverse()}
                metric={HEALTH_METRICS[selectedMetric]}
              />
            )}
            {chartTypes[selectedMetric] === 'area' && (
              <AreaChartComponent
                data={groupedData[selectedMetric].slice().reverse()}
                metric={HEALTH_METRICS[selectedMetric]}
              />
            )}
            {chartTypes[selectedMetric] === 'pie' && (
              <PieChartComponent
                data={groupedData[selectedMetric]}
                metric={HEALTH_METRICS[selectedMetric]}
              />
            )}
          </div>

          {/* Норма */}
          {HEALTH_METRICS[selectedMetric].normalRange && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                📌 Нормальні значення:
              </h4>
              <p className="text-blue-800 dark:text-blue-200">
                {selectedMetric === 'pressure' ? (
                  <>
                    Систолічний: {HEALTH_METRICS[selectedMetric].normalRange.systolic.min}-
                    {HEALTH_METRICS[selectedMetric].normalRange.systolic.max} {HEALTH_METRICS[selectedMetric].unit}
                    <br />
                    Діастолічний: {HEALTH_METRICS[selectedMetric].normalRange.diastolic.min}-
                    {HEALTH_METRICS[selectedMetric].normalRange.diastolic.max} {HEALTH_METRICS[selectedMetric].unit}
                  </>
                ) : (
                  <>
                    {HEALTH_METRICS[selectedMetric].normalRange.min}-
                    {HEALTH_METRICS[selectedMetric].normalRange.max} {HEALTH_METRICS[selectedMetric].unit}
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Немає даних для цього показника
          </p>
        </div>
      )}
    </>
  );
};

const StatCard = ({ label, value, unit, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
    green: 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300',
    orange: 'bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
    red: 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300',
  };

  return (
    <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
      <div className="text-sm opacity-75 mb-1">{label}</div>
      <div className="text-2xl font-bold">
        {value} <span className="text-base font-normal">{unit}</span>
      </div>
    </div>
  );
};

const getLastValue = (data, type) => {
  if (data.length === 0) return '-';
  const last = data[0];
  return type === 'pressure' ? `${last.systolic}/${last.diastolic}` : last.value.toFixed(1);
};

const getAverage = (data, type) => {
  if (data.length === 0) return '-';
  if (type === 'pressure') {
    const avgSys = data.reduce((sum, item) => sum + item.systolic, 0) / data.length;
    const avgDia = data.reduce((sum, item) => sum + item.diastolic, 0) / data.length;
    return `${avgSys.toFixed(0)}/${avgDia.toFixed(0)}`;
  }
  const avg = data.reduce((sum, item) => sum + item.value, 0) / data.length;
  return avg.toFixed(1);
};

const getMin = (data, type) => {
  if (data.length === 0) return '-';
  if (type === 'pressure') {
    const minSys = Math.min(...data.map(item => item.systolic));
    const minDia = Math.min(...data.map(item => item.diastolic));
    return `${minSys}/${minDia}`;
  }
  return Math.min(...data.map(item => item.value)).toFixed(1);
};

const getMax = (data, type) => {
  if (data.length === 0) return '-';
  if (type === 'pressure') {
    const maxSys = Math.max(...data.map(item => item.systolic));
    const maxDia = Math.max(...data.map(item => item.diastolic));
    return `${maxSys}/${maxDia}`;
  }
  return Math.max(...data.map(item => item.value)).toFixed(1);
};

export default Analytics;