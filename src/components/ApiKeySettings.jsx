import { useState, useEffect } from 'react';
import styles from './ApiKeySettings.module.css';

export default function ApiKeySettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load saved keys from localStorage
    const savedGeminiKey = localStorage.getItem('gemini_api_key') || '';
    const savedOpenaiKey = localStorage.getItem('openai_api_key') || '';
    setGeminiKey(savedGeminiKey);
    setOpenaiKey(savedOpenaiKey);

    // Check if user needs to set keys
    const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const envOpenaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    // Show settings on first load if no keys are configured
    if ((!envGeminiKey || envGeminiKey === 'your_gemini_api_key_here') && 
        !savedGeminiKey && 
        !sessionStorage.getItem('api_keys_dismissed')) {
      setTimeout(() => setIsOpen(true), 2000);
    }
  }, []);

  const handleSave = () => {
    // Save to localStorage
    if (geminiKey) {
      localStorage.setItem('gemini_api_key', geminiKey);
    }
    if (openaiKey) {
      localStorage.setItem('openai_api_key', openaiKey);
    }

    // Update environment variables dynamically
    if (geminiKey) {
      import.meta.env.VITE_GEMINI_API_KEY = geminiKey;
    }
    if (openaiKey) {
      import.meta.env.VITE_OPENAI_API_KEY = openaiKey;
    }

    setSaveMessage('✓ API keys saved successfully!');
    setTimeout(() => {
      setSaveMessage('');
      setIsOpen(false);
      // Reload page to apply new keys
      window.location.reload();
    }, 1500);
  };

  const handleClear = (keyType) => {
    if (keyType === 'gemini') {
      setGeminiKey('');
      localStorage.removeItem('gemini_api_key');
    } else if (keyType === 'openai') {
      setOpenaiKey('');
      localStorage.removeItem('openai_api_key');
    }
    setSaveMessage('✓ Key cleared');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('api_keys_dismissed', 'true');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Settings Button */}
      <button 
        className={styles.floatingButton} 
        onClick={() => setIsOpen(true)}
        aria-label="API Key Settings"
      >
        <span className={styles.icon}>🔑</span>
      </button>

      {/* Settings Modal */}
      {isOpen && (
        <div className={styles.overlay} onClick={handleDismiss}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleDismiss}>
              ✕
            </button>

            <div className={styles.header}>
              <h2>🔑 API Key Settings</h2>
              <p>Configure your AI service API keys</p>
            </div>

            <div className={styles.content}>
              {/* Gemini API Key */}
              <div className={styles.keySection}>
                <div className={styles.keyHeader}>
                  <h3>Gemini API Key</h3>
                  <span className={styles.badge}>Required for AI Makeup</span>
                </div>
                
                <p className={styles.description}>
                  Used for AI-powered makeup generation and facial analysis
                </p>

                <div className={styles.inputGroup}>
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className={styles.keyInput}
                  />
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                  >
                    {showGeminiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                  {geminiKey && (
                    <button
                      className={styles.clearButton}
                      onClick={() => handleClear('gemini')}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className={styles.helpLink}>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    🔗 Get free API key from Google AI Studio
                  </a>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div className={styles.keySection}>
                <div className={styles.keyHeader}>
                  <h3>OpenAI API Key</h3>
                  <span className={`${styles.badge} ${styles.optional}`}>Optional</span>
                </div>
                
                <p className={styles.description}>
                  Used for chat functionality and beauty advice
                </p>

                <div className={styles.inputGroup}>
                  <input
                    type={showOpenaiKey ? 'text' : 'password'}
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key (optional)"
                    className={styles.keyInput}
                  />
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  >
                    {showOpenaiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                  {openaiKey && (
                    <button
                      className={styles.clearButton}
                      onClick={() => handleClear('openai')}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className={styles.helpLink}>
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    🔗 Get API key from OpenAI Platform
                  </a>
                </div>
              </div>

              {/* Save Message */}
              {saveMessage && (
                <div className={styles.saveMessage}>
                  {saveMessage}
                </div>
              )}

              {/* Security Notice */}
              <div className={styles.securityNotice}>
                <strong>🔒 Security Note:</strong>
                <p>Your API keys are stored locally in your browser and never sent to our servers. They are only used to make direct API calls to Google and OpenAI services.</p>
              </div>

              {/* Action Buttons */}
              <div className={styles.actions}>
                <button
                  className={styles.saveButton}
                  onClick={handleSave}
                  disabled={!geminiKey && !openaiKey}
                >
                  💾 Save & Apply Keys
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={handleDismiss}
                >
                  Cancel
                </button>
              </div>

              {/* Status Indicators */}
              <div className={styles.statusSection}>
                <h4>Current Status:</h4>
                <div className={styles.statusGrid}>
                  <div className={styles.statusItem}>
                    <span className={geminiKey ? styles.statusActive : styles.statusInactive}>
                      {geminiKey ? '✓' : '✗'}
                    </span>
                    <span>Gemini API</span>
                  </div>
                  <div className={styles.statusItem}>
                    <span className={openaiKey ? styles.statusActive : styles.statusInactive}>
                      {openaiKey ? '✓' : '✗'}
                    </span>
                    <span>OpenAI API</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
