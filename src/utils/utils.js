// Розрахунок калорій
export const calculateBMR = (weight, height, age, gender) => {
    if (!weight || !height || !age || !gender) throw new Error("Missing parameters");
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    if (gender === 'male') bmr += 5;
    else if (gender === 'female') bmr -= 161;
    else throw new Error("Invalid gender");
    return Math.round(bmr);
};

// Розрахунок Індексу маси тіла (ІМТ)
export const calculateBMI = (weight, heightCm) => {
    if (weight <= 0 || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return Number((weight / (heightM * heightM)).toFixed(1));
};

// Валідація тиску
export const validateBloodPressure = (systolic, diastolic) => {
    if (systolic <= diastolic) return false;
    if (systolic < 70 || systolic > 250) return false;
    if (diastolic < 40 || diastolic > 150) return false;
    return true;
};

// Визначення категорії тиску (для алертів)
export const getPressureCategory = (systolic, diastolic) => {
    if (systolic < 90 || diastolic < 60) return "Низький";
    if (systolic <= 120 && diastolic <= 80) return "Нормальний";
    if (systolic <= 139 || diastolic <= 89) return "Підвищений";
    if (systolic >= 140 || diastolic >= 90) return "Гіпертензія";
    return "Невідомо";
};

// Валідація пульсу
export const validatePulse = (pulse) => {
    if (pulse < 30 || pulse > 250) return false;
    return true;
};

// Визначення стану за пульсом
export const getPulseStatus = (pulse) => {
    if (pulse < 60) return "Брадикардія";
    if (pulse > 100) return "Тахікардія";
    return "Норма";
};

// Форматування дати для графіків та звітів CSV
export const formatDataDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
};