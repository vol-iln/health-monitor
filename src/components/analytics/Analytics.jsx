import React, { useState } from 'react';
import { BarChart3, TrendingUp, Lightbulb, Activity } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mt-4 font-medium tracking-wide animate-pulse">Завантаження аналітики...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-6xl mx-auto">
      
      {/* ПРЕМІАЛЬНІ ВКЛАДКИ (iOS Style) */}
      <div className="bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 border border-slate-200/50 dark:border-slate-700/50 w-full sm:w-fit mx-auto shadow-sm">
        <button
          onClick={() => setActiveTab('charts')}
          className={`flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
            activeTab === 'charts'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Графіки</span>
        </button>
        
        <button
          onClick={() => setActiveTab('trends')}
          className={`flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
            activeTab === 'trends'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Тенденції</span>
        </button>

        <button
          onClick={() => setActiveTab('insights')}
          className={`flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
            activeTab === 'insights'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Інсайти</span>
        </button>
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
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200/60 dark:border-slate-800 p-12 text-center max-w-2xl mx-auto mt-10">
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-blue-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Немає даних для аналітики
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Спочатку додайте свої показники здоров'я у розділі "Показники", щоб побачити красиві графіки та статистику.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="px-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
          Детальна аналітика
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Оберіть показник для перегляду статистики та візуалізації
        </p>
      </div>

      {/* Вкладки для вибору метрики */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(HEALTH_METRICS).map(([key, metric]) => {
          const count = groupedData[key]?.length || 0;
          if (count === 0) return null;

          const isActive = selectedMetric === key;

          return (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 transform scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
              }`}
            >
              <span className={`text-xl ${isActive ? 'text-white' : ''}`}>{metric.icon}</span>
              <div className="text-left">
                <div className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{metric.name}</div>
                <div className={`text-[11px] font-medium ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{count} записів</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Графік для обраної метрики */}
      {groupedData[selectedMetric]?.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 overflow-hidden">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                {HEALTH_METRICS[selectedMetric].icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {HEALTH_METRICS[selectedMetric].name}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center mt-0.5">
                  <Activity className="w-4 h-4 mr-1.5 text-blue-500" />
                  Активна метрика
                </p>
              </div>
            </div>
            
            <ChartSelector
              selectedType={chartTypes[selectedMetric]}
              onChange={(type) => handleChartTypeChange(selectedMetric, type)}
            />
          </div>

          {/* Статистика (StatCards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Останнє значення"
              value={getLastValue(groupedData[selectedMetric], selectedMetric)}
              unit={HEALTH_METRICS[selectedMetric].unit}
              color="indigo"
            />
            <StatCard
              label="Середнє"
              value={getAverage(groupedData[selectedMetric], selectedMetric)}
              unit={HEALTH_METRICS[selectedMetric].unit}
              color="emerald"
            />
            <StatCard
              label="Мінімум"
              value={getMin(groupedData[selectedMetric], selectedMetric)}
              unit={HEALTH_METRICS[selectedMetric].unit}
              color="amber"
            />
            <StatCard
              label="Максимум"
              value={getMax(groupedData[selectedMetric], selectedMetric)}
              unit={HEALTH_METRICS[selectedMetric].unit}
              color="rose"
            />
          </div>

          {/* Відображення графіка */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800">
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
            <div className="mt-6 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                  Нормальні значення:
                </h4>
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                {selectedMetric === 'pressure' ? (
                  <div className="flex space-x-4">
                    <span>SYS: <span className="text-slate-900 dark:text-white">{HEALTH_METRICS[selectedMetric].normalRange.systolic.min}-{HEALTH_METRICS[selectedMetric].normalRange.systolic.max}</span></span>
                    <span>DIA: <span className="text-slate-900 dark:text-white">{HEALTH_METRICS[selectedMetric].normalRange.diastolic.min}-{HEALTH_METRICS[selectedMetric].normalRange.diastolic.max}</span></span>
                  </div>
                ) : (
                  <span>
                    <span className="text-slate-900 dark:text-white">{HEALTH_METRICS[selectedMetric].normalRange.min} - {HEALTH_METRICS[selectedMetric].normalRange.max}</span> {HEALTH_METRICS[selectedMetric].unit}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm p-12 text-center border border-slate-200/60 dark:border-slate-800">
          <div className="text-6xl mb-4 opacity-50 grayscale">📊</div>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
            Немає даних для цього показника
          </p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, unit, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-500/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-500/20',
    amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100/50 dark:border-amber-500/20',
    rose: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100/50 dark:border-rose-500/20',
  };

  return (
    <div className={`p-5 rounded-2xl transition-transform hover:scale-[1.02] ${colorClasses[color]}`}>
      <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 mb-2">{label}</div>
      <div className="text-2xl font-black tracking-tight">
        {value} <span className="text-sm font-semibold opacity-70 ml-1">{unit}</span>
      </div>
    </div>
  );
};

// Хелпери залишені без змін
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