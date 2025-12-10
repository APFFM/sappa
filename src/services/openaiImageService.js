/**
 * OpenAI Image Service
 * Uses OpenAI's DALL-E and GPT-4 Vision for makeup generation
 * Works in all regions including Europe
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
 * Generate makeup-applied image using OpenAI
 * Uses GPT-4 Vision to create a detailed makeup description,
 * then generates a new styled image with DALL-E
 *
 * @param {string} imageBase64 - Base64 encoded image (with or without data URL prefix)
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
    console.log('Generating makeup with OpenAI...');
    console.log('Look type:', lookType, 'Intensity:', intensity);

    // Step 1: Use GPT-4 Vision to analyze the face and create a detailed description
    const faceDescription = await analyzeFaceForMakeup(apiKey, imageBase64, lookType, intensity, facialAnalysis);

    // Step 2: Generate new image with DALL-E based on the description
    const generatedImage = await generateWithDALLE(apiKey, faceDescription, lookType, intensity);

    console.log('✓ Makeup image generated successfully!');
    return generatedImage;

  } catch (error) {
    console.error('OpenAI makeup generation failed:', error);
    throw new Error(`Failed to generate makeup image: ${error.message}`);
  }
}

/**
 * Analyze face using GPT-4 Vision and create makeup prompt
 */
async function analyzeFaceForMakeup(apiKey, imageBase64, lookType, intensity, facialAnalysis) {
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

  const intensityDesc = intensity < 35 ? 'subtle and natural' : intensity > 65 ? 'bold and dramatic' : 'balanced and elegant';

  const lookDescriptions = {
    natural: 'natural, everyday makeup with soft colors and minimal coverage',
    glam: 'glamorous makeup with defined features, shimmer, and bold colors',
    fresh: 'fresh, dewy look with light coverage and healthy glow',
    evening: 'sophisticated evening makeup with rich colors and elegant finish',
    radiant: 'radiant, glowing makeup with warm tones and luminous highlights'
  };

  const prompt = `Analyze this person's face and describe them in detail for an artist to recreate with ${lookDescriptions[lookType] || lookDescriptions.natural} makeup applied.

Include:
1. Face shape, skin tone, and features
2. Hair color and style
3. Eye color and shape
4. Current expression and pose
5. Lighting and background

The makeup should be ${intensityDesc}.

${facialAnalysis ? `Additional context: Skin type is ${facialAnalysis.analysis?.skinType}, undertone is ${facialAnalysis.analysis?.undertone}.` : ''}

Create a detailed, artistic description that captures the person's likeness with beautiful ${lookType} makeup applied. Focus on how the makeup enhances their natural features.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GPT-4 Vision error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate image with DALL-E 3
 */
async function generateWithDALLE(apiKey, faceDescription, lookType, intensity) {
  const intensityDesc = intensity < 35 ? 'subtle' : intensity > 65 ? 'bold' : 'moderate';

  const prompt = `Professional beauty portrait photograph: ${faceDescription}

Style: High-end beauty photography, professional makeup look (${lookType}), ${intensityDesc} intensity.
Quality: Ultra realistic, studio lighting, sharp focus, professional beauty retouching.
Important: Photorealistic portrait, not illustration. Natural skin texture, professional makeup application.`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt.substring(0, 4000), // DALL-E 3 has a prompt limit
      n: 1,
      size: '1024x1024',
      quality: 'hd',
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`DALL-E error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();

  if (data.data && data.data[0]?.b64_json) {
    return `data:image/png;base64,${data.data[0].b64_json}`;
  }

  throw new Error('No image data in DALL-E response');
}

/**
 * Check if OpenAI Image generation is available
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

  // Check size (max 20MB for OpenAI)
  const base64Data = imageBase64.split(',')[1] || '';
  const sizeInBytes = (base64Data.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  if (sizeInMB > 20) {
    return { valid: false, error: 'Image too large (max 20MB). Please compress or resize your image.' };
  }

  return { valid: true };
}
