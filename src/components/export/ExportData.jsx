import React, { useState } from 'react';
import { Download, FileText, Table, Archive, Activity, Info, CheckCircle2 } from 'lucide-react';
import { useHealthData } from '../../contexts/HealthDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { exportToCSV, exportToPDF, exportByType } from '../../services/exportService';
import { HEALTH_METRICS } from '../../utils/constants';
import toast from 'react-hot-toast';

const ExportData = () => {
  const { healthData } = useHealthData();
  const { userData, currentUser } = useAuth();
  const [selectedType, setSelectedType] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [loading, setLoading] = useState(false);

  const groupedData = {};
  Object.keys(HEALTH_METRICS).forEach(type => {
    groupedData[type] = healthData.filter(item => item.type === type);
  });

  const handleExport = async () => {
    if (healthData.length === 0) {
      toast.error('Немає даних для експорту');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const userInfo = {
        name: userData?.name || currentUser?.displayName || 'N/A',
        email: currentUser?.email || 'N/A'
      };

      if (selectedType === 'all') {
        if (selectedFormat === 'csv') {
          exportToCSV(healthData, userInfo);
        } else {
          exportToPDF(healthData, userInfo);
        }
      } else {
        exportByType(healthData, selectedType, selectedFormat, userInfo);
      }

      toast.success(`Файл успішно завантажено! 📥`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error.message || 'Помилка експорту');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-10">
      
      {/* ПРЕМІАЛЬНА ШАПКА */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-3 flex items-center">
            <Archive className="w-8 h-8 mr-3 text-indigo-400" />
            Експорт даних
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Безпечно завантажуйте свою медичну історію для резервного копіювання, аналізу або передачі лікуючому лікарю.
          </p>
        </div>
      </div>

      {healthData.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-sm p-16 text-center max-w-2xl mx-auto mt-10">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Download className="w-10 h-10 text-slate-300 dark:text-slate-500" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Немає даних для експорту
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Спочатку додайте свої показники здоров'я у розділі "Показники", щоб сформувати файл експорту.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ЛІВА КОЛОНКА: НАЛАШТУВАННЯ */}
          <div className="xl:col-span-7 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center tracking-tight">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3">1</span>
                Які дані експортувати?
              </h3>

              <div className="space-y-3 mb-10">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 outline-none ${
                    selectedType === 'all'
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm'
                      : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2.5 rounded-xl ${selectedType === 'all' ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <span className={`font-semibold ${selectedType === 'all' ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'}`}>
                      Всі показники бази
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                      {healthData.length} записів
                    </span>
                    {selectedType === 'all' && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                  </div>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {Object.entries(HEALTH_METRICS).map(([key, metric]) => {
                    const count = groupedData[key]?.length || 0;
                    if (count === 0) return null;

                    const isSelected = selectedType === key;

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedType(key)}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 outline-none ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 shadow-sm'
                            : 'border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{metric.icon}</span>
                          <div className="text-left flex flex-col">
                            <span className={`text-sm font-semibold ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'}`}>
                              {metric.name}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                              {count} записів
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center tracking-tight">
                <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">2</span>
                Формат файлу
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setSelectedFormat('csv')}
                  className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 outline-none overflow-hidden ${
                    selectedFormat === 'csv'
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-sm scale-[1.02]'
                      : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 bg-transparent'
                  }`}
                >
                  {selectedFormat === 'csv' && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-blue-500" /></div>}
                  <div className={`p-3 rounded-2xl mb-3 ${selectedFormat === 'csv' ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Table className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <span className={`font-bold ${selectedFormat === 'csv' ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-200'}`}>CSV Таблиця</span>
                  <span className="text-xs font-medium text-slate-400 mt-1 text-center">Для Excel / Sheets</span>
                </button>

                <button
                  onClick={() => setSelectedFormat('pdf')}
                  className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-300 outline-none overflow-hidden ${
                    selectedFormat === 'pdf'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-500/10 shadow-sm scale-[1.02]'
                      : 'border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-800 bg-transparent'
                  }`}
                >
                  {selectedFormat === 'pdf' && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-rose-500" /></div>}
                  <div className={`p-3 rounded-2xl mb-3 ${selectedFormat === 'pdf' ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <FileText className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <span className={`font-bold ${selectedFormat === 'pdf' ? 'text-rose-900 dark:text-rose-100' : 'text-slate-700 dark:text-slate-200'}`}>PDF Звіт</span>
                  <span className="text-xs font-medium text-slate-400 mt-1 text-center">Документ для друку</span>
                </button>
              </div>

              {/* Кнопка експорту */}
              <button
                onClick={handleExport}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-lg transition-all shadow-lg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Формування файлу...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    <span>Завантажити файл</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ПРАВА КОЛОНКА: СТАТИСТИКА ТА ІНФО */}
          <div className="xl:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center tracking-tight">
                Статистика бази
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-100 dark:border-indigo-500/20">
                  <span className="text-indigo-900 dark:text-indigo-200 font-semibold flex items-center">
                    <Activity className="w-5 h-5 mr-2" /> Загалом записів:
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black text-2xl">
                    {healthData.length}
                  </span>
                </div>

                {Object.entries(HEALTH_METRICS).map(([key, metric]) => {
                  const count = groupedData[key]?.length || 0;
                  if (count === 0) return null;

                  return (
                    <div key={key} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl bg-white dark:bg-slate-700 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm">{metric.icon}</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                          {metric.name}
                        </span>
                      </div>
                      <span className="text-slate-900 dark:text-white font-bold bg-white dark:bg-slate-900 px-3 py-1 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30 p-6 rounded-[2rem]">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <Info className="h-6 w-6 text-sky-500" />
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-bold text-sky-900 dark:text-sky-300 mb-2">
                    Поради щодо форматів:
                  </h4>
                  <ul className="text-sm text-sky-800 dark:text-sky-200/80 space-y-3">
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 mr-2 flex-shrink-0"></div>
                      <span><strong className="text-sky-900 dark:text-sky-200">CSV</strong> найкраще підходить для відкриття в Excel, побудови власних графіків та глибокого аналізу.</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 mr-2 flex-shrink-0"></div>
                      <span><strong className="text-sky-900 dark:text-sky-200">PDF</strong> — це готовий візуальний звіт, який ідеально підходить для роздруківки або відправки вашому лікарю в месенджері.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ExportData;