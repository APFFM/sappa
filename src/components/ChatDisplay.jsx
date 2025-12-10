import styles from './ChatDisplay.module.css';
import AudioMessage from './AudioMessage';
import EmptyState from './EmptyState';

export default function ChatDisplay({ messages }) {
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (messages.length === 0) {
    return <EmptyState />;
  }

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
            {msg.timestamp && (
              <div className={styles.timestamp}>
                {formatTimestamp(msg.timestamp)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
