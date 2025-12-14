/**
 * 3D Experience Page
 * Showcases mind-blowing 3D features: Virtual Try-On and Product Viewer
 */

import React, { useState } from 'react';
import VirtualTryOn3D from './VirtualTryOn3D';
import ProductViewer3D from './ProductViewer3D';
import styles from './Experience3D.module.css';

const Experience3D = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('tryon'); // 'tryon' | 'products'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [makeupProducts, setMakeupProducts] = useState(null);

  // Sample products for demo
  const sampleProducts = {
    skincare: [
      {
        product: 'Vitamin C Brightening Serum',
        brand: 'The Ordinary',
        price: '$49',
        keyIngredients: ['Vitamin C', 'Hyaluronic Acid', 'Ferulic Acid'],
        benefits: 'Brightens skin tone, reduces dark spots, and provides antioxidant protection'
      },
      {
        product: 'Advanced Night Repair',
        brand: 'Estée Lauder',
        price: '$89',
        keyIngredients: ['Chronolux™ Power Signal', 'Hyaluronic Acid', 'Bifida Ferment'],
        benefits: 'Repairs and renews skin overnight, reduces fine lines, and boosts radiance'
      },
      {
        product: 'Ultra Facial Cream',
        brand: "Kiehl's",
        price: '$32',
        keyIngredients: ['Squalane', 'Glacial Glycoprotein', 'Desert Plant Extract'],
        benefits: 'Provides 24-hour hydration and strengthens skin barrier'
      }
    ],
    makeup: [
      {
        product: 'Ruby Woo Lipstick',
        brand: 'MAC',
        price: '$19',
        category: 'lipstick',
        keyIngredients: ['Matte Finish', 'Long-wearing', 'Classic Red'],
        benefits: 'Iconic blue-red shade that flatters all skin tones with matte finish'
      },
      {
        product: 'Naked3 Eyeshadow Palette',
        brand: 'Urban Decay',
        price: '$54',
        category: 'eyeshadow',
        keyIngredients: ['Rose Gold Tones', 'Shimmer & Matte', '12 Shades'],
        benefits: 'Romantic rose-hued neutrals perfect for everyday to evening looks'
      },
      {
        product: 'NARS Orgasm Blush',
        brand: 'NARS',
        price: '$30',
        category: 'blush',
        keyIngredients: ['Golden Pink', 'Shimmer', 'Buildable'],
        benefits: 'Universal peachy-pink with golden shimmer for a natural flush'
      }
    ]
  };

  const handleApplyMakeup = () => {
    // Apply sample makeup for demo
    const demoMakeup = {
      lipstick: {
        product: 'Ruby Woo Lipstick',
        brand: 'MAC',
        category: 'lipstick',
        finish: 'matte'
      },
      eyeshadow: {
        product: 'Naked3 Palette',
        brand: 'Urban Decay',
        category: 'eyeshadow'
      },
      blush: {
        product: 'Orgasm Blush',
        brand: 'NARS',
        category: 'blush'
      }
    };
    setMakeupProducts(demoMakeup);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>

        <div className={styles.header}>
          <h1>✨ 3D Experience</h1>
          <p>Mind-blowing 3D visualization and real-time virtual try-on</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'tryon' ? styles.active : ''}`}
            onClick={() => setActiveTab('tryon')}
          >
            🎭 Virtual Try-On 3D
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 3D Product Viewer
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'tryon' && (
            <div className={styles.tryonSection}>
              <div className={styles.infoCard}>
                <h3>🎭 Real-Time 3D Virtual Try-On</h3>
                <p>
                  Experience cutting-edge face tracking technology powered by MediaPipe and Three.js.
                  See makeup products rendered in real-time 3D with realistic materials and lighting.
                </p>
                <div className={styles.features}>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>📸</span>
                    <span>468 Facial Landmarks</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>✨</span>
                    <span>PBR Materials</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>🎨</span>
                    <span>Real-time 3D Overlay</span>
                  </div>
                </div>
                <button className={styles.demoButton} onClick={handleApplyMakeup}>
                  Apply Demo Makeup
                </button>
              </div>

              <VirtualTryOn3D
                makeupProducts={makeupProducts}
                onCapture={(screenshot) => {
                  console.log('Captured screenshot:', screenshot);
                  // Could save to state or download
                }}
              />
            </div>
          )}

          {activeTab === 'products' && (
            <div className={styles.productsSection}>
              <div className={styles.productGrid}>
                <div className={styles.productList}>
                  <h3>Skincare Products</h3>
                  {sampleProducts.skincare.map((product, idx) => (
                    <button
                      key={idx}
                      className={`${styles.productCard} ${
                        selectedProduct === product ? styles.selected : ''
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className={styles.productHeader}>
                        <strong>{product.product}</strong>
                        <span className={styles.price}>{product.price}</span>
                      </div>
                      <p className={styles.brand}>{product.brand}</p>
                    </button>
                  ))}

                  <h3 style={{ marginTop: '24px' }}>Makeup Products</h3>
                  {sampleProducts.makeup.map((product, idx) => (
                    <button
                      key={idx}
                      className={`${styles.productCard} ${
                        selectedProduct === product ? styles.selected : ''
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className={styles.productHeader}>
                        <strong>{product.product}</strong>
                        <span className={styles.price}>{product.price}</span>
                      </div>
                      <p className={styles.brand}>{product.brand}</p>
                    </button>
                  ))}
                </div>

                <div className={styles.viewer}>
                  {selectedProduct ? (
                    <ProductViewer3D
                      product={selectedProduct}
                      productCategory={
                        sampleProducts.skincare.includes(selectedProduct)
                          ? 'skincare'
                          : 'makeup'
                      }
                    />
                  ) : (
                    <div className={styles.placeholder}>
                      <div className={styles.placeholderIcon}>📦</div>
                      <p>Select a product to view in 3D</p>
                      <p className={styles.placeholderHint}>
                        Click any product on the left to see an interactive 3D model
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p>
            Powered by <strong>Three.js</strong>, <strong>MediaPipe</strong>, and{' '}
            <strong>Gemini AI</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Experience3D;
