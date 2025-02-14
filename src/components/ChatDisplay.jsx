import styles from './ChatDisplay.module.css';
import AudioMessage from './AudioMessage';

export default function ChatDisplay({ messages }) {
  return (
    <div className={styles.chat}>
      {messages.map((msg, index) => (
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
      ))}
    </div>
  );
}
