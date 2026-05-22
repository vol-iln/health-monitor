import React from 'react';
import { Heart, Github, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800 mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          
          {/* Про проект */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Health Monitor
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
              Сучасна система моніторингу показників здоров’я з надійним хмарним збереженням даних.
            </p>
          </div>

          {/* Швидкі посилання */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Навігація
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <a href="#" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Про нас
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Політика конфіденційності
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  Умови використання
                </a>
              </li>
            </ul>
          </div>

          {/* Контакти */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Контакти
            </h3>
            <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
              <li className="font-medium text-slate-700 dark:text-slate-300">Володимир</li>
              <li>
                <a href="tel:+380984844168" className="flex items-center group hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  <Phone className="w-4 h-4 mr-2.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  +380 98 484 4168
                </a>
              </li>
              <li>
                <a href="mailto:vol.ilnytskyi@gmail.com" className="flex items-center group hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  <Mail className="w-4 h-4 mr-2.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  vol.ilnytskyi@gmail.com
                </a>
              </li>
              <li>
                <a href="https://github.com/vol-iln" target="_blank" rel="noopener noreferrer" className="flex items-center group hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                  <Github className="w-4 h-4 mr-2.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                  health-monitor
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижня панель */}
        <div className="border-t border-slate-200/60 dark:border-slate-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            
            {/* Копірайт */}
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              © {currentYear} Health Monitor. Створено з
              <Heart className="w-4 h-4 text-rose-500 mx-1.5 fill-current" />
              для вашого здоров’я.
            </p>

            {/* Версія та статус */}
            <div className="flex items-center space-x-6">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                Версія 1.0.0
              </span>
              <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Система працює
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;