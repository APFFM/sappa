/**
 * 3D Virtual Try-On Component
 * Camera capture + Product selection + 3D rotating face with makeup
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { generateMakeupProductResults } from '../../services/virtualTryOnService';
import styles from './VirtualTryOn3D.module.css';

const VirtualTryOn3D = ({ makeupProducts: initialMakeupProducts, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const viewer3DRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scene, setScene] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({
    lipstick: null,
    eyeshadow: null,
    blush: null,
    foundation: null
  });

  // Available products database
  const availableProducts = {
    lipstick: [
      { id: 1, name: 'Ruby Woo', brand: 'MAC', color: '#990000', finish: 'matte' },
      { id: 2, name: 'Pink Sugar', brand: 'Fresh', color: '#FF69B4', finish: 'glossy' },
      { id: 3, name: 'Nude Bliss', brand: 'Charlotte Tilbury', color: '#D4A59A', finish: 'satin' },
      { id: 4, name: 'Coral Crush', brand: 'NARS', color: '#FF7F50', finish: 'matte' },
      { id: 5, name: 'Berry Bold', brand: 'Urban Decay', color: '#8B0040', finish: 'cream' }
    ],
    eyeshadow: [
      { id: 1, name: 'Naked Basics', brand: 'Urban Decay', colors: ['#D4A59A', '#C19A6B', '#8B7355'] },
      { id: 2, name: 'Rose Gold', brand: 'Huda Beauty', colors: ['#D4A373', '#CD853F', '#8B4513'] },
      { id: 3, name: 'Smokey Eyes', brand: 'MAC', colors: ['#696969', '#404040', '#1A1A1A'] },
      { id: 4, name: 'Purple Haze', brand: 'Anastasia', colors: ['#E0B0FF', '#9370DB', '#4B0082'] },
      { id: 5, name: 'Golden Hour', brand: 'Pat McGrath', colors: ['#FFD700', '#DAA520', '#B8860B'] }
    ],
    blush: [
      { id: 1, name: 'Orgasm', brand: 'NARS', color: '#FF7F7F' },
      { id: 2, name: 'Peachy Keen', brand: 'Benefit', color: '#FFCBA4' },
      { id: 3, name: 'Rose Glow', brand: 'Glossier', color: '#FF007F' },
      { id: 4, name: 'Coral Pop', brand: 'Clinique', color: '#FF6B6B' },
      { id: 5, name: 'Berry Flush', brand: 'Tarte', color: '#C71585' }
    ],
    foundation: [
      { id: 1, name: 'Fair Porcelain', brand: 'Fenty Beauty', color: '#F5E6D3' },
      { id: 2, name: 'Light Beige', brand: 'Estée Lauder', color: '#E8D0B3' },
      { id: 3, name: 'Medium Tan', brand: 'MAC', color: '#DDB892' },
      { id: 4, name: 'Caramel', brand: 'NARS', color: '#C68642' },
      { id: 5, name: 'Deep Espresso', brand: 'Fenty Beauty', color: '#8D5524' }
    ]
  };

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setIsStreaming(true);
          };
        }
      } catch (err) {
        console.error('Failed to access camera:', err);
        setError('Failed to access camera. Please allow camera permissions.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (tryOnResult && viewer3DRef.current) {
      initialize3DViewer();
    }

    return () => {
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [tryOnResult]);

  const initialize3DViewer = () => {
    if (!viewer3DRef.current || !tryOnResult) return;

    // Clear previous scene
    while (viewer3DRef.current.firstChild) {
      viewer3DRef.current.removeChild(viewer3DRef.current.firstChild);
    }

    // Create scene
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      viewer3DRef.current.clientWidth / viewer3DRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2;

    // Create renderer
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.setSize(viewer3DRef.current.clientWidth, viewer3DRef.current.clientHeight);
    viewer3DRef.current.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    newScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 1, 1);
    newScene.add(directionalLight);

    // Create 3D face plane with the result image
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(tryOnResult.imageUrl, (texture) => {
      // Create slightly curved geometry for more realistic 3D effect
      const geometry = new THREE.PlaneGeometry(1.5, 2, 32, 32);

      // Apply slight curve to make it look more like a face
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = Math.sin(x * 1.5) * 0.2 - Math.abs(x) * 0.15; // Curved effect
        positions.setZ(i, z);
      }
      geometry.computeVertexNormals();

      const material = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        shininess: 30
      });

      const faceMesh = new THREE.Mesh(geometry, material);
      newScene.add(faceMesh);

      // Animation loop
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let rotation = { x: 0, y: 0 };

      const onMouseDown = (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e) => {
        if (isDragging) {
          const deltaX = e.clientX - previousMousePosition.x;
          const deltaY = e.clientY - previousMousePosition.y;

          rotation.y += deltaX * 0.01;
          rotation.x += deltaY * 0.01;

          // Limit vertical rotation
          rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, rotation.x));

          previousMousePosition = { x: e.clientX, y: e.clientY };
        }
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const onTouchStart = (e) => {
        isDragging = true;
        const touch = e.touches[0];
        previousMousePosition = { x: touch.clientX, y: touch.clientY };
      };

      const onTouchMove = (e) => {
        if (isDragging && e.touches.length > 0) {
          const touch = e.touches[0];
          const deltaX = touch.clientX - previousMousePosition.x;
          const deltaY = touch.clientY - previousMousePosition.y;

          rotation.y += deltaX * 0.01;
          rotation.x += deltaY * 0.01;

          rotation.x = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, rotation.x));

          previousMousePosition = { x: touch.clientX, y: touch.clientY };
        }
      };

      const onTouchEnd = () => {
        isDragging = false;
      };

      viewer3DRef.current.addEventListener('mousedown', onMouseDown);
      viewer3DRef.current.addEventListener('mousemove', onMouseMove);
      viewer3DRef.current.addEventListener('mouseup', onMouseUp);
      viewer3DRef.current.addEventListener('mouseleave', onMouseUp);
      viewer3DRef.current.addEventListener('touchstart', onTouchStart);
      viewer3DRef.current.addEventListener('touchmove', onTouchMove);
      viewer3DRef.current.addEventListener('touchend', onTouchEnd);

      const animate = () => {
        requestAnimationFrame(animate);

        faceMesh.rotation.y = rotation.y;
        faceMesh.rotation.x = rotation.x;

        newRenderer.render(newScene, camera);
      };

      animate();
    });

    setScene(newScene);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.95);
    return imageData;
  };

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      setCapturedImage(photo);
      setTryOnResult(null);

      if (onCapture) {
        onCapture(photo);
      }
    }
  };

  const handleProductSelect = (category, product) => {
    setSelectedProducts(prev => ({
      ...prev,
      [category]: prev[category]?.id === product.id ? null : product
    }));
  };

  const handleTryOn = async () => {
    if (!capturedImage) {
      setError('Please capture a photo first');
      return;
    }

    const hasProducts = Object.values(selectedProducts).some(p => p !== null);
    if (!hasProducts) {
      setError('Please select at least one product');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert selected products to the format expected by the API
      const makeupProductsForAPI = {};

      if (selectedProducts.lipstick) {
        makeupProductsForAPI.lipstick = {
          product: selectedProducts.lipstick.name,
          brand: selectedProducts.lipstick.brand,
          category: 'lipstick',
          finish: selectedProducts.lipstick.finish
        };
      }

      if (selectedProducts.eyeshadow) {
        makeupProductsForAPI.eyeshadow = {
          product: selectedProducts.eyeshadow.name,
          brand: selectedProducts.eyeshadow.brand,
          category: 'eyeshadow'
        };
      }

      if (selectedProducts.blush) {
        makeupProductsForAPI.blush = {
          product: selectedProducts.blush.name,
          brand: selectedProducts.blush.brand,
          category: 'blush'
        };
      }

      if (selectedProducts.foundation) {
        makeupProductsForAPI.foundation = {
          product: selectedProducts.foundation.name,
          brand: selectedProducts.foundation.brand,
          category: 'foundation'
        };
      }

      const makeupLook = {
        occasion: 'everyday',
        personality: 'natural'
      };

      const result = await generateMakeupProductResults(
        capturedImage,
        makeupProductsForAPI,
        makeupLook
      );

      setTryOnResult(result);
    } catch (err) {
      console.error('Virtual try-on failed:', err);
      setError(err.message || 'Failed to generate virtual try-on. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setTryOnResult(null);
    setError(null);
    setSelectedProducts({
      lipstick: null,
      eyeshadow: null,
      blush: null,
      foundation: null
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Left Side - Camera */}
        <div className={styles.cameraSection}>
          <h3>📸 Camera</h3>
          <div className={styles.videoContainer}>
            <video
              ref={videoRef}
              className={styles.video}
              autoPlay
              playsInline
              muted
              style={{ display: capturedImage ? 'none' : 'block' }}
            />
            <canvas
              ref={canvasRef}
              className={styles.canvas}
              style={{ display: 'none' }}
            />

            {capturedImage && !tryOnResult && (
              <img
                src={capturedImage}
                alt="Captured"
                className={styles.capturedImage}
              />
            )}

            {!isStreaming && !error && (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Starting camera...</p>
              </div>
            )}

            {error && (
              <div className={styles.errorOverlay}>
                <p>⚠️ {error}</p>
              </div>
            )}
          </div>

          <div className={styles.controls}>
            {!capturedImage ? (
              <button
                onClick={handleCapture}
                className={styles.captureButton}
                disabled={!isStreaming}
              >
                📸 Capture Photo
              </button>
            ) : (
              <button onClick={handleReset} className={styles.resetButton}>
                🔄 Retake Photo
              </button>
            )}
          </div>

          {/* Product Selection */}
          {capturedImage && !tryOnResult && (
            <div className={styles.productSelection}>
              <h4>💄 Select Products to Try On</h4>

              {Object.entries(availableProducts).map(([category, products]) => (
                <div key={category} className={styles.productCategory}>
                  <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                  <div className={styles.productGrid}>
                    {products.map(product => (
                      <button
                        key={product.id}
                        className={`${styles.productButton} ${
                          selectedProducts[category]?.id === product.id ? styles.selected : ''
                        }`}
                        onClick={() => handleProductSelect(category, product)}
                      >
                        <div
                          className={styles.colorSwatch}
                          style={{
                            background: category === 'eyeshadow'
                              ? `linear-gradient(135deg, ${product.colors[0]}, ${product.colors[2]})`
                              : product.color
                          }}
                        />
                        <div className={styles.productInfo}>
                          <strong>{product.name}</strong>
                          <span>{product.brand}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={handleTryOn}
                className={styles.applyButton}
                disabled={!Object.values(selectedProducts).some(p => p !== null)}
              >
                ✨ Apply Makeup
              </button>
            </div>
          )}
        </div>

        {/* Right Side - 3D Result */}
        <div className={styles.resultSection}>
          <h3>✨ 3D Virtual Try-On</h3>

          {!tryOnResult && !isProcessing && (
            <div className={styles.resultContainer}>
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>💄</div>
                <p>Select products and apply makeup</p>
                <p className={styles.hint}>
                  Choose your favorite products and see them on your face in 3D!
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className={styles.resultContainer}>
              <div className={styles.processing}>
                <div className={styles.spinner}></div>
                <p>Generating your virtual try-on...</p>
                <p className={styles.hint}>AI is applying your selected makeup...</p>
              </div>
            </div>
          )}

          {tryOnResult && (
            <>
              <div
                ref={viewer3DRef}
                className={styles.viewer3D}
              />
              <div className={styles.viewerControls}>
                <p className={styles.viewerHint}>
                  🖱️ Drag to rotate • 📱 Swipe to turn
                </p>
              </div>
              <div className={styles.resultInfo}>
                <h4>Applied Products:</h4>
                <ul className={styles.appliedProducts}>
                  {selectedProducts.lipstick && (
                    <li>💋 {selectedProducts.lipstick.brand} {selectedProducts.lipstick.name}</li>
                  )}
                  {selectedProducts.eyeshadow && (
                    <li>👁️ {selectedProducts.eyeshadow.brand} {selectedProducts.eyeshadow.name}</li>
                  )}
                  {selectedProducts.blush && (
                    <li>✨ {selectedProducts.blush.brand} {selectedProducts.blush.name}</li>
                  )}
                  {selectedProducts.foundation && (
                    <li>🎨 {selectedProducts.foundation.brand} {selectedProducts.foundation.name}</li>
                  )}
                </ul>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = tryOnResult.imageUrl;
                    link.download = 'virtual-tryon-3d.png';
                    link.click();
                  }}
                  className={styles.downloadButton}
                >
                  💾 Download Result
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn3D;
