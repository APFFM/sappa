/**
 * 3D Product Renderer
 * Renders interactive 3D models of skincare and makeup products
 */

import * as THREE from 'three';

class ProductRenderer3D {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.products = [];
    this.currentProduct = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  /**
   * Create 3D model for skincare bottle/jar
   */
  createSkincareProduct(productType, color = 0x667eea, size = 1) {
    const group = new THREE.Group();

    if (productType === 'serum' || productType === 'cleanser') {
      // Cylindrical bottle
      const bottleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 32);
      const bottleMaterial = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: 0.7,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
      group.add(bottle);

      // Cap
      const capGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32);
      const capMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 100
      });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.y = 0.7;
      group.add(cap);

      // Label
      const labelGeometry = new THREE.PlaneGeometry(0.5, 0.4);
      const labelMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9
      });
      const label = new THREE.Mesh(labelGeometry, labelMaterial);
      label.position.set(0, 0, 0.31);
      group.add(label);

    } else if (productType === 'moisturizer' || productType === 'night_cream') {
      // Jar/pot
      const jarGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.6, 32);
      const jarMaterial = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        roughness: 0.2,
        metalness: 0.1,
        clearcoat: 1.0
      });
      const jar = new THREE.Mesh(jarGeometry, jarMaterial);
      group.add(jar);

      // Lid
      const lidGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.15, 32);
      const lidMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 100
      });
      const lid = new THREE.Mesh(lidGeometry, lidMaterial);
      lid.position.y = 0.375;
      group.add(lid);

    } else if (productType === 'sunscreen') {
      // Tube
      const tubeGeometry = new THREE.CylinderGeometry(0.25, 0.28, 1.0, 32);
      const tubeMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 30
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      group.add(tube);

      // Cap
      const capGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 32);
      const capMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 100
      });
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.y = 0.625;
      group.add(cap);
    }

    group.scale.set(size, size, size);
    group.userData.productType = productType;

    return group;
  }

  /**
   * Create 3D model for makeup product
   */
  createMakeupProduct(productType, color = 0xff6b9d, size = 1) {
    const group = new THREE.Group();

    if (productType === 'lipstick') {
      // Lipstick tube
      const tubeGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 32);
      const tubeMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 100,
        metalness: 0.5
      });
      const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
      group.add(tube);

      // Lipstick bullet (extended)
      const bulletGeometry = new THREE.CylinderGeometry(0.12, 0.08, 0.4, 32);
      const bulletMaterial = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 50
      });
      const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
      bullet.position.y = 0.6;
      group.add(bullet);

    } else if (productType === 'eyeshadow_palette') {
      // Palette case
      const caseGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.8);
      const caseMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 100
      });
      const paletteCase = new THREE.Mesh(caseGeometry, caseMaterial);
      group.add(paletteCase);

      // Eyeshadow pans (4 colors)
      const colors = [0x8B4513, 0xD2691E, 0xF4A460, 0xFFE4B5];
      for (let i = 0; i < 4; i++) {
        const panGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.08, 32);
        const panMaterial = new THREE.MeshLambertMaterial({
          color: colors[i]
        });
        const pan = new THREE.Mesh(panGeometry, panMaterial);
        pan.position.set(-0.45 + (i * 0.3), 0.09, 0);
        pan.rotation.x = Math.PI / 2;
        group.add(pan);
      }

    } else if (productType === 'foundation' || productType === 'concealer') {
      // Foundation bottle
      const bottleGeometry = new THREE.CylinderGeometry(0.25, 0.3, 1.0, 32);
      const bottleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        roughness: 0.2,
        metalness: 0.1
      });
      const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
      group.add(bottle);

      // Foundation liquid inside
      const liquidGeometry = new THREE.CylinderGeometry(0.23, 0.28, 0.8, 32);
      const liquidMaterial = new THREE.MeshLambertMaterial({
        color: color
      });
      const liquid = new THREE.Mesh(liquidGeometry, liquidMaterial);
      liquid.position.y = -0.1;
      group.add(liquid);

      // Pump
      const pumpGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.3, 32);
      const pumpMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 100
      });
      const pump = new THREE.Mesh(pumpGeometry, pumpMaterial);
      pump.position.y = 0.65;
      group.add(pump);

    } else if (productType === 'blush' || productType === 'bronzer') {
      // Compact
      const compactGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
      const compactMaterial = new THREE.MeshPhongMaterial({
        color: 0x333333,
        shininess: 100
      });
      const compact = new THREE.Mesh(compactGeometry, compactMaterial);
      group.add(compact);

      // Powder
      const powderGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 32);
      const powderMaterial = new THREE.MeshLambertMaterial({
        color: color
      });
      const powder = new THREE.Mesh(powderGeometry, powderMaterial);
      powder.position.y = 0.02;
      group.add(powder);

      // Mirror (on lid)
      const mirrorGeometry = new THREE.CircleGeometry(0.35, 32);
      const mirrorMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        shininess: 100,
        metalness: 0.9
      });
      const mirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
      mirror.position.y = 0.08;
      mirror.rotation.x = -Math.PI / 2;
      group.add(mirror);
    }

    group.scale.set(size, size, size);
    group.userData.productType = productType;

    return group;
  }

  /**
   * Add product to scene with animation
   */
  addProduct(product, position = { x: 0, y: 0, z: 0 }) {
    product.position.set(position.x, position.y, position.z);

    // Entrance animation
    product.scale.set(0, 0, 0);
    this.scene.add(product);
    this.products.push(product);
    this.currentProduct = product;

    // Animate in
    const animate = () => {
      if (product.scale.x < 1) {
        product.scale.x += 0.05;
        product.scale.y += 0.05;
        product.scale.z += 0.05;
        product.rotation.y += 0.1;
        requestAnimationFrame(animate);
      } else {
        product.scale.set(1, 1, 1);
      }
    };
    animate();

    return product;
  }

  /**
   * Rotate product (for interactive viewing)
   */
  rotateProduct(product, deltaX, deltaY) {
    product.rotation.y += deltaX * 0.01;
    product.rotation.x += deltaY * 0.01;

    // Limit rotation on X axis
    product.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, product.rotation.x));
  }

  /**
   * Auto-rotate product
   */
  autoRotateProduct(product, speed = 0.01) {
    product.rotation.y += speed;
  }

  /**
   * Remove product from scene
   */
  removeProduct(product) {
    const index = this.products.indexOf(product);
    if (index > -1) {
      this.products.splice(index, 1);
    }

    // Exit animation
    const animate = () => {
      if (product.scale.x > 0) {
        product.scale.x -= 0.05;
        product.scale.y -= 0.05;
        product.scale.z -= 0.05;
        product.rotation.y += 0.1;
        requestAnimationFrame(animate);
      } else {
        this.scene.remove(product);

        // Dispose geometry and materials
        product.traverse((child) => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
    animate();
  }

  /**
   * Clear all products
   */
  clearProducts() {
    this.products.forEach(product => {
      this.scene.remove(product);
      product.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.products = [];
    this.currentProduct = null;
  }

  /**
   * Get product at mouse position (for interaction)
   */
  getProductAtPosition(x, y, canvasWidth, canvasHeight) {
    this.mouse.x = (x / canvasWidth) * 2 - 1;
    this.mouse.y = -(y / canvasHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.products, true);

    if (intersects.length > 0) {
      let object = intersects[0].object;
      while (object.parent && !object.userData.productType) {
        object = object.parent;
      }
      return object;
    }

    return null;
  }

  /**
   * Highlight product
   */
  highlightProduct(product, highlight = true) {
    product.traverse((child) => {
      if (child.material) {
        if (highlight) {
          child.material.emissive = new THREE.Color(0x444444);
        } else {
          child.material.emissive = new THREE.Color(0x000000);
        }
      }
    });
  }
}

export default ProductRenderer3D;
