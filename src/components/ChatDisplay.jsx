import styles from './ChatDisplay.module.css';
import AudioMessage from './AudioMessage';

export default function ChatDisplay({ messages }) {
  return (
    <div className={styles.chat}>
      {messages.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>✨</div>
          <h3 className={styles.emptyTitle}>Start Your Beauty Journey</h3>
          <p className={styles.emptyText}>
            Upload a photo or select a suggestion below to get personalized beauty advice from your AI expert.
          </p>
        </div>
      ) : (
        messages.map((msg, index) => (
          <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
            <span className={styles.icon}>
              {msg.role === 'user' ? '👤' : '🌸'}
            </span>
            <div className={styles.contentWrapper}>
              {msg.image && (
                <img 
                  src={msg.image} 
                  alt="Uploaded" 
                  className={styles.imagePreview}
                />
              )}
              {msg.content}
              {msg.role === 'assistant' && (
                <AudioMessage 
                  text={msg.audioContent || msg.content} 
                  isSummary={!!msg.audioContent}
                />
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
