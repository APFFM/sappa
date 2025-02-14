import { useState, useEffect } from 'react';
import styles from './ChatForm.module.css';

export default function ChatForm({ onSubmit, isLoading, selectedPrompt, onClearPrompt }) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');

  // Add effect to update message when selectedPrompt changes
  useEffect(() => {
    if (selectedPrompt) {
      setMessage(selectedPrompt);
    }
  }, [selectedPrompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    onSubmit(message, previewUrl);
    setMessage('');
    setImage(null);
    setPreviewUrl(null);
    onClearPrompt();  // Clear the selected prompt after submission
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get compressed base64
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setError('');
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError('Image size should be less than 10MB');
          return;
        }

        const compressedImage = await compressImage(file);
        console.log('Image compressed and loaded');
        setPreviewUrl(compressedImage);
        setImage(file);
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Error processing image');
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      {previewUrl && (
        <div className={styles.imagePreview}>
          <img src={previewUrl} alt="Preview" />
          <button 
            type="button" 
            onClick={() => {
              setImage(null);
              setPreviewUrl(null);
              setError('');
            }}
            className={styles.removeImage}
          >
            ✕
          </button>
        </div>
      )}
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (selectedPrompt) onClearPrompt();  // Clear selected prompt when user types
          }}
          placeholder="Ask about skincare or makeup..."
          disabled={isLoading}
        />
        <label className={styles.imageUpload}>
          📷
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isLoading}
          />
        </label>
        <button 
          type="submit" 
          disabled={isLoading || !message.trim()} 
          className={styles.submitButton}
        >
          {isLoading ? '✨...' : '✨'}
        </button>
      </div>
    </form>
  );
}
