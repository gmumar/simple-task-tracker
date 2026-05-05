'use client';
import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import styles from './Tracker.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={`${styles.iconButton} glass`} aria-label="Toggle Theme">
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
