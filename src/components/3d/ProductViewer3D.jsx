/**
 * 3D Product Viewer Component
 * Interactive 3D visualization of skincare and makeup products
 */

import React, { useEffect, useRef, useState } from 'react';
import SceneManager from '../../services/threejs/sceneManager';
import ProductRenderer3D from '../../services/threejs/productRenderer3D';
import styles from './ProductViewer3D.module.css';

const ProductViewer3D = ({ product, productCategory }) => {
  const canvasRef = useRef(null);
  const [sceneManager, setSceneManager] = useState(null);
  const [productRenderer, setProductRenderer] = useState(null);
  const [currentProduct3D, setCurrentProduct3D] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize scene
    const sm = new SceneManager();
    sm.initialize(canvasRef.current, 800, 600);

    const pr = new ProductRenderer3D(sm.scene, sm.camera);
    setSceneManager(sm);
    setProductRenderer(pr);

    // Set initial camera position
    sm.camera.position.set(0, 0, 3);
    sm.camera.lookAt(0, 0, 0);

    // Start rendering
    sm.startRendering();

    return () => {
      sm.dispose();
    };
  }, []);

  useEffect(() => {
    if (productRenderer && product) {
      loadProduct();
    }
  }, [product, productRenderer]);

  useEffect(() => {
    if (sceneManager && currentProduct3D && isRotating && !isDragging) {
      sceneManager.onRender(() => {
        productRenderer.autoRotateProduct(currentProduct3D, 0.01);
      });
    }
  }, [isRotating, isDragging, currentProduct3D]);

  const loadProduct = () => {
    if (!productRenderer || !product) return;

    // Remove existing product
    if (currentProduct3D) {
      productRenderer.removeProduct(currentProduct3D);
    }

    // Determine product type from category
    const productType = determineProductType(productCategory, product);

    // Get product color
    const color = getProductColor(product, productCategory);

    // Create 3D model
    let product3D;
    if (productCategory === 'skincare') {
      product3D = productRenderer.createSkincareProduct(productType, color, 1.2);
    } else {
      product3D = productRenderer.createMakeupProduct(productType, color, 1.2);
    }

    // Add to scene
    productRenderer.addProduct(product3D, { x: 0, y: 0, z: 0 });
    setCurrentProduct3D(product3D);
  };

  const determineProductType = (category, product) => {
    const productName = product.product?.toLowerCase() || product.stepName?.toLowerCase() || '';

    if (category === 'skincare') {
      if (productName.includes('serum') || productName.includes('essence')) return 'serum';
      if (productName.includes('cleanser') || productName.includes('wash')) return 'cleanser';
      if (productName.includes('moisturizer') || productName.includes('cream')) return 'moisturizer';
      if (productName.includes('night') || productName.includes('sleeping')) return 'night_cream';
      if (productName.includes('sunscreen') || productName.includes('spf')) return 'sunscreen';
      return 'serum'; // Default
    } else {
      if (productName.includes('lipstick') || productName.includes('lip')) return 'lipstick';
      if (productName.includes('eyeshadow') || productName.includes('palette')) return 'eyeshadow_palette';
      if (productName.includes('foundation')) return 'foundation';
      if (productName.includes('concealer')) return 'concealer';
      if (productName.includes('blush')) return 'blush';
      if (productName.includes('bronzer')) return 'bronzer';
      return 'foundation'; // Default
    }
  };

  const getProductColor = (product, category) => {
    if (category === 'skincare') {
      // Skincare colors based on product type
      const productName = product.product?.toLowerCase() || '';
      if (productName.includes('vitamin c') || productName.includes('brightening')) return 0xffa500;
      if (productName.includes('retinol') || productName.includes('night')) return 0x8b4789;
      if (productName.includes('hyaluronic') || productName.includes('hydra')) return 0x4da6ff;
      if (productName.includes('niacinamide')) return 0xffffff;
      return 0x667eea; // Default purple-blue
    } else {
      // Makeup colors
      const productName = product.product?.toLowerCase() || '';

      // Lipstick colors
      if (productName.includes('red')) return 0xff0000;
      if (productName.includes('pink') || productName.includes('rose')) return 0xff69b4;
      if (productName.includes('nude') || productName.includes('neutral')) return 0xd4a59a;
      if (productName.includes('coral')) return 0xff7f50;
      if (productName.includes('berry') || productName.includes('plum')) return 0x8b0040;
      if (productName.includes('peach')) return 0xffcba4;

      // Foundation colors
      if (productName.includes('light')) return 0xf5e6d3;
      if (productName.includes('medium')) return 0xddb892;
      if (productName.includes('tan') || productName.includes('deep')) return 0xa67c52;
      if (productName.includes('dark')) return 0x6b4423;

      // Blush/bronzer colors
      if (productName.includes('blush')) return 0xff9999;
      if (productName.includes('bronzer')) return 0xcd853f;

      return 0xff6b9d; // Default pink
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setIsRotating(false);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !currentProduct3D || !productRenderer) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    productRenderer.rotateProduct(currentProduct3D, deltaX, deltaY);

    dragStart.current = {
      x: e.clientX,
      y: e.clientY
    };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsRotating(true), 1000);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setTimeout(() => setIsRotating(true), 1000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.viewerContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        />

        <div className={styles.controls}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={styles.controlButton}
          >
            {isRotating ? '⏸️ Pause' : '▶️ Rotate'}
          </button>
          <button
            onClick={loadProduct}
            className={styles.controlButton}
          >
            🔄 Reset View
          </button>
        </div>

        <div className={styles.instructions}>
          <p>🖱️ Drag to rotate • 🔄 Auto-rotation active</p>
        </div>
      </div>

      <div className={styles.productInfo}>
        <h3>{product.product || 'Product'}</h3>
        <p className={styles.brand}>{product.brand || 'Brand'}</p>
        <p className={styles.price}>{product.price || '$0'}</p>

        {product.keyIngredients && (
          <div className={styles.ingredients}>
            <strong>Key Ingredients:</strong>
            <div className={styles.ingredientTags}>
              {product.keyIngredients.map((ingredient, idx) => (
                <span key={idx} className={styles.tag}>
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}

        {product.benefits && (
          <div className={styles.benefits}>
            <strong>Benefits:</strong>
            <p>{product.benefits}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductViewer3D;
