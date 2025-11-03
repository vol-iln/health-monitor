// Валідація email
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email обов\'язковий' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Невірний формат email' };
  }
  
  return { valid: true, error: null };
};

// Валідація паролю
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'Пароль обов\'язковий' };
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Пароль має бути мінімум 6 символів' };
  }
  
  if (password.length > 50) {
    return { valid: false, error: 'Пароль занадто довгий (макс. 50 символів)' };
  }
  
  return { valid: true, error: null };
};

// Валідація імені
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Ім\'я обов\'язкове' };
  }
  
  if (name.trim().length < 2) {
    return { valid: false, error: 'Ім\'я має містити мінімум 2 символи' };
  }
  
  if (name.trim().length > 50) {
    return { valid: false, error: 'Ім\'я занадто довге (макс. 50 символів)' };
  }
  
  return { valid: true, error: null };
};

// Валідація росту
export const validateHeight = (height) => {
  const numHeight = Number(height);
  
  if (!height || isNaN(numHeight)) {
    return { valid: false, error: 'Вкажіть ріст' };
  }
  
  if (numHeight < 50 || numHeight > 250) {
    return { valid: false, error: 'Ріст має бути в межах 50-250 см' };
  }
  
  return { valid: true, error: null };
};

// Валідація ваги
export const validateWeight = (weight) => {
  const numWeight = Number(weight);
  
  if (!weight || isNaN(numWeight)) {
    return { valid: false, error: 'Вкажіть вагу' };
  }
  
  if (numWeight < 20 || numWeight > 300) {
    return { valid: false, error: 'Вага має бути в межах 20-300 кг' };
  }
  
  return { valid: true, error: null };
};

// Валідація року народження
export const validateBirthYear = (year) => {
  const numYear = Number(year);
  const currentYear = new Date().getFullYear();
  
  if (!year || isNaN(numYear)) {
    return { valid: false, error: 'Вкажіть рік народження' };
  }
  
  if (numYear < 1900 || numYear > currentYear) {
    return { valid: false, error: `Рік має бути в межах 1900-${currentYear}` };
  }
  
  return { valid: true, error: null };
};

// Валідація пульсу
export const validatePulse = (pulse) => {
  const numPulse = Number(pulse);
  
  if (!pulse || isNaN(numPulse)) {
    return { valid: false, error: 'Вкажіть пульс' };
  }
  
  if (numPulse < 30 || numPulse > 250) {
    return { valid: false, error: 'Пульс має бути в межах 30-250 уд/хв' };
  }
  
  return { valid: true, error: null };
};

// Валідація тиску
export const validatePressure = (systolic, diastolic) => {
  const numSystolic = Number(systolic);
  const numDiastolic = Number(diastolic);
  
  if (!systolic || isNaN(numSystolic)) {
    return { valid: false, error: 'Вкажіть систолічний тиск' };
  }
  
  if (!diastolic || isNaN(numDiastolic)) {
    return { valid: false, error: 'Вкажіть діастолічний тиск' };
  }
  
  if (numSystolic < 50 || numSystolic > 250) {
    return { valid: false, error: 'Систолічний тиск має бути в межах 50-250 мм рт.ст.' };
  }
  
  if (numDiastolic < 30 || numDiastolic > 150) {
    return { valid: false, error: 'Діастолічний тиск має бути в межах 30-150 мм рт.ст.' };
  }
  
  if (numDiastolic >= numSystolic) {
    return { valid: false, error: 'Діастолічний тиск має бути менше систолічного' };
  }
  
  return { valid: true, error: null };
};

// Валідація температури
export const validateTemperature = (temperature) => {
  const numTemp = Number(temperature);
  
  if (!temperature || isNaN(numTemp)) {
    return { valid: false, error: 'Вкажіть температуру' };
  }
  
  if (numTemp < 30 || numTemp > 45) {
    return { valid: false, error: 'Температура має бути в межах 30-45°C' };
  }
  
  return { valid: true, error: null };
};

// Валідація цукру в крові
export const validateBloodSugar = (bloodSugar) => {
  const numSugar = Number(bloodSugar);
  
  if (!bloodSugar || isNaN(numSugar)) {
    return { valid: false, error: 'Вкажіть рівень цукру' };
  }
  
  if (numSugar < 1 || numSugar > 30) {
    return { valid: false, error: 'Цукор має бути в межах 1-30 ммоль/л' };
  }
  
  return { valid: true, error: null };
};

// Валідація кисню в крові
export const validateOxygen = (oxygen) => {
  const numOxygen = Number(oxygen);
  
  if (!oxygen || isNaN(numOxygen)) {
    return { valid: false, error: 'Вкажіть рівень кисню' };
  }
  
  if (numOxygen < 50 || numOxygen > 100) {
    return { valid: false, error: 'Кисень має бути в межах 50-100%' };
  }
  
  return { valid: true, error: null };
};

// Валідація дати
export const validateDate = (date) => {
  if (!date) {
    return { valid: false, error: 'Вкажіть дату' };
  }
  
  const selectedDate = new Date(date);
  const now = new Date();
  
  if (isNaN(selectedDate.getTime())) {
    return { valid: false, error: 'Невірний формат дати' };
  }
  
  if (selectedDate > now) {
    return { valid: false, error: 'Дата не може бути в майбутньому' };
  }
  
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (selectedDate < oneYearAgo) {
    return { valid: false, error: 'Дата не може бути старше 1 року' };
  }
  
  return { valid: true, error: null };
};

// Загальна валідація форми реєстрації
export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  const nameValidation = validateName(formData.name);
  if (!nameValidation.valid) errors.name = nameValidation.error;
  
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) errors.email = emailValidation.error;
  
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) errors.password = passwordValidation.error;
  
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Паролі не співпадають';
  }
  
  const heightValidation = validateHeight(formData.height);
  if (!heightValidation.valid) errors.height = heightValidation.error;
  
  const weightValidation = validateWeight(formData.weight);
  if (!weightValidation.valid) errors.weight = weightValidation.error;
  
  const birthYearValidation = validateBirthYear(formData.birthYear);
  if (!birthYearValidation.valid) errors.birthYear = birthYearValidation.error;
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};