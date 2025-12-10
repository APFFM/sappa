/**
 * OpenAI Image Service
 * Uses OpenAI's gpt-image-1 model for real image editing
 * Edits your actual photo with makeup - works worldwide
 */

/**
 * Get OpenAI API key from localStorage or environment
 */
function getApiKey() {
  // First check localStorage (user-configured)
  const localKey = localStorage.getItem('openai_api_key');
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }

  // Fallback to environment variable
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey && envKey !== 'your_openai_api_key_here') {
    return envKey;
  }

  return null;
}

/**
 * Convert base64 data URL to a File object
 */
function base64ToFile(base64DataUrl, filename = 'image.png') {
  // Extract the base64 data and mime type
  const [header, base64Data] = base64DataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

  // Convert base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create a Blob and then a File
  const blob = new Blob([bytes], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

/**
 * Build makeup editing prompt based on look type and intensity
 */
function buildMakeupPrompt(lookType, intensity, facialAnalysis) {
  const intensityDesc = intensity < 35 ? 'subtle and natural' :
                        intensity > 65 ? 'bold and dramatic' : 'balanced and elegant';

  const lookPrompts = {
    natural: `Apply natural, everyday makeup to this person's face. Include:
- Light, skin-matching foundation with natural finish
- Soft peachy-pink blush on cheeks
- Subtle brown eyeshadow with light shimmer
- Natural pink lip color
- Light mascara for defined lashes
- Soft brow fill
The look should be fresh and enhance natural beauty.`,

    glam: `Apply glamorous makeup to this person's face. Include:
- Full coverage foundation with flawless finish
- Defined contouring on cheekbones and jawline
- Dramatic smoky eyeshadow with shimmer and glitter
- Bold winged eyeliner
- Full, voluminous lashes
- Statement red or deep pink lipstick
- Strong highlighting on cheekbones
The look should be bold, sophisticated, and camera-ready.`,

    fresh: `Apply fresh, dewy makeup to this person's face. Include:
- Light, breathable tinted moisturizer
- Cream blush for a healthy flush
- Minimal eye makeup with soft shimmer
- Glossy nude or pink lip
- Natural-looking brows
- Subtle highlighter for glow
The look should be minimal, youthful, and radiant.`,

    evening: `Apply elegant evening makeup to this person's face. Include:
- Medium coverage foundation with satin finish
- Sculpted contouring
- Rich eyeshadow in burgundy, plum, or bronze tones
- Defined eyeliner
- Full lashes
- Berry, wine, or classic red lip color
- Luminous highlighting
The look should be sophisticated and refined.`,

    radiant: `Apply radiant, glowing makeup to this person's face. Include:
- Dewy foundation with luminous finish
- Warm cream blush
- Golden and bronze eyeshadow tones
- Glossy lips in nude or coral
- Strategic highlighting on all high points
- Sun-kissed warmth throughout
The look should be healthy, glowing, and luminous.`
  };

  let prompt = lookPrompts[lookType] || lookPrompts.natural;
  prompt += `\n\nMakeup intensity: ${intensityDesc}.`;

  // Add personalization from facial analysis
  if (facialAnalysis?.analysis) {
    const { skinTone, undertone, faceShape } = facialAnalysis.analysis;
    if (skinTone) prompt += `\nMatch products to ${skinTone} skin tone.`;
    if (undertone) prompt += `\nUse ${undertone} undertone-friendly colors.`;
    if (faceShape) prompt += `\nApply contouring suitable for ${faceShape} face shape.`;
  }

  prompt += `\n\nIMPORTANT: Keep the person's identity, features, expression, and pose EXACTLY the same. Only add makeup - do not change face structure, hair, clothing, or background. The result should look like the same person with professional makeup applied.`;

  return prompt;
}

/**
 * Generate makeup-applied image using OpenAI gpt-image-1 edit endpoint
 * This actually edits your photo instead of generating a new one
 *
 * @param {string} imageBase64 - Base64 encoded image (with data URL prefix)
 * @param {string} lookType - Type of makeup look (natural, glam, fresh, evening, radiant)
 * @param {number} intensity - Makeup intensity (0-100)
 * @param {Object} facialAnalysis - Optional facial analysis for personalization
 * @returns {Promise<string>} - Base64 encoded result image
 */
export async function generateMakeupImage(imageBase64, lookType, intensity, facialAnalysis = null) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured. Please add your API key in Settings.');
  }

  try {
    console.log('Editing image with OpenAI gpt-image-1...');
    console.log('Look type:', lookType, 'Intensity:', intensity);

    // Convert base64 to File object
    const imageFile = base64ToFile(imageBase64, 'photo.png');

    // Build the makeup prompt
    const prompt = buildMakeupPrompt(lookType, intensity, facialAnalysis);

    // Create FormData for the edit request
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    formData.append('size', '1024x1024');
    formData.append('quality', 'high');
    formData.append('n', '1');

    // Call the OpenAI edit endpoint
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Don't set Content-Type - browser sets it automatically with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    // Extract the edited image
    if (data.data && data.data[0]) {
      // Check if we got base64 or URL
      if (data.data[0].b64_json) {
        console.log('✓ Makeup applied successfully with gpt-image-1!');
        return `data:image/png;base64,${data.data[0].b64_json}`;
      } else if (data.data[0].url) {
        // If we got a URL, fetch it and convert to base64
        console.log('✓ Makeup applied successfully! Fetching result...');
        const imageResponse = await fetch(data.data[0].url);
        const blob = await imageResponse.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    }

    throw new Error('No image data in response');

  } catch (error) {
    console.error('OpenAI image edit failed:', error);
    throw new Error(`Failed to generate makeup image: ${error.message}`);
  }
}

/**
 * Check if OpenAI Image editing is available
 */
export function isOpenAIImageAvailable() {
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

  // Check if it's a valid base64 image
  const validImagePattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
  if (!validImagePattern.test(imageBase64)) {
    return { valid: false, error: 'Image must be in data URL format (PNG, JPEG, GIF, or WebP)' };
  }

  // Check size (max 50MB for gpt-image-1)
  const base64Data = imageBase64.split(',')[1] || '';
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > 50) {
    return { valid: false, error: 'Image too large (max 50MB). Please compress or resize your image.' };
  }

  return { valid: true };
}
