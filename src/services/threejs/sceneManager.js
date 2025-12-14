/**
 * Three.js Scene Manager
 * Manages 3D scene, camera, lighting, and rendering
 */

import * as THREE from 'three';

class SceneManager {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.animationFrameId = null;
    this.renderCallbacks = [];
  }

  /**
   * Initialize Three.js scene
   */
  initialize(canvas, width, height) {
    this.canvas = canvas;

    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(
      63, // FOV to match typical webcam
      width / height,
      0.1,
      1000
    );
    this.camera.position.z = 1;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Add lighting
    this.setupLighting();

    return true;
  }

  /**
   * Setup scene lighting
   */
  setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light for shadows and depth
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);

    // Point lights for facial features
    const leftLight = new THREE.PointLight(0xffffff, 0.3);
    leftLight.position.set(-1, 0, 1);
    this.scene.add(leftLight);

    const rightLight = new THREE.PointLight(0xffffff, 0.3);
    rightLight.position.set(1, 0, 1);
    this.scene.add(rightLight);
  }

  /**
   * Create 3D mesh for makeup overlay
   */
  createMakeupMesh(landmarks, color, opacity, featureType) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    // Convert landmarks to 3D vertices
    landmarks.forEach(landmark => {
      // Convert normalized coordinates to 3D space
      const x = (landmark.x - 0.5) * 2; // -1 to 1
      const y = -(landmark.y - 0.5) * 2; // -1 to 1, flipped
      const z = -landmark.z || 0;
      vertices.push(x, y, z);
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // Create material based on feature type
    let material;
    if (featureType === 'lips' || featureType === 'blush') {
      // Glossy material for lips and blush
      material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        shininess: 30,
        side: THREE.DoubleSide
      });
    } else if (featureType === 'eyeshadow') {
      // Matte material for eyeshadow
      material = new THREE.MeshLambertMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
      });
    } else {
      // Default material
      material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
      });
    }

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.featureType = featureType;

    return mesh;
  }

  /**
   * Create lipstick overlay
   */
  createLipstickOverlay(lipLandmarks, color, finish = 'glossy') {
    const group = new THREE.Group();

    // Upper lip
    const upperLipMesh = this.createMakeupMesh(
      lipLandmarks.upper,
      color,
      finish === 'matte' ? 0.8 : 0.7,
      'lips'
    );
    group.add(upperLipMesh);

    // Lower lip
    const lowerLipMesh = this.createMakeupMesh(
      lipLandmarks.lower,
      color,
      finish === 'matte' ? 0.8 : 0.7,
      'lips'
    );
    group.add(lowerLipMesh);

    // Add gloss effect for glossy finish
    if (finish === 'glossy') {
      const glossMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        shininess: 100,
        side: THREE.DoubleSide
      });

      const glossMesh = new THREE.Mesh(upperLipMesh.geometry.clone(), glossMaterial);
      group.add(glossMesh);
    }

    return group;
  }

  /**
   * Create eyeshadow overlay
   */
  createEyeshadowOverlay(eyeLandmarks, colors, blendMode = 'gradient') {
    const group = new THREE.Group();

    if (blendMode === 'gradient' && colors.length > 1) {
      // Create gradient eyeshadow
      colors.forEach((color, index) => {
        const opacity = 0.6 - (index * 0.15);
        const mesh = this.createMakeupMesh(
          eyeLandmarks,
          color,
          opacity,
          'eyeshadow'
        );
        group.add(mesh);
      });
    } else {
      // Single color eyeshadow
      const mesh = this.createMakeupMesh(
        eyeLandmarks,
        colors[0] || 0x8B4513,
        0.6,
        'eyeshadow'
      );
      group.add(mesh);
    }

    return group;
  }

  /**
   * Create blush overlay
   */
  createBlushOverlay(cheekLandmarks, color, intensity = 0.5) {
    const mesh = this.createMakeupMesh(
      cheekLandmarks,
      color,
      intensity,
      'blush'
    );

    return mesh;
  }

  /**
   * Add object to scene
   */
  addToScene(object) {
    this.scene.add(object);
  }

  /**
   * Remove object from scene
   */
  removeFromScene(object) {
    this.scene.remove(object);
  }

  /**
   * Clear all makeup overlays
   */
  clearMakeup() {
    const objectsToRemove = [];
    this.scene.traverse((object) => {
      if (object.userData && object.userData.featureType) {
        objectsToRemove.push(object);
      }
    });
    objectsToRemove.forEach(obj => this.scene.remove(obj));
  }

  /**
   * Register render callback
   */
  onRender(callback) {
    this.renderCallbacks.push(callback);
  }

  /**
   * Start animation loop
   */
  startRendering() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      // Call registered callbacks
      this.renderCallbacks.forEach(callback => callback());

      // Render scene
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  /**
   * Stop animation loop
   */
  stopRendering() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resize renderer
   */
  resize(width, height) {
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  /**
   * Take screenshot
   */
  takeScreenshot() {
    if (!this.renderer) return null;
    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.stopRendering();

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.renderCallbacks = [];
  }
}

export default SceneManager;
