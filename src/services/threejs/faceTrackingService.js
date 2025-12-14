/**
 * 3D Face Tracking Service
 * Uses MediaPipe FaceMesh for real-time face detection and landmark tracking
 * Integrated with Three.js for 3D rendering
 */

import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

class FaceTrackingService {
  constructor() {
    this.faceMesh = null;
    this.camera = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.onResultsCallback = null;
    this.isInitialized = false;
    this.landmarks = null;
  }

  /**
   * Initialize MediaPipe FaceMesh
   */
  async initialize(videoElement, canvasElement, onResults) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.onResultsCallback = onResults;

    // Initialize FaceMesh
    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    this.faceMesh.onResults(this.onResults.bind(this));

    // Initialize camera
    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        await this.faceMesh.send({ image: this.videoElement });
      },
      width: 1280,
      height: 720
    });

    await this.camera.start();
    this.isInitialized = true;

    return true;
  }

  /**
   * Process face mesh results
   */
  onResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      this.landmarks = results.multiFaceLandmarks[0];

      if (this.onResultsCallback) {
        this.onResultsCallback({
          landmarks: this.landmarks,
          image: results.image
        });
      }
    }
  }

  /**
   * Get specific facial feature landmarks
   */
  getFeatureLandmarks(feature) {
    if (!this.landmarks) return null;

    const features = {
      // Lips
      lips: {
        upper: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291],
        lower: [146, 91, 181, 84, 17, 314, 405, 321, 375, 291],
        inner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308]
      },
      // Eyes
      leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133],
      rightEye: [362, 382, 381, 380, 374, 373, 390, 249, 263],
      // Eyebrows
      leftEyebrow: [46, 53, 52, 65, 55, 70, 63, 105, 66, 107],
      rightEyebrow: [276, 283, 282, 295, 285, 300, 293, 334, 296, 336],
      // Cheeks (for blush)
      leftCheek: [116, 111, 117, 118, 119, 100, 47, 126, 209, 129],
      rightCheek: [345, 340, 346, 347, 348, 329, 277, 355, 429, 358],
      // Face oval
      faceOval: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
                 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
                 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
    };

    if (feature === 'all') {
      return features;
    }

    return features[feature] || null;
  }

  /**
   * Get 3D landmark positions
   */
  getLandmark3D(index) {
    if (!this.landmarks || index >= this.landmarks.length) return null;
    return this.landmarks[index];
  }

  /**
   * Calculate face rotation angles (pitch, yaw, roll)
   */
  getFaceRotation() {
    if (!this.landmarks) return { pitch: 0, yaw: 0, roll: 0 };

    // Use nose tip (1), forehead (10), and chin (152) for pitch
    const noseTip = this.landmarks[1];
    const forehead = this.landmarks[10];
    const chin = this.landmarks[152];

    // Use left (234) and right (454) face points for yaw
    const leftFace = this.landmarks[234];
    const rightFace = this.landmarks[454];

    // Simple rotation calculation
    const pitch = Math.atan2(chin.y - forehead.y, chin.z - forehead.z);
    const yaw = Math.atan2(rightFace.x - leftFace.x, rightFace.z - leftFace.z);
    const roll = Math.atan2(rightFace.y - leftFace.y, rightFace.x - leftFace.x);

    return { pitch, yaw, roll };
  }

  /**
   * Calculate face bounding box
   */
  getFaceBoundingBox() {
    if (!this.landmarks) return null;

    let minX = 1, maxX = 0, minY = 1, maxY = 0;

    this.landmarks.forEach(landmark => {
      minX = Math.min(minX, landmark.x);
      maxX = Math.max(maxX, landmark.x);
      minY = Math.min(minY, landmark.y);
      maxY = Math.max(maxY, landmark.y);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Stop tracking
   */
  stop() {
    if (this.camera) {
      this.camera.stop();
    }
    this.isInitialized = false;
  }

  /**
   * Check if tracking is active
   */
  isTracking() {
    return this.isInitialized && this.landmarks !== null;
  }
}

export default new FaceTrackingService();
