import React, { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain, Sparkles } from 'lucide-react';
import { useHealthData } from '../../contexts/HealthDataContext';

 const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-md border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
          {payload[0].payload.category}: <span className="text-indigo-500">{payload[0].value} / 100</span>
        </p>
      </div>
    );
  }
  return null;
};

  const HealthRadarWidget = () => {
  // Дістаємо РЕАЛЬНІ дані з вашої бази Firebase
  const { healthData } = useHealthData();

  // Обчислюємо статистику щоразу, коли змінюються дані
  const radarData = useMemo(() => {
    // 1. Беремо дані тільки за останні 7 днів
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentData = healthData.filter(item => new Date(item.date || item.createdAt) >= weekAgo);

    // 2. Рахуємо середній сон (тип 'sleep', очікувана норма ~ 8 годин)
    const sleepRecords = recentData.filter(d => d.type === 'sleep');
    const avgSleep = sleepRecords.length 
      ? sleepRecords.reduce((sum, item) => sum + Number(item.value), 0) / sleepRecords.length 
      : 0;
    // Формула: (Середній сон / 8 годин) * 100. Максимум 100 балів.
    const sleepScore = avgSleep > 0 ? Math.min(Math.round((avgSleep / 8) * 100), 100) : 10; // 10 балів даємо базово, щоб графік не зникав зовсім

    // 3. Рахуємо середню активність (тип 'sport', очікувана норма ~ 60 хвилин/день)
    const sportRecords = recentData.filter(d => d.type === 'sport');
    const avgSport = sportRecords.length 
      ? sportRecords.reduce((sum, item) => sum + Number(item.value), 0) / sportRecords.length 
      : 0;
    // Формула: (Середні хвилини / 60) * 100
    const sportScore = avgSport > 0 ? Math.min(Math.round((avgSport / 60) * 100), 100) : 10;

    // 4. Формуємо масив для графіка (інші показники поки залишаємо статичними або додамо пізніше)
    return [
      { category: 'Кардіо', score: 85, fullMark: 100 }, 
      { category: 'Сон', score: sleepScore, fullMark: 100 }, 
      { category: 'Активність', score: sportScore, fullMark: 100 },
      { category: 'Харчування', score: 70, fullMark: 100 },
      { category: 'Стрес', score: 80, fullMark: 100 },
    ];
  }, [healthData]);

  // Динамічний пошук найсильнішої та найслабшої сторони
  const strongest = radarData.reduce((max, obj) => obj.score > max.score ? obj : max, radarData[0]);
  const weakest = radarData.reduce((min, obj) => obj.score < min.score ? obj : min, radarData[0]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full flex flex-col h-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <Brain className="w-6 h-6 text-indigo-500" />
          <span>Комплексний аналіз (за 7 днів)</span>
        </h3>
      </div>

      <div className="flex-grow flex flex-col md:flex-row items-center mt-4">
        {/* Графік */}
        <div className="w-full md:w-1/2 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Показники"
                dataKey="score"
                stroke="#6366f1"
                fill="#818cf8"
                fillOpacity={0.5}
                isAnimationActive={true}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Смарт-інсайти (генеруються автоматично) */}
        <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-6 space-y-4">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Аналіз даних</span>
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {weakest.score < 50 
                ? `Зверніть увагу на показник "${weakest.category}". Рекомендується покращити регулярність записів або переглянути звички.`
                : `Ваші показники у нормі. Продовжуйте підтримувати баланс між активністю та відпочинком.`}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-2 bg-green-100 dark:bg-green-900/30 rounded">
                <span className="text-green-800 dark:text-green-400 font-medium">Сильна сторона:</span>
                <span className="font-bold text-green-700 dark:text-green-300">
                  {strongest.category} ({strongest.score}%)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                <span className="text-amber-800 dark:text-amber-400 font-medium">Зона розвитку:</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {weakest.category} ({weakest.score}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRadarWidget;