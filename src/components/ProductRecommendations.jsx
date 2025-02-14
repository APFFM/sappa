import { useEffect, useState } from 'react';
import styles from './ProductRecommendations.module.css';

const PRODUCT_DATABASE = {
  'acne': [
    {
      name: "Paula's Choice 2% BHA Liquid Exfoliant",
      description: "Salicylic acid treatment for acne and blackheads",
      link: "https://www.amazon.com/Paulas-Choice-SKIN-PERFECTING-Exfoliant-Facial-Blackheads/dp/B00949CTQQ/",
      price: "$32"
    },
    {
      name: "La Roche-Posay Effaclar Duo",
      description: "Dual action acne treatment",
      link: "https://www.amazon.com/Roche-Posay-Effaclar-Treatment-Benzoyl-Peroxide/dp/B00XWRS5HM/",
      price: "$30"
    }
  ],
  'aging': [
    {
      name: "The Ordinary Retinol 1%",
      description: "Anti-aging retinol serum",
      link: "https://www.amazon.com/Ordinary-Retinol-1-Squalane-30ml/dp/B07L8QJZZJ/",
      price: "$8"
    },
    {
      name: "Neutrogena Rapid Wrinkle Repair",
      description: "Retinol anti-wrinkle cream",
      link: "https://www.amazon.com/Neutrogena-Wrinkle-Retinol-Anti-Wrinkle-Regenerating/dp/B004D2C57M/",
      price: "$25"
    }
  ],
  'dry skin': [
    {
      name: "CeraVe Moisturizing Cream",
      description: "Rich moisturizer for dry to very dry skin",
      link: "https://www.amazon.com/CeraVe-Moisturizing-Cream-Daily-Face/dp/B00TTD9BRC/",
      price: "$16"
    },
    {
      name: "First Aid Beauty Ultra Repair Cream",
      description: "Intense hydration for dry skin",
      link: "https://www.amazon.com/First-Aid-Beauty-Ultra-Repair/dp/B0065I0UMO/",
      price: "$38"
    }
  ],
  'oily skin': [
    {
      name: "The Ordinary Niacinamide 10% + Zinc 1%",
      description: "Oil control and pore-refining serum",
      link: "https://www.amazon.com/Ordinary-Niacinamide-10-Zinc-30ml/dp/B06VSX2B1R/",
      price: "$6"
    }
  ],
  'sensitive': [
    {
      name: "Avène Thermal Spring Water",
      description: "Soothing facial mist for sensitive skin",
      link: "https://www.amazon.com/Eau-Thermale-Avène-Thermal-Spring/dp/B002D48QRK/",
      price: "$14"
    }
  ],
  'skincare': [
    {
      name: "CeraVe Daily Moisturizing Lotion",
      description: "Basic moisturizer for all skin types",
      link: "https://www.amazon.com/CeraVe-Moisturizing-Moisturizer-Lightweight-Fragrance/dp/B000YJ2SLG/",
      price: "$15"
    },
    {
      name: "Neutrogena Hydro Boost",
      description: "Hydrating gel moisturizer",
      link: "https://www.amazon.com/Neutrogena-Hydro-Hyaluronic-Hydrating-Moisturizer/dp/B00NR1YQK4/",
      price: "$20"
    }
  ],
  'spf': [
    {
      name: "La Roche-Posay Anthelios Melt-In Sunscreen SPF 60",
      description: "Lightweight daily sun protection",
      link: "https://www.amazon.com/Roche-Posay-Anthelios-Sunscreen-Oxybenzone-Free/dp/B002CML1XE/",
      price: "$25"
    },
    {
      name: "EltaMD UV Clear Facial Sunscreen SPF 46",
      description: "Oil-free facial sunscreen",
      link: "https://www.amazon.com/EltaMD-Clear-Facial-Sunscreen-Broad-Spectrum/dp/B002MSN3QQ/",
      price: "$37"
    }
  ],
  'cleanser': [
    {
      name: "CeraVe Hydrating Facial Cleanser",
      description: "Gentle daily cleanser for normal to dry skin",
      link: "https://www.amazon.com/CeraVe-Hydrating-Facial-Cleanser-Fragrance/dp/B01MSSDEPK/",
      price: "$16"
    },
    {
      name: "Vanicream Gentle Facial Cleanser",
      description: "Extra gentle cleanser for sensitive skin",
      link: "https://www.amazon.com/Vanicream-Gentle-Cleanser-sensitive-Dispenser/dp/B00QY1XZ4W/",
      price: "$12"
    }
  ]
};

// Keyword mapping for better matches
const KEYWORD_MAPPING = {
  'wrinkle': 'aging',
  'fine lines': 'aging',
  'mature': 'aging',
  'breakout': 'acne',
  'pimple': 'acne',
  'blemish': 'acne',
  'dehydrated': 'dry skin',
  'moisture': 'hydration',
  'hydrate': 'hydration',
  'pigmentation': 'dark spots',
  'uneven': 'dark spots',
  'sensitive': 'sensitive',
  'irritated': 'sensitive',
  'oily': 'oily skin',
  'greasy': 'oily skin',
  'shine': 'oily skin'
};

// Add more common words that should trigger recommendations
const COMMON_TRIGGERS = {
  'moisturize': 'skincare',
  'dry': 'hydration',
  'sunscreen': 'spf',
  'protection': 'spf',
  'wash': 'cleanser',
  'clean': 'cleanser',
  'wrinkle': 'aging',
  'line': 'aging',
  'pimple': 'acne',
  'breakout': 'acne',
  'spot': 'acne',
  'oily': 'serum',
  'hydrating': 'hydration',
  'moisture': 'hydration'
};

export default function ProductRecommendations({ messages }) {
  const [recommendations, setRecommendations] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      const contentLower = lastMessage.content.toLowerCase();
      let foundProducts = new Set();
      
      // Direct matching from content
      Object.keys(PRODUCT_DATABASE).forEach(category => {
        if (contentLower.includes(category.toLowerCase())) {
          PRODUCT_DATABASE[category].forEach(product => {
            foundProducts.add(product);
          });
        }
      });

      // Always add some basic products if none found
      if (foundProducts.size === 0) {
        foundProducts = new Set(PRODUCT_DATABASE['skincare']);
      }

      const finalRecs = Array.from(foundProducts).slice(0, 5);
      console.log('Setting recommendations:', finalRecs);
      setRecommendations(finalRecs);
      setDebugInfo(`Found ${finalRecs.length} matching products`);
    }
  }, [messages]);

  return (
    <div className={styles.recommendations}>
      <h3>💫 Recommended Products</h3>
      {recommendations && recommendations.length > 0 ? (
        <>
          <ul>
            {recommendations.map((product, index) => (
              <li key={index} className={styles.productItem}>
                <a href={product.link} target="_blank" rel="noopener noreferrer">
                  <div className={styles.productCard}>
                    <strong className={styles.productName}>
                      {product.name}
                    </strong>
                    <p className={styles.productDesc}>
                      {product.description}
                    </p>
                    <span className={styles.productPrice}>
                      {product.price}
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
          <small className={styles.debug}>{debugInfo}</small>
        </>
      ) : (
        <div className={styles.empty}>
          <p>Loading recommendations...</p>
        </div>
      )}
      <div className={styles.disclaimer}>
        * Prices are approximate. Click to view current prices on official websites.
      </div>
    </div>
  );
}
