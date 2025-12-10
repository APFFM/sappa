import { useState, useEffect } from 'react';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button 
      className={styles.toggleButton} 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className={`${styles.toggleTrack} ${isDark ? styles.dark : ''}`}>
        <div className={styles.toggleThumb}>
          <span className={styles.icon}>
            {isDark ? '🌙' : '☀️'}
          </span>
        </div>
      </div>
    </button>
  );
}
