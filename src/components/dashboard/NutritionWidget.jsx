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

 

  // Стан для зберігання прийомів їжі з Firebase

  const [currentDayMeals, setCurrentDayMeals] = useState({ breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });

 

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);

  const [activeMealType, setActiveMealType] = useState(null);

  const [caloriesToAdd, setCaloriesToAdd] = useState('');



  // Завантаження даних із Firebase для обраної дати

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

        console.error("Помилка завантаження харчування з Firebase:", error);

      }

    };



    fetchNutritionData();

  }, [dateStr, currentUser]);



  // Збереження цілей у localStorage

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



    // Оновлюємо стан на клієнті для миттєвого рендерингу

    setCurrentDayMeals(updatedMeals);



    // Записуємо в Firebase

    if (currentUser?.uid) {

      try {

        const docRef = doc(db, 'nutrition', `${currentUser.uid}_${dateStr}`);

        await setDoc(docRef, {

          userId: currentUser.uid,

          date: dateStr,

          meals: updatedMeals

        }, { merge: true });

        toast.success('Калорії успішно додано! 🍏');

      } catch (error) {

        toast.error('Не вдалося зберегти у хмару');

        console.error(error);

      }

    }



    setCaloriesToAdd('');

    setIsAddFoodOpen(false);

  };



  const mealConfig = {

    breakfast: { name: 'Сніданок', icon: <Coffee className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },

    lunch: { name: 'Обід', icon: <Utensils className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },

    dinner: { name: 'Вечеря', icon: <Pizza className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600' },

    snacks: { name: 'Перекуси', icon: <Apple className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },

  };



  return (

    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 w-full flex flex-col h-full border border-gray-100 dark:border-gray-700 relative overflow-hidden">

      <div className="flex items-center justify-between mb-6">

        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">

          <Apple className="w-6 h-6 text-green-500" />

          <span>Харчування</span>

        </h3>

        <button onClick={() => setIsSettingsOpen(true)} className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 transition">

          <Settings className="w-5 h-5" />

        </button>

      </div>



      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-2xl p-2 mb-6">

        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition">

          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />

        </button>

        <div className="flex items-center space-x-2 font-medium text-gray-800 dark:text-gray-200">

          <Calendar className="w-4 h-4 text-green-500" />

          <span>{dateStr === todayStr ? 'Сьогодні' : currentDate.toLocaleDateString('uk-UA')}</span>

        </div>

        <button onClick={() => changeDate(1)} disabled={dateStr === todayStr} className={`p-2 rounded-xl transition ${dateStr === todayStr ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>

          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />

        </button>

      </div>



      <div className="mb-8 relative">

        <div className="text-center mb-4">

          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Спожито / Норма</p>

          <div className="flex items-baseline justify-center space-x-1">

            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{consumedCalories}</span>

            <span className="text-lg text-gray-400 font-medium">/ {dailyNorm}</span>

            <span className="text-sm text-gray-500">ккал</span>

          </div>

        </div>



        <div className="relative w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">

          <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${progressPercentage > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-500'}`} style={{ width: `${progressPercentage}%` }} />

        </div>

       

        <div className="flex justify-between mt-2 px-1">

          <span className="text-xs font-bold text-green-500">{goal === 'loss' ? 'Схуднення' : goal === 'gain' ? 'Набір маси' : 'Підтримка'}</span>

          <span className={`text-xs font-bold ${remainingCalories < 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{remainingCalories < 0 ? `Перевищення: ${Math.abs(remainingCalories)}` : `Залишилось: ${remainingCalories}`}</span>

        </div>

      </div>



      <div className="space-y-3 flex-grow overflow-y-auto pr-1">

        {Object.entries(mealConfig).map(([key, config]) => {

          const cals = currentDayMeals[key] || 0;

          return (

            <div key={key} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-transparent hover:border-green-200 dark:hover:border-green-800 transition-all">

              <div className="flex items-center space-x-4">

                <div className={`p-3 rounded-xl shadow-sm ${config.color}`}>{config.icon}</div>

                <div>

                  <h4 className="font-bold text-gray-900 dark:text-white">{config.name}</h4>

                  <p className="text-sm text-gray-500 dark:text-gray-400">{cals > 0 ? <span className="text-green-600 dark:text-green-400 font-bold">{cals} ккал</span> : 'Не додано'}</p>

                </div>

              </div>

              <button onClick={() => { setActiveMealType(key); setIsAddFoodOpen(true); }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-600 text-gray-400 shadow-sm border border-gray-200 dark:border-gray-500 hover:text-green-500 hover:border-green-500 transition-colors"><Plus className="w-5 h-5" /></button>

            </div>

          );

        })}

      </div>



      {isAddFoodOpen && (

        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 rounded-3xl">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm">

            <div className="flex justify-between items-center mb-4">

              <h3 className="text-lg font-bold dark:text-white">Додати {mealConfig[activeMealType]?.name.toLowerCase()}</h3>

              <button onClick={() => setIsAddFoodOpen(false)} className="text-gray-400 hover:text-red-500"><X /></button>

            </div>

            <form onSubmit={handleAddCalories}>

              <input type="number" value={caloriesToAdd} onChange={(e) => setCaloriesToAdd(e.target.value)} placeholder="Наприклад: 350" className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white mb-4 focus:ring-2 focus:ring-green-500 outline-none" autoFocus />

              <div className="mb-6">

                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Або виберіть типову порцію:</label>

                <div className="flex flex-wrap gap-2">

                  {recommendedCalories[activeMealType].map((cal) => (

                    <button key={cal} type="button" onClick={() => setCaloriesToAdd(cal.toString())} className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${caloriesToAdd === cal.toString() ? 'bg-green-500 text-white border-green-500' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50'}`}>{cal} ккал</button>

                  ))}

                </div>

              </div>

              <button type="submit" className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition">Зберегти порцію</button>

            </form>

          </div>

        </div>

      )}



      {isSettingsOpen && (

        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 rounded-3xl">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm">

            <div className="flex justify-between items-center mb-6">

              <h3 className="text-xl font-bold flex items-center space-x-2 dark:text-white"><Target className="w-5 h-5 text-blue-500" /> <span>Ваша мета</span></h3>

              <button onClick={() => setIsSettingsOpen(false)} className="text-gray-400 hover:text-red-500"><X /></button>

            </div>

            <div className="space-y-4">

              <div>

                <div className="grid grid-cols-3 gap-2">

                  <button onClick={() => {setGoal('loss'); setCustomCalorieLimit('');}} className={`p-2 text-xs font-bold rounded-lg border ${goal === 'loss' && !customCalorieLimit ? 'bg-green-100 border-green-500 text-green-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>Схуднення</button>

                  <button onClick={() => {setGoal('maintain'); setCustomCalorieLimit('');}} className={`p-2 text-xs font-bold rounded-lg border ${goal === 'maintain' && !customCalorieLimit ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>Підтримка</button>

                  <button onClick={() => {setGoal('gain'); setCustomCalorieLimit('');}} className={`p-2 text-xs font-bold rounded-lg border ${goal === 'gain' && !customCalorieLimit ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>Набір</button>

                </div>

              </div>

              <div className="relative pt-4 border-t border-gray-100 dark:border-gray-700">

                <input type="number" value={customCalorieLimit} onChange={(e) => setCustomCalorieLimit(e.target.value)} placeholder={`Зараз: ${dailyNorm}`} className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />

              </div>

              <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold transition hover:opacity-90">Застосувати</button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};



export default NutritionWidget;