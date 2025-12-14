/**
 * 3D Virtual Try-On Component
 * Camera capture + AI-powered virtual try-on
 */

import React, { useEffect, useRef, useState } from 'react';
import { generateMakeupProductResults } from '../../services/virtualTryOnService';
import styles from './VirtualTryOn3D.module.css';

const VirtualTryOn3D = ({ makeupProducts, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
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

  const handleTryOn = async () => {
    if (!capturedImage || !makeupProducts) {
      setError('Please capture a photo and apply makeup first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create a mock makeup look object from products
      const makeupLook = {
        occasion: 'everyday',
        personality: 'natural'
      };

      const result = await generateMakeupProductResults(
        capturedImage,
        makeupProducts,
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
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Left Side - Camera/Capture */}
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
              <button
                onClick={handleReset}
                className={styles.resetButton}
              >
                🔄 Retake Photo
              </button>
            )}
          </div>
        </div>

        {/* Right Side - Try-On Result */}
        <div className={styles.resultSection}>
          <h3>✨ Virtual Try-On Result</h3>
          <div className={styles.resultContainer}>
            {!capturedImage && (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>📸</div>
                <p>Capture a photo to get started</p>
              </div>
            )}

            {capturedImage && !tryOnResult && !isProcessing && (
              <div className={styles.placeholder}>
                <div className={styles.placeholderIcon}>💄</div>
                <p>Ready for virtual try-on!</p>
                <button
                  onClick={handleTryOn}
                  className={styles.tryOnButton}
                  disabled={!makeupProducts}
                >
                  {makeupProducts ? '✨ Apply Makeup' : '⚠️ No makeup selected'}
                </button>
              </div>
            )}

            {isProcessing && (
              <div className={styles.processing}>
                <div className={styles.spinner}></div>
                <p>Generating your virtual try-on...</p>
                <p className={styles.hint}>Using AI to apply makeup...</p>
              </div>
            )}

            {tryOnResult && (
              <div className={styles.result}>
                <img
                  src={tryOnResult.imageUrl}
                  alt="Virtual Try-On Result"
                  className={styles.resultImage}
                />
                <div className={styles.resultInfo}>
                  <h4>Expected Results:</h4>
                  <ul>
                    {tryOnResult.expectedChanges.map((change, idx) => (
                      <li key={idx}>{change}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = tryOnResult.imageUrl;
                      link.download = 'virtual-tryon-result.png';
                      link.click();
                    }}
                    className={styles.downloadButton}
                  >
                    💾 Download Result
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.instructions}>
        <h4>How to use:</h4>
        <ol>
          <li>📸 Click "Apply Demo Makeup" in the info card above</li>
          <li>📷 Allow camera access when prompted</li>
          <li>😊 Position your face in the camera view</li>
          <li>📸 Click "Capture Photo"</li>
          <li>✨ Click "Apply Makeup" to see AI-generated result</li>
          <li>💾 Download your result!</li>
        </ol>
      </div>
    </div>
  );
};

export default VirtualTryOn3D;
