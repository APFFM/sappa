import { useState } from 'react';
import styles from './MobileNav.module.css';

export default function MobileNav({ onOpenGuide, onOpenProducts }) {
  const [activeTab, setActiveTab] = useState('chat');

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'guide') {
      onOpenGuide();
    } else if (tab === 'products') {
      onOpenProducts();
    }
  };

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      <button
        className={`${styles.navItem} ${activeTab === 'guide' ? styles.active : ''}`}
        onClick={() => handleTabClick('guide')}
        aria-label="Open welcome guide"
      >
        <span className={styles.icon} role="img" aria-hidden="true">✨</span>
        <span className={styles.label}>Guide</span>
      </button>
      
      <button
        className={`${styles.navItem} ${activeTab === 'chat' ? styles.active : ''}`}
        onClick={() => handleTabClick('chat')}
        aria-label="Chat"
      >
        <span className={styles.icon} role="img" aria-hidden="true">💬</span>
        <span className={styles.label}>Chat</span>
      </button>
      
      <button
        className={`${styles.navItem} ${activeTab === 'products' ? styles.active : ''}`}
        onClick={() => handleTabClick('products')}
        aria-label="Open product recommendations"
      >
        <span className={styles.icon} role="img" aria-hidden="true">🛍️</span>
        <span className={styles.label}>Products</span>
      </button>
    </nav>
  );
}
