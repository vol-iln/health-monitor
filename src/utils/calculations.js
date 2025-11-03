export const calculateBMI = (weight, height) => {
  if (!weight || !height || weight <= 0 || height <= 0) return null;
  const h = height / 100;
  return parseFloat((weight / (h * h)).toFixed(1));
};

export const getBMICategory = (bmi) => {
  if (!bmi || bmi <= 0)
    return { text: 'Невідомо', color: 'gray', range: '-', description: 'Введіть ріст та вагу для розрахунку BMI' };
  if (bmi < 16)
    return { text: 'Виражений дефіцит маси', color: 'red', range: '< 16', description: 'Критично низька вага. Терміново зверніться до лікаря!' };
  if (bmi < 18.5)
    return { text: 'Недостатня вага', color: 'blue', range: '16 - 18.4', description: 'Рекомендується збільшити калорійність раціону та звернутися до дієтолога' };
  if (bmi < 25)
    return { text: 'Нормальна вага', color: 'green', range: '18.5 - 24.9', description: 'Ваша вага в нормі! Продовжуйте підтримувати здоровий спосіб життя' };
  if (bmi < 30)
    return { text: 'Надлишкова вага', color: 'yellow', range: '25 - 29.9', description: 'Рекомендується знизити калорійність раціону та збільшити фізичну активність' };
  if (bmi < 35)
    return { text: 'Ожиріння I ступеня', color: 'orange', range: '30 - 34.9', description: 'Рекомендується консультація з лікарем та дієтологом' };
  if (bmi < 40)
    return { text: 'Ожиріння II ступеня', color: 'red', range: '35 - 39.9', description: 'Необхідна консультація лікаря. Високий ризик для здоров\'я' };
  return { text: 'Ожиріння III ступеня', color: 'red', range: '≥ 40', description: 'Критичне ожиріння. Терміново зверніться до лікаря!' };
};

export const calculateIdealWeight = (height, gender = 'male') => {
  if (!height || height < 100 || height > 250) return null;
  return parseFloat((gender === 'male' ? height - 100 : height - 110).toFixed(1));
};

export const calculateWeightDifference = (currentWeight, idealWeight) => {
  if (!currentWeight || !idealWeight) return { difference: 0, recommendation: '' };
  const diff = currentWeight - idealWeight;
  const abs = Math.abs(diff);
  if (abs <= 5) return { difference: diff.toFixed(1), recommendation: 'Ваша вага близька до ідеальної! 🎉' };
  return diff > 0
    ? { difference: diff.toFixed(1), recommendation: `Рекомендується знизити вагу на ${abs.toFixed(1)} кг` }
    : { difference: diff.toFixed(1), recommendation: `Рекомендується набрати ${abs.toFixed(1)} кг` };
};

export const calculateAge = (birthYear) => {
  const y = new Date().getFullYear();
  if (!birthYear || birthYear < 1900 || birthYear > y) return null;
  return y - birthYear;
};

export const getAgeCategory = (age) => {
  if (!age || age < 0) return 'Невідомо';
  if (age < 18) return 'Дитина/Підліток';
  if (age < 30) return 'Молодь';
  if (age < 45) return 'Дорослі';
  if (age < 60) return 'Середній вік';
  if (age < 75) return 'Похилий вік';
  return 'Старечий вік';
};

export const calculateAverage = (values) => {
  if (!values?.length) return null;
  return parseFloat((values.reduce((a, v) => a + (v || 0), 0) / values.length).toFixed(1));
};

export const calculateMin = (values) => (!values?.length ? null : Math.min(...values));
export const calculateMax = (values) => (!values?.length ? null : Math.max(...values));

export const calculateMedian = (values) => {
  if (!values?.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export const calculateStandardDeviation = (values) => {
  if (!values?.length) return null;
  const avg = calculateAverage(values);
  const dev = Math.sqrt(calculateAverage(values.map(v => (v - avg) ** 2)));
  return parseFloat(dev.toFixed(2));
};

export const calculateTrend = (values) => {
  if (!values || values.length < 2) return { trend: 'stable', percentage: 0, icon: '➡️', description: 'Недостатньо даних' };
  const first = values[values.length - 1];
  const last = values[0];
  if (first === 0) return { trend: 'stable', percentage: 0, icon: '➡️', description: 'Стабільно' };
  const change = ((last - first) / first) * 100;
  if (Math.abs(change) < 5) return { trend: 'stable', percentage: change.toFixed(1), icon: '➡️', description: 'Стабільно (зміна менше 5%)' };
  return change > 0
    ? { trend: 'up', percentage: change.toFixed(1), icon: '📈', description: `Зростання на ${change.toFixed(1)}%` }
    : { trend: 'down', percentage: change.toFixed(1), icon: '📉', description: `Зниження на ${Math.abs(change).toFixed(1)}%` };
};

export const predictNextValue = (values) => {
  if (!values || values.length < 3) return null;
  const n = values.length, x = [...Array(n).keys()], y = values;
  const sumX = x.reduce((a, b) => a + b), sumY = y.reduce((a, b) => a + b);
  const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0);
  const sumX2 = x.reduce((a, xi) => a + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const intercept = (sumY - slope * sumX) / n;
  return parseFloat((slope * n + intercept).toFixed(1));
};

export const isInNormalRange = (v, min, max) => (v == null || min == null || max == null ? null : v >= min && v <= max);

export const calculateDeviationPercentage = (v, min, max) => {
  if (v == null || min == null || max == null) return null;
  const avg = (min + max) / 2;
  return parseFloat((((v - avg) / avg) * 100).toFixed(1));
};

export const classifyDeviation = (v, min, max) => {
  if (v == null || min == null || max == null) return { status: 'unknown', description: 'Невідомо', color: 'gray' };
  if (v >= min && v <= max) return { status: 'normal', description: 'В нормі ✅', color: 'green' };
  const dev = calculateDeviationPercentage(v, min, max);
  if (v < min)
    return Math.abs(dev) > 20 ? { status: 'critical_low', description: 'Критично низьке ⚠️', color: 'red' } : { status: 'low', description: 'Нижче норми ⬇️', color: 'yellow' };
  if (v > max)
    return Math.abs(dev) > 20 ? { status: 'critical_high', description: 'Критично високе ⚠️', color: 'red' } : { status: 'high', description: 'Вище норми ⬆️', color: 'yellow' };
  return { status: 'unknown', description: 'Невідомо', color: 'gray' };
};

export const calculateMeanArterialPressure = (s, d) => {
  if (!s || !d || s < d) return null;
  return Math.round((s + 2 * d) / 3);
};

export const calculatePulsePressure = (s, d) => (!s || !d || s < d ? null : s - d);

export const classifyBloodPressure = (s, d) => {
  if (!s || !d) return { category: 'Невідомо', color: 'gray', recommendation: 'Введіть значення тиску' };
  if (s < 90 || d < 60) return { category: 'Гіпотонія (низький тиск)', color: 'blue', recommendation: 'Випийте води, відпочиньте. При поганому самопочутті зверніться до лікаря' };
  if (s < 120 && d < 80) return { category: 'Оптимальний тиск', color: 'green', recommendation: 'Ваш тиск в нормі! Продовжуйте вести здоровий спосіб життя' };
  if (s < 130 && d < 85) return { category: 'Нормальний тиск', color: 'green', recommendation: 'Тиск в межах норми' };
  if (s < 140 && d < 90) return { category: 'Високий нормальний тиск', color: 'yellow', recommendation: 'Рекомендується моніторинг тиску та консультація лікаря' };
  if (s < 160 && d < 100) return { category: 'Гіпертонія 1 ступеня', color: 'orange', recommendation: 'Зверніться до лікаря для призначення лікування' };
  if (s < 180 && d < 110) return { category: 'Гіпертонія 2 ступеня', color: 'red', recommendation: 'Терміново зверніться до лікаря!' };
  if (s >= 180 || d >= 110) return { category: 'Гіпертонія 3 ступеня (критична)', color: 'red', recommendation: 'ТЕРМІНОВО ЗВЕРНІТЬСЯ ДО ЛІКАРЯ АБО ВИКЛИЧТЕ ШВИДКУ!' };
  return { category: 'Невідомо', color: 'gray', recommendation: 'Перевірте правильність введених даних' };
};

export const calculateBMR = (w, h, a, g = 'male') => {
  if (!w || !h || !a) return null;
  const bmr = g === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
  return Math.round(bmr);
};

export const calculateDailyCalories = (bmr, level = 'moderate') => {
  if (!bmr) return null;
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, veryActive: 1.9 };
  return Math.round(bmr * (mult[level] || 1.55));
};

export const calculatePercentageOfGoal = (c, g) => (!c || !g ? 0 : parseFloat(((c / g) * 100).toFixed(1)));
export const calculateDifference = (v1, v2) => (v1 == null || v2 == null ? null : parseFloat((v1 - v2).toFixed(1)));

export const calculateChangeRate = (data) => {
  if (!data || data.length < 2) return { daily: null, weekly: null, monthly: null };
  const s = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const f = s[0], l = s[s.length - 1];
  const change = l.value - f.value;
  const days = (new Date(l.date) - new Date(f.date)) / (1000 * 60 * 60 * 24);
  if (days === 0) return { daily: null, weekly: null, monthly: null };
  const d = change / days;
  return { daily: parseFloat(d.toFixed(2)), weekly: parseFloat((d * 7).toFixed(2)), monthly: parseFloat((d * 30).toFixed(2)) };
};
