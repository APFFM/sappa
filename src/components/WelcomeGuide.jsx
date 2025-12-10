import styles from './WelcomeGuide.module.css';

export default function WelcomeGuide({ isMobile }) {
  return (
    <div className={`${styles.guide} ${isMobile ? styles.mobileDrawer : ''}`}>
      <h2>✨ Welcome to Beauty Advisor!</h2>
      <div className={styles.steps}>
        <div className={styles.step}>
          <span className={styles.emoji}>📸</span>
          <h3>Upload a Selfie</h3>
          <p>Get personalized skincare advice based on your unique features</p>
        </div>
        <div className={styles.step}>
          <span className={styles.emoji}>💬</span>
          <h3>Ask Questions</h3>
          <p>Get expert advice on skincare, makeup, and beauty routines</p>
        </div>
        <div className={styles.step}>
          <span className={styles.emoji}>🎧</span>
          <h3>Listen to Advice</h3>
          <p>Choose between two AI voices for audio responses</p>
        </div>
        <div className={styles.step}>
          <span className={styles.emoji}>💝</span>
          <h3>Track Progress</h3>
          <p>Save recommendations and build your beauty routine</p>
        </div>
      </div>
      <div className={styles.tips}>
        <h3>Pro Tips:</h3>
        <ul>
          <li>Good lighting helps get better advice</li>
          <li>Be specific in your questions</li>
          <li>Try our suggested prompts below</li>
          <li>Save product recommendations for later</li>
        </ul>
      </div>
    </div>
  );
}
