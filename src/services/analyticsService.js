import { 
  calculateAverage, 
  calculateMin, 
  calculateMax,
  calculateMedian,
  calculateStandardDeviation,
  calculateTrend,
  predictNextValue,
  classifyDeviation,
  calculateChangeRate
} from '../utils/calculations';
import { HEALTH_METRICS } from '../utils/constants';

export const getOverallStatistics = (healthData) => {
  if (!healthData || healthData.length === 0) {
    return {
      totalRecords: 0,
      recordsByType: {},
      dateRange: null,
      mostFrequentType: null
    };
  }

  const recordsByType = {};
  healthData.forEach(item => {
    if (!recordsByType[item.type]) {
      recordsByType[item.type] = 0;
    }
    recordsByType[item.type]++;
  });

  const mostFrequentType = Object.keys(recordsByType).reduce((a, b) => 
    recordsByType[a] > recordsByType[b] ? a : b
  );

  const dates = healthData.map(item => new Date(item.date));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  return {
    totalRecords: healthData.length,
    recordsByType,
    dateRange: {
      start: minDate.toISOString(),
      end: maxDate.toISOString(),
      days: Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
    },
    mostFrequentType,
    averageRecordsPerDay: (healthData.length / Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)))).toFixed(1)
  };
};

export const getMetricStatistics = (data, type) => {
  if (!data || data.length === 0) return null;

  const metric = HEALTH_METRICS[type];
  if (type === 'pressure') return getPressureStatistics(data);

  const values = data.map(item => item.value);

  return {
    count: data.length,
    average: calculateAverage(values),
    min: calculateMin(values),
    max: calculateMax(values),
    median: calculateMedian(values),
    standardDeviation: calculateStandardDeviation(values),
    trend: calculateTrend(values),
    prediction: predictNextValue(values),
    normalRange: metric.normalRange,
    inRangeCount: values.filter(v => 
      metric.normalRange && v >= metric.normalRange.min && v <= metric.normalRange.max
    ).length,
    changeRate: calculateChangeRate(data)
  };
};

const getPressureStatistics = (data) => {
  const systolicValues = data.map(item => item.systolic);
  const diastolicValues = data.map(item => item.diastolic);

  return {
    count: data.length,
    systolic: {
      average: calculateAverage(systolicValues),
      min: calculateMin(systolicValues),
      max: calculateMax(systolicValues),
      median: calculateMedian(systolicValues),
      standardDeviation: calculateStandardDeviation(systolicValues),
      trend: calculateTrend(systolicValues)
    },
    diastolic: {
      average: calculateAverage(diastolicValues),
      min: calculateMin(diastolicValues),
      max: calculateMax(diastolicValues),
      median: calculateMedian(diastolicValues),
      standardDeviation: calculateStandardDeviation(diastolicValues),
      trend: calculateTrend(diastolicValues)
    },
    normalRange: HEALTH_METRICS.pressure.normalRange,
    inRangeCount: data.filter(item => {
      const range = HEALTH_METRICS.pressure.normalRange;
      return item.systolic >= range.systolic.min && 
             item.systolic <= range.systolic.max &&
             item.diastolic >= range.diastolic.min && 
             item.diastolic <= range.diastolic.max;
    }).length
  };
};

export const analyzeTrends = (healthData) => {
  if (!healthData || healthData.length === 0) return {};

  const trends = {};
  const groupedData = {};
  healthData.forEach(item => {
    if (!groupedData[item.type]) groupedData[item.type] = [];
    groupedData[item.type].push(item);
  });

  Object.keys(groupedData).forEach(type => {
    const data = groupedData[type];
    if (type === 'pressure') {
      const systolicValues = data.map(item => item.systolic);
      const diastolicValues = data.map(item => item.diastolic);
      trends[type] = {
        systolic: calculateTrend(systolicValues),
        diastolic: calculateTrend(diastolicValues)
      };
    } else {
      const values = data.map(item => item.value);
      trends[type] = calculateTrend(values);
    }
  });

  return trends;
};

export const analyzeDeviations = (healthData) => {
  if (!healthData || healthData.length === 0) return {};

  const deviations = {};

  healthData.forEach(item => {
    const metric = HEALTH_METRICS[item.type];
    if (!metric || !metric.normalRange) return;

    if (!deviations[item.type]) {
      deviations[item.type] = { total: 0, tooLow: 0, tooHigh: 0, normal: 0 };
    }

    deviations[item.type].total++;

    if (item.type === 'pressure') {
      const range = metric.normalRange;
      if (item.systolic < range.systolic.min || item.diastolic < range.diastolic.min) {
        deviations[item.type].tooLow++;
      } else if (item.systolic > range.systolic.max || item.diastolic > range.diastolic.max) {
        deviations[item.type].tooHigh++;
      } else {
        deviations[item.type].normal++;
      }
    } else {
      if (item.value < metric.normalRange.min) deviations[item.type].tooLow++;
      else if (item.value > metric.normalRange.max) deviations[item.type].tooHigh++;
      else deviations[item.type].normal++;
    }
  });

  Object.keys(deviations).forEach(type => {
    const dev = deviations[type];
    dev.normalPercentage = ((dev.normal / dev.total) * 100).toFixed(1);
    dev.tooLowPercentage = ((dev.tooLow / dev.total) * 100).toFixed(1);
    dev.tooHighPercentage = ((dev.tooHigh / dev.total) * 100).toFixed(1);
  });

  return deviations;
};

export const getWeeklyStatistics = (healthData) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekData = healthData.filter(item => new Date(item.date) >= weekAgo);
  return getOverallStatistics(weekData);
};

export const getMonthlyStatistics = (healthData) => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const monthData = healthData.filter(item => new Date(item.date) >= monthAgo);
  return getOverallStatistics(monthData);
};

export const comparePeriods = (healthData, type) => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  const typeData = healthData.filter(item => item.type === type);
  const weekData = typeData.filter(item => new Date(item.date) >= weekAgo);
  const monthData = typeData.filter(item => new Date(item.date) >= monthAgo);

  return {
    week: getMetricStatistics(weekData, type),
    month: getMetricStatistics(monthData, type),
    all: getMetricStatistics(typeData, type)
  };
};

export const generateInsights = (healthData) => {
  if (!healthData || healthData.length === 0) {
    return ['Почніть додавати показники здоров\'я для отримання персональних інсайтів'];
  }

  const insights = [];
  const trends = analyzeTrends(healthData);
  const deviations = analyzeDeviations(healthData);
  const stats = getOverallStatistics(healthData);

  if (stats.totalRecords < 10) {
    insights.push({
      type: 'info',
      icon: '📊',
      message: `У вас ${stats.totalRecords} записів. Додайте більше даних для точнішого аналізу.`
    });
  } else {
    insights.push({
      type: 'success',
      icon: '✅',
      message: `Чудово! У вас вже ${stats.totalRecords} записів. Продовжуйте регулярний моніторинг!`
    });
  }

  Object.keys(trends).forEach(type => {
    const metric = HEALTH_METRICS[type];
    const trend = trends[type];

    if (type === 'pressure') {
      if (trend.systolic.trend === 'up' && parseFloat(trend.systolic.percentage) > 10) {
        insights.push({
          type: 'warning',
          icon: '⚠️',
          message: `Систолічний тиск зростає (${trend.systolic.percentage}%). Рекомендується консультація лікаря.`
        });
      }
    } else {
      if (trend.trend === 'up' && parseFloat(trend.percentage) > 15) {
        insights.push({
          type: 'warning',
          icon: '⚠️',
          message: `${metric.name} зростає на ${trend.percentage}%. Зверніть увагу на цей показник.`
        });
      } else if (trend.trend === 'down' && parseFloat(trend.percentage) < -15) {
        insights.push({
          type: 'warning',
          icon: '⚠️',
          message: `${metric.name} знижується на ${Math.abs(trend.percentage)}%. Зверніть увагу на цей показник.`
        });
      }
    }
  });

  Object.keys(deviations).forEach(type => {
    const metric = HEALTH_METRICS[type];
    const dev = deviations[type];

    if (parseFloat(dev.normalPercentage) > 80) {
      insights.push({
        type: 'success',
        icon: '🎉',
        message: `Відмінно! ${dev.normalPercentage}% ваших показників ${metric.name.toLowerCase()} в нормі.`
      });
    } else if (parseFloat(dev.normalPercentage) < 50) {
      insights.push({
        type: 'danger',
        icon: '🚨',
        message: `Увага! Лише ${dev.normalPercentage}% показників ${metric.name.toLowerCase()} в нормі. Зверніться до лікаря.`
      });
    }
  });

  if (stats.dateRange && stats.dateRange.days > 0) {
    const avgPerDay = parseFloat(stats.averageRecordsPerDay);
    if (avgPerDay < 0.5) {
      insights.push({
        type: 'info',
        icon: '📅',
        message: 'Додавайте показники частіше для кращого контролю здоров\'я. Рекомендується щонайменше 1 запис на день.'
      });
    } else if (avgPerDay >= 1) {
      insights.push({
        type: 'success',
        icon: '⭐',
        message: 'Відмінна регулярність! Ви робите в середньому більше 1 запису на день.'
      });
    }
  }

  return insights;
};

export const generateAnalyticsReport = (healthData, userData) => {
  const overall = getOverallStatistics(healthData);
  const trends = analyzeTrends(healthData);
  const deviations = analyzeDeviations(healthData);
  const insights = generateInsights(healthData);

  const metricStats = {};
  Object.keys(HEALTH_METRICS).forEach(type => {
    const typeData = healthData.filter(item => item.type === type);
    if (typeData.length > 0) {
      metricStats[type] = getMetricStatistics(typeData, type);
    }
  });

  return {
    generatedAt: new Date().toISOString(),
    user: {
      name: userData?.name,
      email: userData?.email,
      age: userData?.birthYear ? new Date().getFullYear() - userData.birthYear : null
    },
    overall,
    trends,
    deviations,
    metricStats,
    insights
  };
};
