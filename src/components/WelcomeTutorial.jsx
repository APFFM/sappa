import { useState, useEffect } from 'react';
import styles from './WelcomeTutorial.module.css';

export default function WelcomeTutorial() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenTutorial', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.tutorial}>
        <h2>✨ Welcome to Beauty Advisor!</h2>
        <div className={styles.steps}>
          <p>1. Upload a selfie or ask a question</p>
          <p>2. Get personalized beauty advice</p>
          <p>3. Try our suggested prompts below</p>
        </div>
        <button onClick={handleClose}>Got it!</button>
      </div>
    </div>
  );
}
