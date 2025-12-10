import { useState } from 'react';
import styles from './VirtualTryOn.module.css';

export default function VirtualTryOn({ originalImage, onClose }) {
  const [selectedLook, setSelectedLook] = useState('natural');
  const [intensity, setIntensity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);

  const looks = [
    { id: 'natural', name: 'Natural Glow', icon: '✨', color: '#d4af37' },
    { id: 'glam', name: 'Glamorous', icon: '💄', color: '#e91e63' },
    { id: 'fresh', name: 'Fresh & Clean', icon: '🌿', color: '#10b981' },
    { id: 'evening', name: 'Evening Elegance', icon: '🌙', color: '#6366f1' },
    { id: 'radiant', name: 'Radiant Skin', icon: '☀️', color: '#f59e0b' },
  ];

  const features = [
    { id: 'foundation', name: 'Foundation Match', enabled: true },
    { id: 'concealer', name: 'Under-Eye Correction', enabled: true },
    { id: 'blush', name: 'Blush Application', enabled: true },
    { id: 'eyeshadow', name: 'Eye Enhancement', enabled: true },
    { id: 'lipstick', name: 'Lip Color', enabled: true },
    { id: 'contouring', name: 'Face Contouring', enabled: false },
    { id: 'highlighter', name: 'Highlighting', enabled: true },
  ];

  const applyMakeup = () => {
    setIsProcessing(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowComparison(true);
    }, 2000);
  };

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const downloadResult = () => {
    // Implementation for downloading the result
    console.log('Downloading result...');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        
        <div className={styles.header}>
          <h2>✨ Virtual Makeup Try-On</h2>
          <p>AI-Powered Beauty Transformation</p>
        </div>

        <div className={styles.content}>
          {/* Image Comparison Area */}
          <div className={styles.comparisonArea}>
            {!showComparison ? (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>💄</div>
                <p>Select your desired look and click "Apply Makeup"</p>
              </div>
            ) : (
              <div className={styles.comparison} onMouseMove={handleSliderMove}>
                <div className={styles.imageContainer}>
                  <img src={originalImage} alt="Before" className={styles.beforeImage} />
                  <div 
                    className={styles.afterImage} 
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img src={originalImage} alt="After" style={{ filter: 'brightness(1.1) contrast(1.05) saturate(1.2)' }} />
                    <div className={styles.virtualMakeup}></div>
                  </div>
                  <div 
                    className={styles.slider} 
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className={styles.sliderButton}>
                      <span>↔</span>
                    </div>
                  </div>
                </div>
                <div className={styles.labels}>
                  <span className={styles.beforeLabel}>Before</span>
                  <span className={styles.afterLabel}>After</span>
                </div>
              </div>
            )}
          </div>

          {/* Controls Panel */}
          <div className={styles.controls}>
            {/* Look Selection */}
            <div className={styles.section}>
              <h3>Choose Your Look</h3>
              <div className={styles.lookGrid}>
                {looks.map((look) => (
                  <button
                    key={look.id}
                    className={`${styles.lookButton} ${selectedLook === look.id ? styles.active : ''}`}
                    onClick={() => setSelectedLook(look.id)}
                    style={{ '--look-color': look.color }}
                  >
                    <span className={styles.lookIcon}>{look.icon}</span>
                    <span className={styles.lookName}>{look.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Intensity Control */}
            <div className={styles.section}>
              <h3>Makeup Intensity</h3>
              <div className={styles.intensityControl}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className={styles.intensitySlider}
                />
                <div className={styles.intensityLabels}>
                  <span>Natural</span>
                  <span>{intensity}%</span>
                  <span>Bold</span>
                </div>
              </div>
            </div>

            {/* Features Checklist */}
            <div className={styles.section}>
              <h3>Customize Features</h3>
              <div className={styles.featuresList}>
                {features.map((feature) => (
                  <label key={feature.id} className={styles.featureItem}>
                    <input type="checkbox" defaultChecked={feature.enabled} />
                    <span>{feature.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.applyButton}
                onClick={applyMakeup}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className={styles.spinner}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Apply Makeup
                  </>
                )}
              </button>
              
              {showComparison && (
                <button className={styles.downloadButton} onClick={downloadResult}>
                  <span>📥</span>
                  Download Result
                </button>
              )}
            </div>

            {/* Premium Badge */}
            <div className={styles.premiumBadge}>
              <span className={styles.premiumIcon}>👑</span>
              <div className={styles.premiumText}>
                <strong>Premium Feature</strong>
                <p>Unlock unlimited try-ons and HD downloads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
