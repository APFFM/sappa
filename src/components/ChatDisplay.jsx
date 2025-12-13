import { useState } from 'react';
import styles from './ChatDisplay.module.css';
import AudioMessage from './AudioMessage';
import VirtualTryOn from './VirtualTryOn';

export default function ChatDisplay({ messages }) {
  const [showTryOn, setShowTryOn] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowTryOn(true);
  };

  return (
    <>
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
                  <div className={styles.imageWrapper}>
                    <img 
                      src={msg.image} 
                      alt="Uploaded" 
                      className={styles.imagePreview}
                      onClick={() => handleImageClick(msg.image)}
                    />
                    <button 
                      className={styles.tryOnButton}
                      onClick={() => handleImageClick(msg.image)}
                    >
                      ✨ Try Virtual Makeup
                    </button>
                  </div>
                )}
                {msg.content}
                {msg.role === 'assistant' && (
                  <AudioMessage
                    text={msg.audioContent || msg.content}
                    isSummary={!!msg.audioContent}
                    language={msg.language || 'en'}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {showTryOn && selectedImage && (
        <VirtualTryOn 
          originalImage={selectedImage} 
          onClose={() => setShowTryOn(false)} 
        />
      )}
    </>
  );
}
