import { useState } from 'react';
import styles from './SkincareRecommender.module.css';
import { analyzeSkinFromImage, getSkincareRoutine, getProductSearchUrls } from '../services/skincareAnalysisService';

export default function SkincareRecommender({ onClose }) {
  const [step, setStep] = useState(1); // 1: upload, 2: location/age, 3: analyzing, 4: results
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // User input
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [manualAge, setManualAge] = useState('');
  const [useAIAge, setUseAIAge] = useState(true);

  // Analysis results
  const [skinAnalysis, setSkinAnalysis] = useState(null);
  const [skincareRoutine, setSkincareRoutine] = useState(null);

  // UI states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('morning'); // morning, evening, weekly

  // Handle image upload and compression
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          const MAX_SIZE = 1024;
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

          resolve(canvas.toDataURL('image/jpeg', 0.85));
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
        if (file.size > 10 * 1024 * 1024) {
          setError('Image size should be less than 10MB');
          return;
        }

        const compressedImage = await compressImage(file);
        setPreviewUrl(compressedImage);
        setUploadedImage(compressedImage);
      } catch (err) {
        console.error('Error processing image:', err);
        setError('Error processing image');
      }
    }
  };

  // Start analysis process
  const handleStartAnalysis = async () => {
    if (!city.trim() || !country.trim()) {
      setError('Please enter your city and country');
      return;
    }

    if (!useAIAge && !manualAge) {
      setError('Please enter your age or let AI detect it');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setStep(3);

    try {
      // Step 1: Analyze skin from image
      const analysis = await analyzeSkinFromImage(uploadedImage);
      setSkinAnalysis(analysis);

      // Step 2: Get personalized routine
      const routine = await getSkincareRoutine(
        analysis,
        { city, country },
        !useAIAge && manualAge ? parseInt(manualAge) : null
      );
      setSkincareRoutine(routine);

      setStep(4);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Failed to analyze: ${err.message}`);
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render product card
  const renderProductCard = (stepData, stepNumber) => {
    const urls = getProductSearchUrls(stepData.searchQuery);

    return (
      <div className={styles.productCard} key={stepNumber}>
        <div className={styles.stepBadge}>Step {stepNumber}</div>
        <h4>{stepData.stepName}</h4>

        <div className={styles.productHeader}>
          <div>
            <div className={styles.productName}>{stepData.product}</div>
            <div className={styles.brandName}>{stepData.brand}</div>
          </div>
          <div className={styles.price}>{stepData.price}</div>
        </div>

        <div className={styles.productDetails}>
          <div className={styles.detailSection}>
            <strong>✨ Key Ingredients:</strong>
            <div className={styles.ingredientTags}>
              {stepData.keyIngredients.map((ing, i) => (
                <span key={i} className={styles.ingredientTag}>{ing}</span>
              ))}
            </div>
          </div>

          <div className={styles.detailSection}>
            <strong>💫 Benefits:</strong>
            <p>{stepData.benefits}</p>
          </div>

          <div className={styles.detailSection}>
            <strong>🤲 How to Use:</strong>
            <p>{stepData.application}</p>
          </div>
        </div>

        <div className={styles.shopLinks}>
          <a href={urls.amazon} target="_blank" rel="noopener noreferrer" className={styles.shopButton}>
            Amazon
          </a>
          <a href={urls.sephora} target="_blank" rel="noopener noreferrer" className={styles.shopButton}>
            Sephora
          </a>
          <a href={urls.ulta} target="_blank" rel="noopener noreferrer" className={styles.shopButton}>
            Ulta
          </a>
          <a href={urls.lookfantastic} target="_blank" rel="noopener noreferrer" className={styles.shopButton}>
            LookFantastic
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>

        <div className={styles.header}>
          <h2>🧴 AI Skincare Analyzer</h2>
          <p>Get your personalized 5-step routine based on AI skin analysis</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* Step 1: Upload Image */}
        {step === 1 && (
          <div className={styles.uploadStep}>
            <div className={styles.uploadInfo}>
              <h3>📸 Upload Your Selfie</h3>
              <p>Our AI will analyze your skin type, concerns, tone, and estimate your age for personalized recommendations</p>
              <ul className={styles.tips}>
                <li>✓ Use natural lighting</li>
                <li>✓ Face the camera directly</li>
                <li>✓ Remove makeup if possible</li>
                <li>✓ Ensure clear photo quality</li>
              </ul>
            </div>

            {previewUrl ? (
              <div className={styles.previewContainer}>
                <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                <button
                  className={styles.changePhotoButton}
                  onClick={() => {
                    setUploadedImage(null);
                    setPreviewUrl(null);
                  }}
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
                  <span>Click to Upload Your Selfie</span>
                  <span className={styles.uploadHint}>JPEG, PNG, or HEIC</span>
                </div>
              </label>
            )}

            {uploadedImage && (
              <button className={styles.nextButton} onClick={() => setStep(2)}>
                Next: Location & Age →
              </button>
            )}
          </div>
        )}

        {/* Step 2: Location and Age Input */}
        {step === 2 && (
          <div className={styles.inputStep}>
            <h3>📍 Location & Age Information</h3>
            <p>Help us recommend products available in your area and suitable for your age</p>

            <div className={styles.formGroup}>
              <label>Location</label>
              <div className={styles.locationInputs}>
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Age</label>
              <div className={styles.ageOptions}>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    checked={useAIAge}
                    onChange={() => setUseAIAge(true)}
                  />
                  <span>Let AI detect my age</span>
                </label>
                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    checked={!useAIAge}
                    onChange={() => setUseAIAge(false)}
                  />
                  <span>I'll enter my age manually</span>
                </label>
              </div>
              {!useAIAge && (
                <input
                  type="number"
                  placeholder="Enter your age"
                  value={manualAge}
                  onChange={(e) => setManualAge(e.target.value)}
                  className={styles.input}
                  min="13"
                  max="120"
                />
              )}
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.backButton} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button
                className={styles.analyzeButton}
                onClick={handleStartAnalysis}
                disabled={!city.trim() || !country.trim() || (!useAIAge && !manualAge)}
              >
                ✨ Analyze My Skin
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Analyzing */}
        {step === 3 && (
          <div className={styles.analyzingStep}>
            <div className={styles.analyzeAnimation}>
              <div className={styles.scanLine}></div>
              <img src={previewUrl} alt="Analyzing" className={styles.analyzingImage} />
            </div>
            <h3>🔬 Analyzing Your Skin...</h3>
            <div className={styles.analyzingSteps}>
              <div className={styles.analyzeStepItem}>✓ Detecting skin type and tone</div>
              <div className={styles.analyzeStepItem}>✓ Identifying concerns and texture</div>
              <div className={styles.analyzeStepItem}>✓ Analyzing age and ethnicity</div>
              <div className={styles.analyzeStepItem}>✓ Creating personalized routine</div>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && skinAnalysis && skincareRoutine && (
          <div className={styles.resultsStep}>
            {/* Skin Analysis Summary */}
            <div className={styles.analysisCard}>
              <h3>🔬 Your Skin Analysis</h3>
              <div className={styles.analysisGrid}>
                <div className={styles.analysisItem}>
                  <span className={styles.analysisLabel}>Skin Type</span>
                  <span className={styles.analysisValue}>{skinAnalysis.skinType}</span>
                </div>
                <div className={styles.analysisItem}>
                  <span className={styles.analysisLabel}>Skin Tone</span>
                  <span className={styles.analysisValue}>{skinAnalysis.skinTone}</span>
                </div>
                <div className={styles.analysisItem}>
                  <span className={styles.analysisLabel}>Estimated Age</span>
                  <span className={styles.analysisValue}>{useAIAge ? skinAnalysis.estimatedAge : manualAge}</span>
                </div>
                <div className={styles.analysisItem}>
                  <span className={styles.analysisLabel}>Ethnicity</span>
                  <span className={styles.analysisValue}>{skinAnalysis.ethnicity}</span>
                </div>
              </div>

              <div className={styles.personalNote}>
                <strong>💝 Personal Note:</strong>
                <p>{skinAnalysis.personalizedNote}</p>
              </div>

              {skinAnalysis.concerns && skinAnalysis.concerns.length > 0 && (
                <div className={styles.concernsSection}>
                  <strong>🎯 Detected Concerns:</strong>
                  <div className={styles.concernsList}>
                    {skinAnalysis.concerns.map((concern, i) => (
                      <div key={i} className={styles.concernItem}>
                        <span className={styles.concernName}>{concern.concern}</span>
                        <span className={`${styles.severityBadge} ${styles[concern.severity]}`}>
                          {concern.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Routine Summary */}
            <div className={styles.routineSummaryCard}>
              <h3>✨ Your Personalized Routine</h3>
              <p>{skincareRoutine.routineSummary}</p>
              <div className={styles.investmentBadge}>
                Monthly Investment: {skincareRoutine.totalMonthlyInvestment}
              </div>
            </div>

            {/* Routine Tabs */}
            <div className={styles.routineTabs}>
              <button
                className={`${styles.tab} ${activeTab === 'morning' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('morning')}
              >
                ☀️ Morning Routine
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'evening' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('evening')}
              >
                🌙 Evening Routine
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'weekly' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('weekly')}
              >
                📅 Weekly Treatments
              </button>
            </div>

            {/* Morning Routine */}
            {activeTab === 'morning' && (
              <div className={styles.routineContent}>
                <h4>☀️ Morning Routine (5 Steps)</h4>
                <div className={styles.productsGrid}>
                  {renderProductCard(skincareRoutine.morning.step1_cleanser, 1)}
                  {renderProductCard(skincareRoutine.morning.step2_toner, 2)}
                  {renderProductCard(skincareRoutine.morning.step3_serum, 3)}
                  {renderProductCard(skincareRoutine.morning.step4_moisturizer, 4)}
                  {renderProductCard(skincareRoutine.morning.step5_sunscreen, 5)}
                </div>
              </div>
            )}

            {/* Evening Routine */}
            {activeTab === 'evening' && (
              <div className={styles.routineContent}>
                <h4>🌙 Evening Routine (5 Steps)</h4>
                <div className={styles.productsGrid}>
                  {renderProductCard(skincareRoutine.evening.step1_cleanser, 1)}
                  {renderProductCard(skincareRoutine.evening.step2_toner, 2)}
                  {renderProductCard(skincareRoutine.evening.step3_treatment, 3)}
                  {renderProductCard(skincareRoutine.evening.step4_eyeCream, 4)}
                  {renderProductCard(skincareRoutine.evening.step5_nightCream, 5)}
                </div>
              </div>
            )}

            {/* Weekly Treatments */}
            {activeTab === 'weekly' && skincareRoutine.weeklyTreatments && (
              <div className={styles.routineContent}>
                <h4>📅 Weekly Treatments</h4>
                <div className={styles.productsGrid}>
                  {skincareRoutine.weeklyTreatments.map((treatment, i) => (
                    <div className={styles.productCard} key={i}>
                      <div className={styles.stepBadge}>{treatment.frequency}</div>
                      <h4>{treatment.treatment}</h4>
                      <div className={styles.productHeader}>
                        <div>
                          <div className={styles.productName}>{treatment.product}</div>
                          <div className={styles.brandName}>{treatment.brand}</div>
                        </div>
                        <div className={styles.price}>{treatment.price}</div>
                      </div>
                      <p>{treatment.benefits}</p>
                      <div className={styles.shopLinks}>
                        {Object.entries(getProductSearchUrls(treatment.searchQuery)).map(([store, url]) => (
                          <a key={store} href={url} target="_blank" rel="noopener noreferrer" className={styles.shopButton}>
                            {store.charAt(0).toUpperCase() + store.slice(1)}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Advice */}
            <div className={styles.adviceSection}>
              <div className={styles.adviceCard}>
                <h4>🌍 Location-Specific Advice</h4>
                <p>{skincareRoutine.locationAdvice}</p>
              </div>

              <div className={styles.adviceCard}>
                <h4>🎨 Ethnicity Considerations</h4>
                <p>{skincareRoutine.ethnicityConsiderations}</p>
              </div>

              {skincareRoutine.ageSpecificTips && skincareRoutine.ageSpecificTips.length > 0 && (
                <div className={styles.adviceCard}>
                  <h4>🎂 Age-Specific Tips</h4>
                  <ul>
                    {skincareRoutine.ageSpecificTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {skincareRoutine.lifestyleRecommendations && skincareRoutine.lifestyleRecommendations.length > 0 && (
                <div className={styles.adviceCard}>
                  <h4>💪 Lifestyle Recommendations</h4>
                  <ul>
                    {skincareRoutine.lifestyleRecommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.finalActions}>
              <button className={styles.startOverButton} onClick={() => {
                setStep(1);
                setSkinAnalysis(null);
                setSkincareRoutine(null);
                setUploadedImage(null);
                setPreviewUrl(null);
              }}>
                ← Start New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
