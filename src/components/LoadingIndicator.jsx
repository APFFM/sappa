import styles from './LoadingIndicator.module.css';

export default function LoadingIndicator() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.sparkle}>✨</div>
      <div className={styles.text}>Analyzing your beauty...</div>
    </div>
  );
}
