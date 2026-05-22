import React, { useState } from 'react';
import { Moon, Sun, HeartPulse } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthLayout = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden flex flex-col justify-center">
      
      {/* Кнопка теми (мінімалістична) */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-105 transition-all duration-300"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
          ) : (
            <Sun className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Декоративний фон (Солідні розмиті сфери) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-100/40 dark:bg-emerald-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-sky-100/40 dark:bg-sky-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] bg-indigo-50/50 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[120px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Контент */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          
          {/* Логотип */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 rounded-2xl mb-4 shadow-sm">
              <HeartPulse className="w-8 h-8" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight mb-2">
              Health Monitor
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              Особистий медичний кабінет
            </p>
          </div>

          {/* Форми */}
          <div className="transition-all duration-500 ease-in-out">
            {isLogin ? (
              <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;