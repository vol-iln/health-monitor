import React from 'react';
import { Heart, Github, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Про проект */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Health Monitor
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Сучасна система моніторингу показників здоров’я з хмарним збереженням даних.
            </p>
          </div>

          {/* Швидкі посилання */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Швидкі посилання
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Про нас
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Політика конфіденційності
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Умови використання
                </a>
              </li>
            </ul>
          </div>

          {/* Контакти */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Контакти
            </h3>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>Володимир</li>
              <li>
                Телефон:{" "}
                <a
                  href="tel:+380984844168"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  +380 98 484 4168
                </a>
              </li>
              <li>
                Email:{" "}
                <a
                  href="mailto:support@healthmonitor.com"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  vol.ilnytskyi@gmail.com
                </a>
              </li>
              <li>
                GitHub:{" "}
                <a
                  href="https://github.com/vol-iln"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Github className="inline w-4 h-4 mr-1" />
                  health-monitor
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижня панель */}
        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
            
            {/* Копірайт */}
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              © {currentYear} Health Monitor. Створено з
              <Heart className="w-4 h-4 text-red-500 mx-1" />
              для вашого здоров’я.
            </p>

            {/* Версія */}
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                Версія 1.0.0
              </span>
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Система працює
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
