import { useState, useEffect } from 'react';
import styles from './VirtualTryOn.module.css';
import { analyzeFacialFeatures, isGeminiAvailable } from '../services/geminiService';
import { generateMakeupImage, isGeminiImageAvailable, validateImage } from '../services/geminiImageService';

export default function VirtualTryOn({ originalImage, onClose }) {
  const [selectedLook, setSelectedLook] = useState('natural');
  const [intensity, setIntensity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [facialAnalysis, setFacialAnalysis] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [activeFeatures, setActiveFeatures] = useState({
    foundation: true,
    concealer: true,
    blush: true,
    eyeshadow: true,
    lipstick: true,
    contouring: false,
    highlighter: true,
  });

  const looks = [
    { id: 'natural', name: 'Natural Glow', icon: '✨', color: '#d4af37' },
    { id: 'glam', name: 'Glamorous', icon: '💄', color: '#e91e63' },
    { id: 'fresh', name: 'Fresh & Clean', icon: '🌿', color: '#10b981' },
    { id: 'evening', name: 'Evening Elegance', icon: '🌙', color: '#6366f1' },
    { id: 'radiant', name: 'Radiant Skin', icon: '☀️', color: '#f59e0b' },
  ];

  // Run AI analysis when component mounts
  useEffect(() => {
    // Validate image first
    const validation = validateImage(originalImage);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    if (isGeminiAvailable() && !facialAnalysis) {
      analyzeWithAI();
    }
  }, []);

  const analyzeWithAI = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await analyzeFacialFeatures(originalImage);
      setFacialAnalysis(analysis);
      console.log('AI Analysis Complete:', analysis);
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError('Failed to analyze image. You can still proceed with default settings.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const features = [
    { id: 'foundation', name: 'Foundation Match', enabled: true },
    { id: 'concealer', name: 'Under-Eye Correction', enabled: true },
    { id: 'blush', name: 'Blush Application', enabled: true },
    { id: 'eyeshadow', name: 'Eye Enhancement', enabled: true },
    { id: 'lipstick', name: 'Lip Color', enabled: true },
    { id: 'contouring', name: 'Face Contouring', enabled: false },
    { id: 'highlighter', name: 'Highlighting', enabled: true },
  ];

  const handleFeatureToggle = (featureId) => {
    setActiveFeatures(prev => ({
      ...prev,
      [featureId]: !prev[featureId]
    }));
  };

  const applyMakeup = async () => {
    if (!isGeminiImageAvailable()) {
      setError('Gemini API key not configured. Please add your API key to enable real makeup generation.');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('🎨 Starting Gemini 2.5 Flash Image generation...');
      
      // Generate makeup image using Gemini 2.5 Flash Image
      const result = await generateMakeupImage(
        originalImage,
        selectedLook,
        intensity,
        facialAnalysis
      );
      
      setGeneratedImage(result);
      setShowComparison(true);
      
      console.log('✨ Makeup successfully applied!');
    } catch (err) {
      console.error('Makeup Generation Error:', err);
      setError(`Failed to generate makeup: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const downloadResult = () => {
    if (!generatedImage) {
      alert('No generated image to download');
      return;
    }
    
    // Create download link
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `makeup-${selectedLook}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✓ Image downloaded');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        
        <div className={styles.header}>
          <h2>✨ AI-Powered Virtual Makeup Try-On</h2>
          <p>Gemini 2.5 Flash Image - Real AI Makeup Generation</p>
          {isAnalyzing && (
            <div className={styles.analyzing}>
              <span className={styles.spinner}></span>
              Analyzing your facial features with AI...
            </div>
          )}
          {error && (
            <div className={styles.errorBanner}>{error}</div>
          )}
          {!isGeminiImageAvailable() && (
            <div className={styles.warningBanner}>
              ⚠️ Gemini API not configured. Add VITE_GEMINI_API_KEY to your .env file to enable real AI makeup generation.
            </div>
          )}
        </div>

        <div className={styles.content}>
          {/* Image Comparison Area */}
          <div className={styles.comparisonArea}>
            {!showComparison ? (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>💄</div>
                <p>Select your desired look and click "Apply Makeup"</p>
                {facialAnalysis && (
                  <div className={styles.analysisPreview}>
                    <h4>✓ AI Analysis Complete</h4>
                    <p>Skin Type: {facialAnalysis.analysis?.skinType}</p>
                    <p>Face Shape: {facialAnalysis.analysis?.faceShape}</p>
                    <p>Skin Tone: {facialAnalysis.analysis?.skinTone}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.comparison} onMouseMove={handleSliderMove}>
                <div className={styles.imageContainer}>
                  <img src={originalImage} alt="Before" className={styles.beforeImage} />
                  <div 
                    className={styles.afterImage} 
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img 
                      src={generatedImage || originalImage} 
                      alt="After" 
                    />
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
                  <span className={styles.afterLabel}>After - {selectedLook} ({intensity}%)</span>
                </div>
                {generatedImage && (
                  <div className={styles.guidePreview}>
                    <strong>✨ Real AI-Generated Makeup</strong>
                    <p>Powered by Gemini 2.5 Flash Image</p>
                    <p>Look: {selectedLook} | Intensity: {intensity}%</p>
                  </div>
                )}
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
                    <input 
                      type="checkbox" 
                      checked={activeFeatures[feature.id]} 
                      onChange={() => handleFeatureToggle(feature.id)}
                    />
                    <span>{feature.name}</span>
                    {facialAnalysis?.recommendations?.[feature.id] && (
                      <span className={styles.aiTag}>AI ✨</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            {facialAnalysis && (
              <div className={styles.section}>
                <h3>🤖 AI Recommendations</h3>
                <div className={styles.aiRecommendations}>
                  {facialAnalysis.recommendations?.foundation && (
                    <div className={styles.recommendation}>
                      <strong>Foundation:</strong>
                      <p>{facialAnalysis.recommendations.foundation.shade} - {facialAnalysis.recommendations.foundation.formula}</p>
                    </div>
                  )}
                  {facialAnalysis.recommendations?.blush && (
                    <div className={styles.recommendation}>
                      <strong>Blush:</strong>
                      <p>Colors: {facialAnalysis.recommendations.blush.colors?.join(', ')}</p>
                      <p>Placement: {facialAnalysis.recommendations.blush.placement}</p>
                    </div>
                  )}
                  {facialAnalysis.recommendations?.lipColors && (
                    <div className={styles.recommendation}>
                      <strong>Lip Colors:</strong>
                      <p>{facialAnalysis.recommendations.lipColors.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button
                className={styles.applyButton}
                onClick={applyMakeup}
                disabled={isProcessing || isAnalyzing || !isGeminiImageAvailable()}
              >
                {isProcessing ? (
                  <>
                    <span className={styles.spinner}></span>
                    Generating with Gemini AI...
                  </>
                ) : (
                  <>
                    <span>🎨</span>
                    {facialAnalysis ? 'Generate AI-Personalized Makeup' : 'Generate AI Makeup'}
                  </>
                )}
              </button>
              
              {showComparison && generatedImage && (
                <>
                  <button className={styles.downloadButton} onClick={downloadResult}>
                    <span>📥</span>
                    Download HD Result
                  </button>
                  <button 
                    className={styles.regenerateButton}
                    onClick={applyMakeup}
                    disabled={isProcessing}
                  >
                    <span>🔄</span>
                    Regenerate
                  </button>
                </>
              )}
            </div>

            {/* Premium Badge */}
            <div className={styles.premiumBadge}>
              <span className={styles.premiumIcon}>👑</span>
              <div className={styles.premiumText}>
                <strong>Premium AI Feature - Gemini 2.5 Flash</strong>
                <p>Real AI-powered makeup generation • Unlimited try-ons • HD downloads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
