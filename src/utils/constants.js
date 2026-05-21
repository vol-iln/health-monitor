export const HEALTH_DATA_TYPES = {
  PULSE: 'pulse',
  PRESSURE: 'pressure',
  TEMPERATURE: 'temperature',
  WEIGHT: 'weight',
  BLOOD_SUGAR: 'blood_sugar',
  OXYGEN: 'oxygen',
  SLEEP: 'sleep',
  SPORT: 'sport'
};

export const HEALTH_METRICS = {
  pulse: {
    name: 'Пульс',
    icon: '💓',
    unit: 'уд/хв',
    color: 'red',
    normalRange: { min: 60, max: 90 },
    chartColor: '#ef4444'
  },
  pressure: {
    name: 'Тиск',
    icon: '🩺',
    unit: 'мм рт.ст.',
    color: 'blue',
    normalRange: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
    chartColor: '#3b82f6'
  },
  temperature: {
    name: 'Температура',
    icon: '🌡️',
    unit: '°C',
    color: 'orange',
    normalRange: { min: 36.0, max: 37.5 },
    chartColor: '#f97316'
  },
  weight: {
    name: 'Вага',
    icon: '⚖️',
    unit: 'кг',
    color: 'green',
    normalRange: null, 
    chartColor: '#10b981'
  },
  blood_sugar: {
    name: 'Цукор в крові',
    icon: '🍬',
    unit: 'ммоль/л',
    color: 'purple',
    normalRange: { min: 3.9, max: 5.5 },
    chartColor: '#8b5cf6'
  },
  oxygen: {
    name: 'Кисень в крові',
    icon: '🫁',
    unit: '%',
    color: 'cyan',
    normalRange: { min: 95, max: 100 },
    chartColor: '#06b6d4'
  },
  sleep: {
    name: 'Сон',
    icon: '🌙',
    unit: 'год',
    color: 'indigo', 
    chartColor: '#6366f1'
  },
  sport: {
    name: 'Активність',
    icon: '🏃‍♂️',
    unit: 'хв',
    color: 'emerald',
    chartColor: '#10b981'
  }
};

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area'
};