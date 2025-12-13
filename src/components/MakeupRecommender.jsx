import { useState } from 'react';
import styles from './MakeupRecommender.module.css';
import { generateMakeupImage, isGeminiImageAvailable } from '../services/geminiImageService';
import { detectLanguage, getLanguageInstruction } from '../services/languageService';

// Occasion options with descriptions
const OCCASIONS = [
  { id: 'everyday', name: 'Everyday', icon: '☀️', description: 'Light, natural look for daily wear' },
  { id: 'office', name: 'Office/Work', icon: '💼', description: 'Professional, polished appearance' },
  { id: 'date', name: 'Date Night', icon: '💕', description: 'Romantic, alluring look' },
  { id: 'party', name: 'Party/Night Out', icon: '🎉', description: 'Bold, glamorous style' },
  { id: 'wedding', name: 'Wedding/Formal', icon: '💒', description: 'Elegant, timeless beauty' },
  { id: 'photoshoot', name: 'Photoshoot', icon: '📸', description: 'Camera-ready, defined features' },
  { id: 'festival', name: 'Festival/Creative', icon: '🎨', description: 'Artistic, expressive makeup' },
  { id: 'brunch', name: 'Brunch/Casual', icon: '🥂', description: 'Fresh, effortless glow' },
];

// Personality/Style options
const PERSONALITIES = [
  { id: 'classic', name: 'Classic', icon: '👑', description: 'Timeless elegance' },
  { id: 'bold', name: 'Bold', icon: '🔥', description: 'Daring and confident' },
  { id: 'romantic', name: 'Romantic', icon: '🌹', description: 'Soft and feminine' },
  { id: 'edgy', name: 'Edgy', icon: '⚡', description: 'Modern and striking' },
  { id: 'natural', name: 'Natural', icon: '🌿', description: 'Minimal and fresh' },
  { id: 'glamorous', name: 'Glamorous', icon: '✨', description: 'Luxurious and polished' },
  { id: 'artistic', name: 'Artistic', icon: '🎭', description: 'Creative and unique' },
  { id: 'minimalist', name: 'Minimalist', icon: '◯', description: 'Less is more' },
];

// Makeup type preferences
const MAKEUP_TYPES = [
  { id: 'full', name: 'Full Glam', icon: '💄', description: 'Complete makeup look' },
  { id: 'light', name: 'Light/BB', icon: '🌸', description: 'Minimal coverage' },
  { id: 'eyes-focus', name: 'Eye Focus', icon: '👁️', description: 'Emphasis on eyes' },
  { id: 'lips-focus', name: 'Lip Focus', icon: '💋', description: 'Bold lip color' },
  { id: 'dewy', name: 'Dewy/Glow', icon: '💧', description: 'Radiant, hydrated skin' },
  { id: 'matte', name: 'Matte', icon: '🖤', description: 'Shine-free finish' },
  { id: 'contour', name: 'Sculpted', icon: '📐', description: 'Defined contour' },
  { id: 'no-makeup', name: 'No-Makeup Look', icon: '🍃', description: 'Enhanced natural beauty' },
];

// Skin tone options for better color matching
const SKIN_TONES = [
  { id: 'fair', name: 'Fair', color: '#FFE5D9' },
  { id: 'light', name: 'Light', color: '#F5D0C5' },
  { id: 'medium', name: 'Medium', color: '#D4A574' },
  { id: 'tan', name: 'Tan', color: '#C68642' },
  { id: 'deep', name: 'Deep', color: '#8D5524' },
  { id: 'dark', name: 'Dark', color: '#5C3317' },
];

export default function MakeupRecommender({ onClose, userImage }) {
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedPersonality, setSelectedPersonality] = useState(null);
  const [selectedMakeupType, setSelectedMakeupType] = useState(null);
  const [selectedSkinTone, setSelectedSkinTone] = useState(null);
  const [customNotes, setCustomNotes] = useState('');
  const [intensity, setIntensity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(userImage || null);
  const [step, setStep] = useState(1); // 1: preferences, 2: upload, 3: result

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Build custom prompt based on selections
  const buildCustomPrompt = () => {
    const occasion = OCCASIONS.find(o => o.id === selectedOccasion);
    const personality = PERSONALITIES.find(p => p.id === selectedPersonality);
    const makeupType = MAKEUP_TYPES.find(m => m.id === selectedMakeupType);
    const skinTone = SKIN_TONES.find(s => s.id === selectedSkinTone);

    let prompt = `Create a personalized makeup look for this person with the following specifications:\n\n`;

    if (occasion) {
      prompt += `OCCASION: ${occasion.name} - ${occasion.description}\n`;
    }

    if (personality) {
      prompt += `STYLE: ${personality.name} - ${personality.description}\n`;
    }

    if (makeupType) {
      prompt += `MAKEUP TYPE: ${makeupType.name} - ${makeupType.description}\n`;
    }

    if (skinTone) {
      prompt += `SKIN TONE: ${skinTone.name} - Choose colors that complement ${skinTone.name.toLowerCase()} skin\n`;
    }

    prompt += `\nINTENSITY: ${intensity}% (${intensity < 35 ? 'subtle' : intensity > 65 ? 'bold' : 'moderate'})\n`;

    if (customNotes.trim()) {
      // Detect language of custom notes
      const lang = detectLanguage(customNotes);
      const langInstruction = getLanguageInstruction(lang);
      prompt += `\nSPECIAL REQUESTS: ${customNotes}${langInstruction}\n`;
    }

    prompt += `\nIMPORTANT GUIDELINES:
- Match makeup colors to the person's actual skin tone, hair color, and features
- Keep the person's identity, expression, and pose EXACTLY the same
- Only add makeup - do not change face structure, hair, clothing, or background
- Ensure colors complement each other harmoniously
- Result should look like professional makeup application
- Make the look appropriate for the specified occasion`;

    return prompt;
  };

  // Generate recommendations without image
  const generateRecommendations = () => {
    const occasion = OCCASIONS.find(o => o.id === selectedOccasion);
    const personality = PERSONALITIES.find(p => p.id === selectedPersonality);
    const makeupType = MAKEUP_TYPES.find(m => m.id === selectedMakeupType);
    const skinTone = SKIN_TONES.find(s => s.id === selectedSkinTone);

    const recs = {
      foundation: getFoundationRec(skinTone, makeupType),
      eyes: getEyeRec(personality, occasion, makeupType),
      lips: getLipRec(personality, occasion, makeupType),
      cheeks: getCheekRec(personality, skinTone),
      tips: getTips(occasion, personality),
    };

    setRecommendations(recs);
  };

  const getFoundationRec = (skinTone, makeupType) => {
    const coverage = makeupType?.id === 'full' ? 'Full coverage' :
                     makeupType?.id === 'light' ? 'Sheer/BB cream' :
                     makeupType?.id === 'dewy' ? 'Luminous finish' :
                     makeupType?.id === 'matte' ? 'Matte finish' : 'Medium coverage';
    return `${coverage} foundation matched to ${skinTone?.name || 'your'} skin tone`;
  };

  const getEyeRec = (personality, occasion, makeupType) => {
    if (makeupType?.id === 'eyes-focus') return 'Bold smokey eye with dramatic lashes';
    if (personality?.id === 'bold' || occasion?.id === 'party') return 'Shimmer eyeshadow with winged liner';
    if (personality?.id === 'natural' || occasion?.id === 'everyday') return 'Soft neutral tones with mascara';
    if (personality?.id === 'romantic') return 'Soft pink and gold tones with flutter lashes';
    return 'Balanced eye look with definition';
  };

  const getLipRec = (personality, occasion, makeupType) => {
    if (makeupType?.id === 'lips-focus') return 'Bold statement lip color';
    if (personality?.id === 'bold' || occasion?.id === 'party') return 'Deep red or berry lip';
    if (personality?.id === 'natural' || occasion?.id === 'everyday') return 'Nude or MLBB shade';
    if (personality?.id === 'romantic') return 'Soft pink or rose';
    if (occasion?.id === 'office') return 'Polished nude or soft mauve';
    return 'Versatile everyday shade';
  };

  const getCheekRec = (personality, skinTone) => {
    if (personality?.id === 'bold') return 'Defined contour with bright blush';
    if (personality?.id === 'natural') return 'Subtle cream blush for natural flush';
    if (personality?.id === 'glamorous') return 'Sculpted contour with highlighter';
    return 'Soft blush and gentle highlight';
  };

  const getTips = (occasion, personality) => {
    const tips = [];
    if (occasion?.id === 'wedding') tips.push('Use waterproof products for longevity');
    if (occasion?.id === 'photoshoot') tips.push('Slightly heavier application for camera');
    if (personality?.id === 'natural') tips.push('Focus on skincare prep');
    if (occasion?.id === 'party') tips.push('Add extra highlight for glow');
    tips.push('Set with setting spray for all-day wear');
    return tips;
  };

  // Generate the actual makeup image
  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError('Please upload a photo first');
      return;
    }

    if (!isGeminiImageAvailable()) {
      setError('Gemini API key not configured. Please add your API key in Settings.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Build the custom prompt
      const customPrompt = buildCustomPrompt();

      // Generate the makeup image
      const result = await generateMakeupImage(
        uploadedImage,
        selectedPersonality || 'natural', // Use personality as lookType
        intensity,
        { customPrompt } // Pass custom prompt
      );

      setGeneratedImage(result);
      generateRecommendations();
      setStep(3);
    } catch (err) {
      console.error('Makeup generation error:', err);
      setError(`Failed to generate: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if minimum selections are made
  const canProceed = selectedOccasion || selectedPersonality || selectedMakeupType;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>

        <div className={styles.header}>
          <h2>✨ Personalized Makeup Recommender</h2>
          <p>Tell us about your style and occasion</p>
        </div>

        {/* Progress Steps */}
        <div className={styles.steps}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
            <span>1</span> Preferences
          </div>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
            <span>2</span> Photo
          </div>
          <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
            <span>3</span> Result
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.content}>
          {/* Step 1: Preferences */}
          {step === 1 && (
            <div className={styles.preferencesStep}>
              {/* Occasion Selection */}
              <div className={styles.section}>
                <h3>🎯 What's the Occasion?</h3>
                <div className={styles.optionGrid}>
                  {OCCASIONS.map((occasion) => (
                    <button
                      key={occasion.id}
                      className={`${styles.optionCard} ${selectedOccasion === occasion.id ? styles.selected : ''}`}
                      onClick={() => setSelectedOccasion(occasion.id)}
                    >
                      <span className={styles.optionIcon}>{occasion.icon}</span>
                      <span className={styles.optionName}>{occasion.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality Selection */}
              <div className={styles.section}>
                <h3>💫 Your Style Vibe</h3>
                <div className={styles.optionGrid}>
                  {PERSONALITIES.map((personality) => (
                    <button
                      key={personality.id}
                      className={`${styles.optionCard} ${selectedPersonality === personality.id ? styles.selected : ''}`}
                      onClick={() => setSelectedPersonality(personality.id)}
                    >
                      <span className={styles.optionIcon}>{personality.icon}</span>
                      <span className={styles.optionName}>{personality.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Makeup Type Selection */}
              <div className={styles.section}>
                <h3>💄 Makeup Focus</h3>
                <div className={styles.optionGrid}>
                  {MAKEUP_TYPES.map((type) => (
                    <button
                      key={type.id}
                      className={`${styles.optionCard} ${selectedMakeupType === type.id ? styles.selected : ''}`}
                      onClick={() => setSelectedMakeupType(type.id)}
                    >
                      <span className={styles.optionIcon}>{type.icon}</span>
                      <span className={styles.optionName}>{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Tone (Optional) */}
              <div className={styles.section}>
                <h3>🎨 Skin Tone (Optional)</h3>
                <div className={styles.skinToneGrid}>
                  {SKIN_TONES.map((tone) => (
                    <button
                      key={tone.id}
                      className={`${styles.skinToneButton} ${selectedSkinTone === tone.id ? styles.selected : ''}`}
                      onClick={() => setSelectedSkinTone(tone.id)}
                      style={{ backgroundColor: tone.color }}
                      title={tone.name}
                    >
                      {selectedSkinTone === tone.id && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intensity Slider */}
              <div className={styles.section}>
                <h3>🔆 Intensity</h3>
                <div className={styles.intensityControl}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className={styles.intensitySlider}
                  />
                  <div className={styles.intensityLabels}>
                    <span>Subtle</span>
                    <span>{intensity}%</span>
                    <span>Bold</span>
                  </div>
                </div>
              </div>

              {/* Custom Notes */}
              <div className={styles.section}>
                <h3>📝 Special Requests (Any Language)</h3>
                <textarea
                  className={styles.customNotes}
                  placeholder="Add any specific requests... (e.g., 'I want blue eyeshadow', 'Ich mag rosa Lippen', 'Je veux un look naturel')"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                className={styles.nextButton}
                onClick={() => setStep(2)}
                disabled={!canProceed}
              >
                Next: Upload Photo →
              </button>
            </div>
          )}

          {/* Step 2: Photo Upload */}
          {step === 2 && (
            <div className={styles.uploadStep}>
              <div className={styles.uploadArea}>
                {uploadedImage ? (
                  <div className={styles.previewContainer}>
                    <img src={uploadedImage} alt="Preview" className={styles.previewImage} />
                    <button
                      className={styles.changePhotoButton}
                      onClick={() => setUploadedImage(null)}
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label className={styles.uploadLabel}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className={styles.fileInput}
                    />
                    <div className={styles.uploadContent}>
                      <span className={styles.uploadIcon}>📷</span>
                      <span>Upload Your Photo</span>
                      <span className={styles.uploadHint}>Tap or click to select</span>
                    </div>
                  </label>
                )}
              </div>

              {/* Selected Preferences Summary */}
              <div className={styles.summaryCard}>
                <h4>Your Selections:</h4>
                <div className={styles.summaryItems}>
                  {selectedOccasion && (
                    <span className={styles.summaryTag}>
                      {OCCASIONS.find(o => o.id === selectedOccasion)?.icon}{' '}
                      {OCCASIONS.find(o => o.id === selectedOccasion)?.name}
                    </span>
                  )}
                  {selectedPersonality && (
                    <span className={styles.summaryTag}>
                      {PERSONALITIES.find(p => p.id === selectedPersonality)?.icon}{' '}
                      {PERSONALITIES.find(p => p.id === selectedPersonality)?.name}
                    </span>
                  )}
                  {selectedMakeupType && (
                    <span className={styles.summaryTag}>
                      {MAKEUP_TYPES.find(m => m.id === selectedMakeupType)?.icon}{' '}
                      {MAKEUP_TYPES.find(m => m.id === selectedMakeupType)?.name}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button className={styles.backButton} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  className={styles.generateButton}
                  onClick={handleGenerate}
                  disabled={!uploadedImage || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className={styles.spinner}></span>
                      Creating Your Look...
                    </>
                  ) : (
                    '✨ Generate My Look'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div className={styles.resultStep}>
              <div className={styles.resultImages}>
                <div className={styles.imageCompare}>
                  <div className={styles.beforeAfter}>
                    <div className={styles.imageBox}>
                      <span className={styles.imageLabel}>Before</span>
                      <img src={uploadedImage} alt="Before" />
                    </div>
                    <div className={styles.imageBox}>
                      <span className={styles.imageLabel}>After</span>
                      <img src={generatedImage || uploadedImage} alt="After" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {recommendations && (
                <div className={styles.recommendationsCard}>
                  <h4>💫 Your Personalized Recommendations</h4>
                  <div className={styles.recGrid}>
                    <div className={styles.recItem}>
                      <span className={styles.recIcon}>🧴</span>
                      <div>
                        <strong>Foundation</strong>
                        <p>{recommendations.foundation}</p>
                      </div>
                    </div>
                    <div className={styles.recItem}>
                      <span className={styles.recIcon}>👁️</span>
                      <div>
                        <strong>Eyes</strong>
                        <p>{recommendations.eyes}</p>
                      </div>
                    </div>
                    <div className={styles.recItem}>
                      <span className={styles.recIcon}>💋</span>
                      <div>
                        <strong>Lips</strong>
                        <p>{recommendations.lips}</p>
                      </div>
                    </div>
                    <div className={styles.recItem}>
                      <span className={styles.recIcon}>🌸</span>
                      <div>
                        <strong>Cheeks</strong>
                        <p>{recommendations.cheeks}</p>
                      </div>
                    </div>
                  </div>
                  {recommendations.tips && recommendations.tips.length > 0 && (
                    <div className={styles.tips}>
                      <strong>💡 Pro Tips:</strong>
                      <ul>
                        {recommendations.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button className={styles.backButton} onClick={() => setStep(1)}>
                  ← Start Over
                </button>
                {generatedImage && (
                  <a
                    href={generatedImage}
                    download={`makeup-look-${Date.now()}.png`}
                    className={styles.downloadButton}
                  >
                    📥 Download
                  </a>
                )}
                <button
                  className={styles.regenerateButton}
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  🔄 Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
