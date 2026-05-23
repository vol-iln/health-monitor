import React, { useMemo } from 'react';
// Використовуємо бібліотеку Recharts для побудови SVG-графіків
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';
import { useHealthData } from '../../contexts/HealthDataContext';


const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-200/60 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
          {payload[0].payload.category}: 
          <span className="text-indigo-500 dark:text-indigo-400 font-bold">{payload[0].value} / 100</span>
        </p>
      </div>
    );
  }
  return null;
};

const HealthRadarWidget = () => {
  // Отримуємо глобальний стан медичних записів пацієнта
  const { healthData } = useHealthData();

  /**
   * useMemo - гачок оптимізації продуктивності (Performance Optimization).
   * Він гарантує, що важкі математичні обчислення (фільтрація, зведення) 
   * виконуватимуться ТІЛЬКИ тоді, коли масив healthData дійсно зміниться, 
   * а не при кожному перемальовуванні компонента.
   */
  const radarData = useMemo(() => {
    // 1. Фільтрація даних: беремо записи тільки за останні 7 днів
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentData = healthData.filter(item => new Date(item.date || item.createdAt) >= weekAgo);

    // 2. Обчислення індексу сну (максимум 100 балів)
    const sleepRecords = recentData.filter(d => d.type === 'sleep');
    const avgSleep = sleepRecords.length 
      ? sleepRecords.reduce((sum, item) => sum + Number(item.value), 0) / sleepRecords.length 
      : 0;
    // Формула: (Середній сон / 8 годин) * 100. Якщо немає даних - ставимо базові 10 балів.
    const sleepScore = avgSleep > 0 ? Math.min(Math.round((avgSleep / 8) * 100), 100) : 10; 

    // 3. Обчислення індексу фізичної активності (спорт)
    const sportRecords = recentData.filter(d => d.type === 'sport');
    const avgSport = sportRecords.length 
      ? sportRecords.reduce((sum, item) => sum + Number(item.value), 0) / sportRecords.length 
      : 0;
    // Формула: (Середні хвилини активності / 60) * 100
    const sportScore = avgSport > 0 ? Math.min(Math.round((avgSport / 60) * 100), 100) : 10;

    // 4. Формування кінцевого масиву для графіка RadarChart
    // (Поки що Кардіо, Харчування та Стрес мають статичні/заглушкові дані для демонстрації)
    return [
      { category: 'Кардіо', score: 85, fullMark: 100 }, 
      { category: 'Сон', score: sleepScore, fullMark: 100 }, 
      { category: 'Активність', score: sportScore, fullMark: 100 },
      { category: 'Харчування', score: 70, fullMark: 100 },
      { category: 'Стрес', score: 80, fullMark: 100 },
    ];
  }, [healthData]);

  /**
   * Динамічний пошук найсильнішої та найслабшої сторони.
   * Метод reduce() порівнює кожен елемент масиву та повертає об'єкт із максимальним/мінімальним score.
   */
  const strongest = radarData.reduce((max, obj) => obj.score > max.score ? obj : max, radarData[0]);
  const weakest = radarData.reduce((min, obj) => obj.score < min.score ? obj : min, radarData[0]);

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 w-full flex flex-col h-full transition-all duration-300 relative overflow-hidden">
      
      {/* Декоративне фонове світіння (Premium UI touch) */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none"></div>

      {/* Шапка віджета */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center space-x-3 tracking-tight">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Brain className="w-5 h-5" strokeWidth={2} />
          </div>
          <span>Комплексний аналіз (7 днів)</span>
        </h3>
      </div>

      <div className="flex-grow flex flex-col xl:flex-row items-center mt-2 relative z-10">
        
        {/* SVG Графік Recharts */}
        <div className="w-full xl:w-1/2 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              {/* Кольори ліній сітки адаптовано під світлу/темну теми */}
              <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Показники"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={3}
                fill="url(#colorScore)" // Використання градієнта для заливки
                fillOpacity={0.6}
                isAnimationActive={true}
              />
              {/* Дефеніція градієнта для більш красивого візуалу графіка */}
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Смарт-інсайти (Аналітичний блок) */}
        <div className="w-full xl:w-1/2 mt-6 xl:mt-0 xl:pl-8 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700">
            
            <h4 className="font-semibold text-slate-800 dark:text-white flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ШІ Аналіз даних</span>
            </h4>
            
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {weakest.score < 50 
                ? `Зверніть увагу на показник "${weakest.category}". Рекомендується покращити регулярність записів або переглянути звички для балансу здоров'я.`
                : `Ваші показники у нормі. Продовжуйте підтримувати баланс між активністю та відпочинком для найкращих результатів.`}
            </p>
            
            <div className="space-y-3">
              {/* Сильна сторона */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100/50 dark:border-emerald-800/50 rounded-xl transition-all hover:scale-[1.02]">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Сильна сторона:</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {strongest.category} ({strongest.score}%)
                </span>
              </div>
              
              {/* Зона розвитку */}
              <div className="flex items-center justify-between p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100/50 dark:border-rose-800/50 rounded-xl transition-all hover:scale-[1.02]">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">Зона розвитку:</span>
                </div>
                <span className="font-bold text-rose-600 dark:text-rose-400">
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