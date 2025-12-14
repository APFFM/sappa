/**
 * 3D Virtual Try-On Component
 * Real-time face tracking with 3D makeup overlay
 */

import React, { useEffect, useRef, useState } from 'react';
import faceTrackingService from '../../services/threejs/faceTrackingService';
import SceneManager from '../../services/threejs/sceneManager';
import styles from './VirtualTryOn3D.module.css';

const VirtualTryOn3D = ({ makeupProducts, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [sceneManager, setSceneManager] = useState(null);
  const [makeupOverlays, setMakeupOverlays] = useState({});

  useEffect(() => {
    let mounted = true;

    const initializeTracking = async () => {
      try {
        // Initialize scene manager
        const sm = new SceneManager();
        sm.initialize(overlayCanvasRef.current, 1280, 720);
        sm.startRendering();
        setSceneManager(sm);

        // Initialize face tracking
        await faceTrackingService.initialize(
          videoRef.current,
          canvasRef.current,
          (results) => {
            if (mounted && results.landmarks) {
              updateMakeupOverlays(results.landmarks, sm);
            }
          }
        );

        if (mounted) {
          setIsTracking(true);
        }
      } catch (err) {
        console.error('Failed to initialize tracking:', err);
        if (mounted) {
          setError('Failed to access camera or initialize tracking');
        }
      }
    };

    initializeTracking();

    return () => {
      mounted = false;
      faceTrackingService.stop();
      if (sceneManager) {
        sceneManager.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (isTracking && sceneManager && makeupProducts) {
      applyMakeupProducts();
    }
  }, [makeupProducts, isTracking, sceneManager]);

  const updateMakeupOverlays = (landmarks, sm) => {
    // Get facial feature landmarks
    const features = faceTrackingService.getFeatureLandmarks('all');

    // Extract landmarks for each feature
    const lipLandmarks = {
      upper: features.lips.upper.map(idx => landmarks[idx]),
      lower: features.lips.lower.map(idx => landmarks[idx]),
      inner: features.lips.inner.map(idx => landmarks[idx])
    };

    const leftEyeLandmarks = features.leftEye.map(idx => landmarks[idx]);
    const rightEyeLandmarks = features.rightEye.map(idx => landmarks[idx]);
    const leftCheekLandmarks = features.leftCheek.map(idx => landmarks[idx]);
    const rightCheekLandmarks = features.rightCheek.map(idx => landmarks[idx]);

    // Update makeup overlays (this will be called every frame)
    // We only create new overlays when products change
  };

  const applyMakeupProducts = () => {
    if (!sceneManager) return;

    // Clear existing makeup
    sceneManager.clearMakeup();

    const newOverlays = {};

    // Apply lipstick
    if (makeupProducts.lipstick) {
      const color = parseColorFromProduct(makeupProducts.lipstick);
      const features = faceTrackingService.getFeatureLandmarks('all');

      if (features && faceTrackingService.landmarks) {
        const lipLandmarks = {
          upper: features.lips.upper.map(idx => faceTrackingService.landmarks[idx]),
          lower: features.lips.lower.map(idx => faceTrackingService.landmarks[idx])
        };

        const lipstickOverlay = sceneManager.createLipstickOverlay(
          lipLandmarks,
          color,
          makeupProducts.lipstick.finish || 'glossy'
        );

        sceneManager.addToScene(lipstickOverlay);
        newOverlays.lipstick = lipstickOverlay;
      }
    }

    // Apply eyeshadow
    if (makeupProducts.eyeshadow) {
      const colors = parseEyeshadowColors(makeupProducts.eyeshadow);
      const features = faceTrackingService.getFeatureLandmarks('all');

      if (features && faceTrackingService.landmarks) {
        // Left eye
        const leftEyeLandmarks = features.leftEye.map(idx => faceTrackingService.landmarks[idx]);
        const leftEyeshadow = sceneManager.createEyeshadowOverlay(leftEyeLandmarks, colors);
        sceneManager.addToScene(leftEyeshadow);

        // Right eye
        const rightEyeLandmarks = features.rightEye.map(idx => faceTrackingService.landmarks[idx]);
        const rightEyeshadow = sceneManager.createEyeshadowOverlay(rightEyeLandmarks, colors);
        sceneManager.addToScene(rightEyeshadow);

        newOverlays.eyeshadow = [leftEyeshadow, rightEyeshadow];
      }
    }

    // Apply blush
    if (makeupProducts.blush) {
      const color = parseColorFromProduct(makeupProducts.blush);
      const features = faceTrackingService.getFeatureLandmarks('all');

      if (features && faceTrackingService.landmarks) {
        // Left cheek
        const leftCheekLandmarks = features.leftCheek.map(idx => faceTrackingService.landmarks[idx]);
        const leftBlush = sceneManager.createBlushOverlay(leftCheekLandmarks, color, 0.4);
        sceneManager.addToScene(leftBlush);

        // Right cheek
        const rightCheekLandmarks = features.rightCheek.map(idx => faceTrackingService.landmarks[idx]);
        const rightBlush = sceneManager.createBlushOverlay(rightCheekLandmarks, color, 0.4);
        sceneManager.addToScene(rightBlush);

        newOverlays.blush = [leftBlush, rightBlush];
      }
    }

    setMakeupOverlays(newOverlays);
  };

  const parseColorFromProduct = (product) => {
    // Parse color from product name or use default
    const colorKeywords = {
      red: 0xff0000,
      pink: 0xff69b4,
      nude: 0xd4a59a,
      coral: 0xff7f50,
      berry: 0x8b0040,
      mauve: 0xe0b0ff,
      rose: 0xff007f,
      peach: 0xffcba4,
      brown: 0x8b4513
    };

    const productName = product.product?.toLowerCase() || '';

    for (const [keyword, color] of Object.entries(colorKeywords)) {
      if (productName.includes(keyword)) {
        return color;
      }
    }

    // Default colors by product type
    if (product.category === 'lipstick') return 0xff69b4; // Pink
    if (product.category === 'blush') return 0xff7f7f; // Light red

    return 0xff69b4; // Default pink
  };

  const parseEyeshadowColors = (product) => {
    const productName = product.product?.toLowerCase() || '';

    // Check for palette descriptions
    if (productName.includes('neutral') || productName.includes('nude')) {
      return [0xd4a59a, 0xc19a6b, 0x8b7355];
    } else if (productName.includes('warm') || productName.includes('bronze')) {
      return [0xd4a373, 0xcd853f, 0x8b4513];
    } else if (productName.includes('cool') || productName.includes('silver')) {
      return [0xc0c0c0, 0x808080, 0x404040];
    } else if (productName.includes('smokey')) {
      return [0x696969, 0x404040, 0x1a1a1a];
    }

    // Default brown tones
    return [0xd2691e, 0x8b4513, 0x654321];
  };

  const handleCapture = () => {
    if (sceneManager) {
      const screenshot = sceneManager.takeScreenshot();
      if (onCapture) {
        onCapture(screenshot);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.videoContainer}>
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          width={1280}
          height={720}
        />
        <canvas
          ref={overlayCanvasRef}
          className={styles.overlayCanvas}
          width={1280}
          height={720}
        />

        {!isTracking && !error && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Initializing face tracking...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
          </div>
        )}

        {isTracking && (
          <div className={styles.controls}>
            <button onClick={handleCapture} className={styles.captureButton}>
              📸 Capture
            </button>
            <button
              onClick={() => sceneManager?.clearMakeup()}
              className={styles.clearButton}
            >
              Clear Makeup
            </button>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3>3D Virtual Try-On</h3>
        <p>
          {isTracking
            ? 'Face tracked! Makeup is rendered in real-time 3D.'
            : 'Starting camera and face tracking...'}
        </p>
      </div>
    </div>
  );
};

export default VirtualTryOn3D;
