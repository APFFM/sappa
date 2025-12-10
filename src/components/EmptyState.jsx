import styles from './EmptyState.module.css';

export default function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>✨</div>
      <h3 className={styles.title}>Welcome to Beauty Advisor!</h3>
      <p className={styles.description}>
        Start a conversation by selecting a prompt below or typing your own question.
      </p>
      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📸</span>
          <span className={styles.featureText}>Upload selfies for personalized advice</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>💬</span>
          <span className={styles.featureText}>Ask about skincare routines</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🎧</span>
          <span className={styles.featureText}>Listen to audio responses</span>
        </div>
      </div>
    </div>
  );
}
