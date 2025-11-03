import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider. Make sure your component is wrapped with <ThemeProvider>.');
  }
  return context;
};

export default useTheme;
