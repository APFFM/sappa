import styles from './LoadingIndicator.module.css';

export default function LoadingIndicator() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.shimmerCircle}>
        <div className={styles.sparkles}>
          <span className={styles.sparkle}>✨</span>
        </div>
      </div>
      <div className={styles.text}>Crafting your beauty advice...</div>
      <div className={styles.dots}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );
}
