import { useState, useEffect } from 'react';
import styles from './SkinAnalysisDashboard.module.css';

export default function SkinAnalysisDashboard({ messages }) {
  const [isOpen, setIsOpen] = useState(false);
  const [skinData, setSkinData] = useState({
    hydration: 72,
    texture: 85,
    clarity: 68,
    firmness: 78,
    radiance: 80,
    evenTone: 75,
  });

  const [progressHistory, setProgressHistory] = useState([
    { date: 'Week 1', score: 65 },
    { date: 'Week 2', score: 70 },
    { date: 'Week 3', score: 73 },
    { date: 'Week 4', score: 76 },
  ]);

  const calculateOverallScore = () => {
    const values = Object.values(skinData);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#d4af37';
    return '#ef4444';
  };

  const recommendations = [
    {
      icon: '💧',
      title: 'Increase Hydration',
      description: 'Add a hyaluronic acid serum to boost moisture levels',
      priority: 'high',
    },
    {
      icon: '🌿',
      title: 'Antioxidant Protection',
      description: 'Use vitamin C serum in the morning for radiance',
      priority: 'medium',
    },
    {
      icon: '🌙',
      title: 'Nighttime Recovery',
      description: 'Apply retinol 3x per week for skin renewal',
      priority: 'high',
    },
    {
      icon: '☀️',
      title: 'SPF Daily',
      description: 'Never skip sunscreen to prevent further damage',
      priority: 'critical',
    },
  ];

  const skinTypes = {
    dominant: 'Combination',
    concerns: ['Dehydration', 'Uneven Texture', 'Minor Redness'],
  };

  return (
    <>
      <button className={styles.floatingButton} onClick={() => setIsOpen(true)}>
        <span className={styles.buttonIcon}>📊</span>
        <span className={styles.buttonText}>Skin Analysis</span>
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.dashboard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
              ✕
            </button>

            <div className={styles.header}>
              <h2>📊 Your Skin Analysis Dashboard</h2>
              <p>AI-Powered Skin Health Tracking</p>
            </div>

            <div className={styles.content}>
              {/* Overall Score */}
              <div className={styles.overallScore}>
                <div className={styles.scoreCircle}>
                  <svg viewBox="0 0 100 100" className={styles.progressRing}>
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={getScoreColor(calculateOverallScore())}
                      strokeWidth="8"
                      strokeDasharray={`${calculateOverallScore() * 2.827} 283`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                      className={styles.progressCircle}
                    />
                  </svg>
                  <div className={styles.scoreValue}>
                    <span className={styles.scoreNumber}>{calculateOverallScore()}</span>
                    <span className={styles.scoreLabel}>Skin Score</span>
                  </div>
                </div>
                <div className={styles.scoreInfo}>
                  <h3>Excellent Progress! 🎉</h3>
                  <p>Your skin health has improved by 15% this month</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className={styles.metricsGrid}>
                {Object.entries(skinData).map(([key, value]) => (
                  <div key={key} className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricName}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </span>
                      <span 
                        className={styles.metricValue}
                        style={{ color: getScoreColor(value) }}
                      >
                        {value}%
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${value}%`,
                          background: `linear-gradient(90deg, ${getScoreColor(value)}, ${getScoreColor(value)}aa)`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skin Type Info */}
              <div className={styles.skinTypeSection}>
                <h3>🔬 Skin Analysis</h3>
                <div className={styles.skinTypeCard}>
                  <div className={styles.skinType}>
                    <strong>Skin Type:</strong> {skinTypes.dominant}
                  </div>
                  <div className={styles.concerns}>
                    <strong>Key Concerns:</strong>
                    <div className={styles.concernTags}>
                      {skinTypes.concerns.map((concern, idx) => (
                        <span key={idx} className={styles.concernTag}>
                          {concern}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Chart */}
              <div className={styles.progressSection}>
                <h3>📈 4-Week Progress Tracker</h3>
                <div className={styles.chart}>
                  {progressHistory.map((week, idx) => (
                    <div key={idx} className={styles.chartBar}>
                      <div 
                        className={styles.bar}
                        style={{ 
                          height: `${week.score}%`,
                          background: `linear-gradient(180deg, ${getScoreColor(week.score)}, ${getScoreColor(week.score)}aa)`
                        }}
                      >
                        <span className={styles.barValue}>{week.score}</span>
                      </div>
                      <span className={styles.barLabel}>{week.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className={styles.recommendationsSection}>
                <h3>💡 Personalized Recommendations</h3>
                <div className={styles.recommendations}>
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className={`${styles.recommendationCard} ${styles[rec.priority]}`}>
                      <span className={styles.recIcon}>{rec.icon}</span>
                      <div className={styles.recContent}>
                        <h4>{rec.title}</h4>
                        <p>{rec.description}</p>
                      </div>
                      <span className={styles.priorityBadge}>{rec.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Upgrade */}
              <div className={styles.premiumSection}>
                <div className={styles.premiumCard}>
                  <span className={styles.premiumIcon}>👑</span>
                  <div className={styles.premiumContent}>
                    <h3>Unlock Premium Analytics</h3>
                    <p>Get detailed reports, trend predictions, and personalized product matching</p>
                  </div>
                  <button className={styles.upgradeButton}>
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
