/**
 * Canvas-based Makeup Renderer
 * Applies realistic makeup effects using Canvas API and Gemini AI coordinates
 */

/**
 * Applies makeup to an image using canvas
 * @param {HTMLImageElement} image - Source image
 * @param {Object} makeupData - Makeup coordinates and colors from Gemini
 * @param {number} intensity - Makeup intensity (0-100)
 * @returns {Promise<string>} - Base64 image with makeup applied
 */
export async function applyMakeupToImage(image, makeupData, intensity = 50) {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      canvas.width = image.width || image.naturalWidth;
      canvas.height = image.height || image.naturalHeight;
      
      // Draw original image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      // Apply makeup layers
      const intensityFactor = intensity / 100;
      
      // 1. Foundation (subtle skin tone evening)
      if (makeupData.foundation) {
        applyFoundation(ctx, canvas, makeupData.foundation, intensityFactor);
      }
      
      // 2. Concealer (brighten under eyes)
      if (makeupData.concealer) {
        applyConcealer(ctx, makeupData.concealer, intensityFactor);
      }
      
      // 3. Contour (add dimension)
      if (makeupData.contour) {
        applyContour(ctx, makeupData.contour, intensityFactor);
      }
      
      // 4. Blush (add color to cheeks)
      if (makeupData.blush) {
        applyBlush(ctx, makeupData.blush, intensityFactor);
      }
      
      // 5. Eye makeup
      if (makeupData.eyeshadow) {
        applyEyeshadow(ctx, makeupData.eyeshadow, intensityFactor);
      }
      
      // 6. Lips
      if (makeupData.lips) {
        applyLipColor(ctx, makeupData.lips, intensityFactor);
      }
      
      // 7. Highlighter (add glow)
      if (makeupData.highlight) {
        applyHighlighter(ctx, makeupData.highlight, intensityFactor);
      }
      
      // Convert to base64
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Apply foundation effect
 */
function applyFoundation(ctx, canvas, foundationData, intensity) {
  const { color, opacity, region } = foundationData;
  
  if (!color || !region) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = (opacity || 0.2) * intensity;
  
  // Create gradient for natural look
  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
  );
  
  gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`);
  gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, 0.1)`);
  gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.restore();
}

/**
 * Apply concealer (brighten under eyes)
 */
function applyConcealer(ctx, concealerData, intensity) {
  if (!concealerData.areas) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3 * intensity;
  
  concealerData.areas.forEach(area => {
    if (area.points && area.points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(area.points[0][0], area.points[0][1]);
      area.points.forEach(point => {
        ctx.lineTo(point[0], point[1]);
      });
      ctx.closePath();
      
      ctx.fillStyle = `rgba(255, 245, 235, ${area.opacity || 0.4})`;
      ctx.fill();
      
      // Blur effect for natural look
      ctx.filter = 'blur(15px)';
      ctx.fill();
      ctx.filter = 'none';
    }
  });
  
  ctx.restore();
}

/**
 * Apply contour
 */
function applyContour(ctx, contourData, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.25 * intensity;
  
  const drawContourPath = (points, color = 'rgba(139, 101, 85, 0.4)') => {
    if (!points || points.length === 0) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.forEach(point => {
      ctx.lineTo(point[0], point[1]);
    });
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.filter = 'blur(20px)';
    ctx.stroke();
    ctx.filter = 'none';
  };
  
  if (contourData.cheeks) {
    drawContourPath(contourData.cheeks.left);
    drawContourPath(contourData.cheeks.right);
  }
  
  if (contourData.nose) {
    drawContourPath(contourData.nose);
  }
  
  if (contourData.jawline) {
    drawContourPath(contourData.jawline);
  }
  
  ctx.restore();
}

/**
 * Apply blush to cheeks
 */
function applyBlush(ctx, blushData, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  
  const applyBlushCircle = (blushInfo) => {
    if (!blushInfo || !blushInfo.center || !blushInfo.color) return;
    
    const { center, radius, color, intensity: blushIntensity } = blushInfo;
    
    const gradient = ctx.createRadialGradient(
      center.x, center.y, 0,
      center.x, center.y, radius || 50
    );
    
    const alpha = (blushIntensity || 0.3) * intensity;
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.filter = 'blur(25px)';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius || 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
  };
  
  if (blushData.left) applyBlushCircle(blushData.left);
  if (blushData.right) applyBlushCircle(blushData.right);
  
  ctx.restore();
}

/**
 * Apply eyeshadow
 */
function applyEyeshadow(ctx, eyeshadowData, intensity) {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.4 * intensity;
  
  const applyEyeColor = (eyeInfo) => {
    if (!eyeInfo || !eyeInfo.lid || !eyeInfo.colors) return;
    
    // Apply to eyelid
    ctx.beginPath();
    ctx.moveTo(eyeInfo.lid[0][0], eyeInfo.lid[0][1]);
    eyeInfo.lid.forEach(point => {
      ctx.lineTo(point[0], point[1]);
    });
    ctx.closePath();
    
    eyeInfo.colors.forEach(color => {
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
      ctx.filter = 'blur(8px)';
      ctx.fill();
      ctx.filter = 'none';
    });
  };
  
  if (eyeshadowData.left) applyEyeColor(eyeshadowData.left);
  if (eyeshadowData.right) applyEyeColor(eyeshadowData.right);
  
  ctx.restore();
}

/**
 * Apply lip color
 */
function applyLipColor(ctx, lipsData, intensity) {
  if (!lipsData || !lipsData.color) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.6 * intensity;
  
  // Draw lip path
  const drawLipPath = (points) => {
    if (!points || points.length === 0) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    points.forEach(point => {
      ctx.lineTo(point[0], point[1]);
    });
    ctx.closePath();
  };
  
  if (lipsData.upperLip) {
    drawLipPath(lipsData.upperLip);
    ctx.fillStyle = `rgba(${lipsData.color.r}, ${lipsData.color.g}, ${lipsData.color.b}, 0.7)`;
    ctx.fill();
  }
  
  if (lipsData.lowerLip) {
    drawLipPath(lipsData.lowerLip);
    ctx.fillStyle = `rgba(${lipsData.color.r}, ${lipsData.color.g}, ${lipsData.color.b}, 0.7)`;
    ctx.fill();
  }
  
  // Add gloss if specified
  if (lipsData.gloss && lipsData.gloss > 0) {
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = lipsData.gloss * 0.3;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    if (lipsData.upperLip) {
      drawLipPath(lipsData.upperLip);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

/**
 * Apply highlighter
 */
function applyHighlighter(ctx, highlightData, intensity) {
  if (!highlightData || !highlightData.points) return;
  
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  
  highlightData.points.forEach(point => {
    const { position, intensity: pointIntensity, radius } = point;
    
    if (!position) return;
    
    const gradient = ctx.createRadialGradient(
      position.x, position.y, 0,
      position.x, position.y, radius || 30
    );
    
    const alpha = (pointIntensity || 0.5) * intensity * 0.6;
    gradient.addColorStop(0, `rgba(255, 252, 240, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 252, 240, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 252, 240, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.filter = 'blur(15px)';
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius || 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';
  });
  
  ctx.restore();
}

/**
 * Apply simple makeup using predefined look without coordinates
 * (Fallback when Gemini coordinates are not available)
 */
export async function applySimpleMakeup(imageSrc, lookType, intensity) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw original
      ctx.drawImage(img, 0, 0);
      
      // Apply simple filters based on look type
      const filters = getMakeupFilters(lookType, intensity);
      
      ctx.filter = filters;
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = intensity / 200;
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    
    img.onerror = reject;
    img.src = imageSrc;
  });
}

/**
 * Get CSS filters for different makeup looks
 */
function getMakeupFilters(lookType, intensity) {
  const factor = intensity / 100;
  
  const looks = {
    natural: `brightness(${1 + 0.05 * factor}) contrast(${1 + 0.05 * factor}) saturate(${1 + 0.1 * factor})`,
    glam: `brightness(${1 + 0.1 * factor}) contrast(${1 + 0.15 * factor}) saturate(${1 + 0.3 * factor})`,
    fresh: `brightness(${1 + 0.08 * factor}) contrast(${1 + 0.1 * factor}) saturate(${1 + 0.2 * factor}) hue-rotate(-5deg)`,
    evening: `brightness(${1 + 0.05 * factor}) contrast(${1 + 0.2 * factor}) saturate(${1 + 0.25 * factor})`,
    radiant: `brightness(${1 + 0.15 * factor}) contrast(${1 + 0.08 * factor}) saturate(${1 + 0.2 * factor})`
  };
  
  return looks[lookType] || looks.natural;
}
