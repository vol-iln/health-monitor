import { 
    calculateBMR, calculateBMI, 
    validateBloodPressure, getPressureCategory, 
    validatePulse, getPulseStatus, 
    formatDataDate 
} from './utils.js';

describe('PHMS Algorithm Unit Tests', () => {

    describe('Модуль розрахунку BMR (Міффлін-Сан Жеор)', () => {
        test('Коректний розрахунок для чоловіка', () => expect(calculateBMR(75, 180, 25, 'male')).toBe(1755));
        test('Коректний розрахунок для жінки', () => expect(calculateBMR(60, 165, 30, 'female')).toBe(1320));
        test('Граничні значення (мінімальна вага)', () => expect(calculateBMR(40, 150, 20, 'female')).toBe(1077));
        test('Викидання помилки при відсутності параметрів', () => expect(() => calculateBMR(75, 180)).toThrow());
        test('Викидання помилки при невірній статі', () => expect(() => calculateBMR(70, 170, 25, 'unknown')).toThrow());
    });

    describe('Модуль розрахунку ІМТ (BMI)', () => {
        test('Нормальна вага', () => expect(calculateBMI(70, 175)).toBe(22.9));
        test('Надмірна вага', () => expect(calculateBMI(90, 170)).toBe(31.1));
        test('Обробка нульових значень', () => expect(calculateBMI(0, 170)).toBe(0));
        test('Обробка від\'ємних значень', () => expect(calculateBMI(-10, 170)).toBe(0));
    });

    describe('Модуль валідації артеріального тиску', () => {
        test('Успішна валідація (120/80)', () => expect(validateBloodPressure(120, 80)).toBe(true));
        test('Блокування (систолічний < діастолічний)', () => expect(validateBloodPressure(80, 120)).toBe(false));
        test('Блокування аномально високого (300/100)', () => expect(validateBloodPressure(300, 100)).toBe(false));
        test('Блокування аномально низького (60/30)', () => expect(validateBloodPressure(60, 30)).toBe(false));
    });

    describe('Модуль категоризації тиску (SOS-алерти)', () => {
        test('Визначення нормального тиску', () => expect(getPressureCategory(120, 80)).toBe("Нормальний"));
        test('Визначення низького тиску', () => expect(getPressureCategory(85, 55)).toBe("Низький"));
        test('Визначення гіпертензії', () => expect(getPressureCategory(145, 95)).toBe("Гіпертензія"));
        test('Визначення підвищеного', () => expect(getPressureCategory(135, 85)).toBe("Підвищений"));
    });

    describe('Модуль валідації та аналізу пульсу', () => {
        test('Успішна валідація нормального пульсу', () => expect(validatePulse(75)).toBe(true));
        test('Блокування критичного пульсу (300)', () => expect(validatePulse(300)).toBe(false));
        test('Визначення брадикардії', () => expect(getPulseStatus(50)).toBe("Брадикардія"));
        test('Визначення норми', () => expect(getPulseStatus(75)).toBe("Норма"));
        test('Визначення тахікардії', () => expect(getPulseStatus(110)).toBe("Тахікардія"));
    });

    describe('Модуль форматування даних', () => {
        test('Коректне форматування стандартної дати', () => expect(formatDataDate('2026-05-15T10:00:00Z')).toBe('15.05.2026'));
        test('Обробка некоректного рядка', () => expect(formatDataDate('invalid-date')).toBe('Invalid Date'));
        test('Обробка порожнього значення', () => expect(formatDataDate('')).toBe('Invalid Date'));
        test('Форматування зміни року', () => expect(formatDataDate('2025-12-31')).toBe('31.12.2025'));
    });
});