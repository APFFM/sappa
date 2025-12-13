/**
 * Gemini Image Service
 * Uses Google's Gemini 2.5 Flash Image model for photo editing
 * Uses REST API directly for browser compatibility
 */

// Use Gemini 2.5 Flash Image - the production-ready model for image editing
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-preview-05-20';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;

/**
 * Get Gemini API key from localStorage or environment
 */
function getApiKey() {
  // First check localStorage (user-configured)
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey) {
    return localKey;
  }

  // Fallback to environment variable
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_api_key_here') {
    return envKey;
  }

  return null;
}

/**
 * Generate makeup-applied image using Gemini 2.5 Flash Image
 * @param {string} imageBase64 - Base64 encoded image (with or without data URL prefix)
 * @param {string} lookType - Type of makeup look (natural, glam, fresh, evening, radiant)
 * @param {number} intensity - Makeup intensity (0-100)
 * @param {Object} facialAnalysis - Optional facial analysis for personalization
 * @returns {Promise<string>} - Base64 encoded result image
 */
export async function generateMakeupImage(imageBase64, lookType, intensity, facialAnalysis = null) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please add your API key in Settings (🔑 icon)');
  }

  try {
    // Remove data URL prefix if present
    let base64Data = imageBase64;
    if (imageBase64.includes('base64,')) {
      base64Data = imageBase64.split('base64,')[1];
    }

    // Determine mime type
    let mimeType = 'image/jpeg';
    if (imageBase64.includes('image/png')) {
      mimeType = 'image/png';
    }

    // Build intelligent prompt based on analysis and preferences
    const makeupPrompt = buildMakeupPrompt(lookType, intensity, facialAnalysis);

    console.log('Generating makeup with Gemini 2.5 Flash Image...');
    console.log('Model:', GEMINI_IMAGE_MODEL);
    console.log('Look type:', lookType, 'Intensity:', intensity);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: makeupPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 4096,
          // Required for image generation - tells the model to output images
          responseModalities: ["Text", "Image"],
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract image or text from response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          console.log('✓ Makeup image generated successfully!');
          return `data:${part.inlineData.mimeType};base64,${imageData}`;
        }
      }
      // If no image, the model might have returned text (e.g., it can't edit images)
      const textResponse = data.candidates[0].content.parts.find(p => p.text);
      if (textResponse) {
        throw new Error(`Model response: ${textResponse.text.substring(0, 200)}...`);
      }
    }

    throw new Error('No image data in response. The model may not support image generation for this request.');

  } catch (error) {
    console.error('Gemini makeup generation failed:', error);
    throw new Error(`Failed to generate makeup image: ${error.message}`);
  }
}

/**
 * Build intelligent makeup prompt based on preferences and analysis
 */
function buildMakeupPrompt(lookType, intensity, facialAnalysis) {
  // Base instruction
  let prompt = `Apply professional ${lookType} makeup to this person's face. `;
  
  // Intensity guidance
  const intensityDescriptions = {
    low: 'very subtle and natural',
    medium: 'noticeable but tasteful',
    high: 'bold and dramatic'
  };
  
  let intensityLevel = 'medium';
  if (intensity < 35) intensityLevel = 'low';
  else if (intensity > 65) intensityLevel = 'high';
  
  prompt += `The makeup should be ${intensityDescriptions[intensityLevel]}. `;
  
  // Look-specific guidance
  const lookInstructions = {
    natural: `Focus on enhancing natural beauty with:
- Lightweight foundation matching skin tone perfectly
- Subtle peachy blush on cheeks
- Soft brown eyeshadow
- Natural pink lips
- Light highlighting on cheekbones
- No heavy contouring
- Fresh, dewy finish`,
    
    glam: `Create a glamorous look with:
- Full coverage foundation
- Defined contouring on cheekbones and jawline
- Dramatic eyeshadow with shimmer
- Bold eyeliner and mascara
- Statement lip color (red or deep pink)
- Strong highlighting for glow
- Polished, sophisticated finish`,
    
    fresh: `Create a clean, fresh look with:
- Light, breathable foundation
- Rosy blush for healthy flush
- Minimal eye makeup with light shimmer
- Glossy nude lips
- Subtle highlighting
- Natural, radiant finish
- Focus on healthy, glowing skin`,
    
    evening: `Create an elegant evening look with:
- Medium to full coverage foundation
- Sculpted contouring
- Sophisticated eyeshadow (burgundy, plum, or bronze tones)
- Defined eyes with liner
- Rich lip color (berry, wine, or classic red)
- Luminous highlighting
- Refined, elegant finish`,
    
    radiant: `Create a radiant, glowing look with:
- Dewy foundation
- Cream blush for natural flush
- Warm eyeshadow tones (gold, bronze, copper)
- Glossy lips
- Strategic highlighting on all high points
- Sun-kissed warmth
- Luminous, healthy glow finish`
  };
  
  prompt += lookInstructions[lookType] || lookInstructions.natural;
  
  // Add personalization if facial analysis is available
  if (facialAnalysis?.analysis) {
    const { skinType, skinTone, undertone, faceShape } = facialAnalysis.analysis;
    
    prompt += `\n\nPersonalization based on facial analysis:`;
    
    if (skinTone) {
      prompt += `\n- Match foundation to ${skinTone} skin tone`;
    }
    
    if (undertone) {
      prompt += `\n- Choose ${undertone} undertone products`;
    }
    
    if (faceShape) {
      prompt += `\n- Apply contouring suitable for ${faceShape} face shape`;
    }
    
    if (skinType) {
      const finishGuide = {
        oily: 'matte finish',
        dry: 'dewy finish',
        combination: 'satin finish',
        normal: 'natural finish',
        sensitive: 'gentle, minimal products'
      };
      prompt += `\n- Use ${finishGuide[skinType.toLowerCase()] || 'appropriate finish'} for ${skinType} skin`;
    }
  }
  
  // Important constraints
  prompt += `\n\nIMPORTANT:
- Keep the person's facial features, expression, and identity EXACTLY the same
- Only modify makeup, not face structure or features
- Maintain natural skin texture
- Ensure realistic, professional makeup application
- Blend all makeup seamlessly
- Keep lighting and background unchanged
- Preserve hair, clothing, and all non-face elements
- Result should look like professional makeup, not filters`;
  
  return prompt;
}

/**
 * Generate multiple makeup variations at once
 * @param {string} imageBase64 - Base64 encoded image
 * @param {Array<Object>} variations - Array of {lookType, intensity} objects
 * @returns {Promise<Array<string>>} - Array of base64 encoded result images
 */
export async function generateMakeupVariations(imageBase64, variations, facialAnalysis = null) {
  const results = [];
  
  for (const variation of variations) {
    try {
      const result = await generateMakeupImage(
        imageBase64,
        variation.lookType,
        variation.intensity,
        facialAnalysis
      );
      results.push({
        lookType: variation.lookType,
        intensity: variation.intensity,
        image: result,
        success: true
      });
    } catch (error) {
      console.error(`Failed to generate ${variation.lookType}:`, error);
      results.push({
        lookType: variation.lookType,
        intensity: variation.intensity,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
}

/**
 * Check if Gemini Image generation is available
 */
export function isGeminiImageAvailable() {
  const apiKey = getApiKey();
  return !!apiKey;
}

/**
 * Get supported makeup looks
 */
export function getSupportedLooks() {
  return [
    { id: 'natural', name: 'Natural Glow', description: 'Subtle, everyday makeup' },
    { id: 'glam', name: 'Glamorous', description: 'Bold, dramatic look' },
    { id: 'fresh', name: 'Fresh & Clean', description: 'Minimal, radiant look' },
    { id: 'evening', name: 'Evening Elegance', description: 'Sophisticated night look' },
    { id: 'radiant', name: 'Radiant Skin', description: 'Glowing, sun-kissed look' }
  ];
}

/**
 * Validate image for processing
 */
export function validateImage(imageBase64) {
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return { valid: false, error: 'Invalid image data' };
  }
  
  // Check if it's a valid base64 image with regex
  const validImagePattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  if (!validImagePattern.test(imageBase64)) {
    return { valid: false, error: 'Image must be in data URL format (PNG, JPEG, GIF, or WebP)' };
  }
  
  // Check size (max 4MB for API)
  const base64Data = imageBase64.split(',')[1] || '';
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  if (sizeInMB > 4) {
    return { valid: false, error: 'Image too large (max 4MB). Please compress or resize your image.' };
  }
  
  return { valid: true };
}
