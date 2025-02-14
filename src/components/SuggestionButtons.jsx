import styles from './SuggestionButtons.module.css';

const suggestions = {
  'skin-concerns': [
    '🔍 Analyze my skin concerns',
    '💆‍♀️ Recommend a daily routine',
    '🧴 Product recommendations',
  ],
  'specific-issues': [
    '😊 How to treat acne',
    '✨ Anti-aging tips',
    '💧 Help with dry skin',
    '🌟 Reduce dark spots'
  ]
};

export default function SuggestionButtons({ onSelect, currentContext }) {
  return (
    <div className={styles.container}>
      <div className={styles.group}>
        {suggestions[currentContext || 'skin-concerns'].map((text, index) => (
          <button
            key={index}
            onClick={() => onSelect(text)}
            className={styles.button}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
