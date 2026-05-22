import React, { useState, useEffect } from 'react';
import { Apple, Plus, Settings, ChevronLeft, ChevronRight, Calendar, Target, X, Coffee, Utensils, Pizza } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';

const formatDate = (date) => date.toISOString().split('T')[0];

const recommendedCalories = {
  breakfast: [250, 350, 450, 550],
  lunch: [400, 500, 600, 750],
  dinner: [300, 400, 550, 650],
  snacks: [100, 150, 200, 300]
};

const NutritionWidget = () => {
  const { currentUser, userData } = useAuth();
  const todayStr = formatDate(new Date());

  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateStr, setDateStr] = useState(todayStr);
  
  const [goal, setGoal] = useState(() => localStorage.getItem('nutritionGoal') || 'loss');
  const [customCalorieLimit, setCustomCalorieLimit] = useState(() => localStorage.getItem('nutritionCustomLimit') || '');
  
  const [currentDayMeals, setCurrentDayMeals] = useState({ breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState(null);
  const [caloriesToAdd, setCaloriesToAdd] = useState('');

  useEffect(() => {
    const fetchNutritionData = async () => {
      if (!currentUser?.uid) return;
      try {
        const docRef = doc(db, 'nutrition', `${currentUser.uid}_${dateStr}`);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().meals) {
          setCurrentDayMeals(docSnap.data().meals);
        } else {
          setCurrentDayMeals({ breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
        }
      } catch (error) {
        console.error("Помилка завантаження харчування:", error);
      }
    };
    fetchNutritionData();
  }, [dateStr, currentUser]);

  useEffect(() => {
    localStorage.setItem('nutritionGoal', goal);
    localStorage.setItem('nutritionCustomLimit', customCalorieLimit);
  }, [goal, customCalorieLimit]);

  useEffect(() => {
    setDateStr(formatDate(currentDate));
  }, [currentDate]);

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const weight = userData?.weight || 65;
  const height = userData?.height || 165;
  const age = userData?.birthYear ? new Date().getFullYear() - userData.birthYear : 25;
  
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  let calculatedNorm = bmr * 1.2;

  if (goal === 'loss') calculatedNorm -= 300;
  if (goal === 'gain') calculatedNorm += 300;

  const dailyNorm = customCalorieLimit ? parseInt(customCalorieLimit) : Math.round(calculatedNorm);
  const consumedCalories = Object.values(currentDayMeals).reduce((a, b) => a + b, 0);
  const remainingCalories = dailyNorm - consumedCalories;
  const progressPercentage = Math.min((consumedCalories / dailyNorm) * 100, 100);

  const handleAddCalories = async (e) => {
    e.preventDefault();
    if (!caloriesToAdd || isNaN(caloriesToAdd)) return;

    const updatedMeals = {
      ...currentDayMeals,
      [activeMealType]: (currentDayMeals[activeMealType] || 0) + parseInt(caloriesToAdd)
    };

    setCurrentDayMeals(updatedMeals);

    if (currentUser?.uid) {
      try {
        const docRef = doc(db, 'nutrition', `${currentUser.uid}_${dateStr}`);
        await setDoc(docRef, {
          userId: currentUser.uid,
          date: dateStr,
          meals: updatedMeals
        }, { merge: true });
        toast.success('Калорії оновлено');
      } catch (error) { toast.error('Помилка збереження'); }
    }

    setCaloriesToAdd('');
    setIsAddFoodOpen(false);
  };

  const mealConfig = {
    breakfast: { name: 'Сніданок', icon: <Coffee className="w-5 h-5" />, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
    lunch: { name: 'Обід', icon: <Utensils className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    dinner: { name: 'Вечеря', icon: <Pizza className="w-5 h-5" />, color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    snacks: { name: 'Перекуси', icon: <Apple className="w-5 h-5" />, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 w-full flex flex-col h-full relative overflow-hidden transition-all duration-300">
      
      {/* Шапка */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center space-x-2 tracking-tight">
          <Apple className="w-6 h-6 text-emerald-500" />
          <span>Харчування</span>
        </h3>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Календар */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-2 mb-8">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
        <div className="flex items-center space-x-2 font-medium text-slate-700 dark:text-slate-300 text-sm">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span>{dateStr === todayStr ? 'Сьогодні' : currentDate.toLocaleDateString('uk-UA')}</span>
        </div>
        <button onClick={() => changeDate(1)} disabled={dateStr === todayStr} className={`p-2 transition-all ${dateStr === todayStr ? 'opacity-30' : 'hover:bg-white dark:hover:bg-slate-700 rounded-xl'}`}><ChevronRight className="w-5 h-5 text-slate-400" /></button>
      </div>

      {/* Статистика */}
      <div className="mb-10 text-center">
        <div className="flex items-baseline justify-center space-x-1 mb-4">
          <span className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">{consumedCalories}</span>
          <span className="text-lg text-slate-400 font-medium">/ {dailyNorm}</span>
          <span className="text-sm text-slate-400">ккал</span>
        </div>
        
        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${progressPercentage > 100 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${progressPercentage}%` }} />
        </div>
        
        <div className="flex justify-between mt-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{goal === 'loss' ? 'Схуднення' : goal === 'gain' ? 'Набір' : 'Підтримка'}</span>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${remainingCalories < 0 ? 'text-rose-500' : 'text-slate-400'}`}>{remainingCalories < 0 ? `+${Math.abs(remainingCalories)} Перевищення` : `${remainingCalories} Залишок`}</span>
        </div>
      </div>

      {/* Список страв */}
      <div className="space-y-3 flex-grow overflow-y-auto pr-1">
        {Object.entries(mealConfig).map(([key, config]) => {
          const cals = currentDayMeals[key] || 0;
          return (
            <div key={key} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer" onClick={() => { setActiveMealType(key); setIsAddFoodOpen(true); }}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${config.color}`}>{config.icon}</div>
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{config.name}</h4>
                  <p className="text-[13px] text-slate-500 dark:text-slate-400">{cals > 0 ? <span className="font-medium text-emerald-600 dark:text-emerald-400">{cals} ккал</span> : '0 ккал'}</p>
                </div>
              </div>
              <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-700 text-slate-400 shadow-sm border border-slate-100 dark:border-slate-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Модалки */}
      {(isAddFoodOpen || isSettingsOpen) && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 rounded-[2.5rem]">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-sm border border-slate-200/60 dark:border-slate-700">
            {isAddFoodOpen ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold dark:text-white">Додати {mealConfig[activeMealType]?.name.toLowerCase()}</h3>
                  <button onClick={() => setIsAddFoodOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                </div>
                <form onSubmit={handleAddCalories}>
                  <input type="number" value={caloriesToAdd} onChange={(e) => setCaloriesToAdd(e.target.value)} placeholder="0" className="w-full text-center text-4xl p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-6 outline-none dark:text-white font-bold" autoFocus />
                  <div className="flex flex-wrap gap-2 mb-6">
                    {recommendedCalories[activeMealType].map((cal) => (
                      <button key={cal} type="button" onClick={() => setCaloriesToAdd(cal.toString())} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">{cal}</button>
                    ))}
                  </div>
                  <button type="submit" className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20">Зберегти</button>
                </form>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold dark:text-white">Налаштування мети</h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {['loss', 'maintain', 'gain'].map((g) => (
                    <button key={g} type="button" onClick={() => {setGoal(g); setCustomCalorieLimit('');}} className={`p-2 text-[10px] font-bold rounded-xl border ${goal === g && !customCalorieLimit ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-transparent dark:bg-slate-800 dark:text-slate-300'}`}>
                      {g === 'loss' ? 'Схуднення' : g === 'maintain' ? 'Підтримка' : 'Набір'}
                    </button>
                  ))}
                </div>
                <input type="number" value={customCalorieLimit} onChange={(e) => setCustomCalorieLimit(e.target.value)} placeholder={`Ліміт (зараз: ${dailyNorm})`} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 mb-6 text-sm dark:text-white" />
                <button onClick={() => setIsSettingsOpen(false)} className="w-full py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold">Готово</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionWidget;