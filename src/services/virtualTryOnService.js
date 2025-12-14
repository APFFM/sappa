/**
 * Virtual Try-On Service
 * Uses Gemini 2.5 Flash Image model to generate actual preview images
 */

// Use the production-ready image generation model
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

/**
 * Get Gemini API key
 */
function getGeminiApiKey() {
  const localKey = localStorage.getItem('gemini_api_key');
  if (localKey) return localKey;

  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'your_gemini_api_key_here') return envKey;

  return null;
}

/**
 * Generate virtual try-on for skincare products
 * Shows how skin would look after using the recommended routine
 */
export async function generateSkincareResults(imageBase64, skincareRoutine, skinAnalysis) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Remove data URL prefix if present
  const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const keyProducts = [
    skincareRoutine.morning.step3_serum.product,
    skincareRoutine.morning.step4_moisturizer.product,
    skincareRoutine.evening.step3_treatment.product
  ].join(', ');

  const concerns = skinAnalysis.concerns.map(c => c.concern).join(', ');

  const prompt = `Create a realistic "after" image showing how this person's skin would look after consistently using their personalized skincare routine for 8-12 weeks.

CURRENT SKIN STATUS:
- Type: ${skinAnalysis.skinType}
- Concerns: ${concerns}
- Texture: ${skinAnalysis.skinTexture.smoothness}

KEY PRODUCTS IN ROUTINE:
${keyProducts}

IMPROVEMENTS TO SHOW:
- Reduced ${concerns}
- Improved skin texture and smoothness
- Better hydration and glow
- More even skin tone
- Reduced visible pores
- Healthier, more radiant appearance

IMPORTANT GUIDELINES:
- Keep the person's identity, expression, pose, and features EXACTLY the same
- Only improve skin quality - no change to face structure, hair, makeup, clothing, or background
- Show realistic, achievable results (not overdone or fake-looking)
- Maintain natural skin texture (not plastic or overly smooth)
- The improvements should be visible but subtle and natural
- Focus on: hydration glow, reduced concerns, smoother texture, more even tone

Generate a realistic result showing healthier, well-cared-for skin after consistent use of the routine.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
            // Critical: Tell the model to output images
            responseModalities: ["Text", "Image"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate try-on');
    }

    const data = await response.json();

    // Extract the generated image and description
    let imageUrl = null;
    let description = null;
    let expectedChanges = [];

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          // Got an actual image!
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          description = part.text;
          // Try to extract expected changes from text
          const changesList = part.text.match(/[-•]\s+(.+)/g);
          if (changesList) {
            expectedChanges = changesList.map(item => item.replace(/^[-•]\s+/, '').trim());
          }
        }
      }
    }

    // If no image was generated, throw an error
    if (!imageUrl) {
      throw new Error('Failed to generate preview image. Please try again.');
    }

    return {
      success: true,
      imageUrl,
      description: description || 'Your skin would show visible improvements with consistent use of this routine.',
      expectedChanges: expectedChanges.length > 0 ? expectedChanges : [
        'Reduced visible concerns',
        'Improved skin texture and smoothness',
        'Better hydration and glow',
        'More even skin tone',
        'Healthier, more radiant appearance'
      ]
    };

  } catch (error) {
    console.error('Virtual try-on error:', error);
    throw error;
  }
}

/**
 * Generate makeup try-on result
 * Shows the makeup look with specific products applied
 */
export async function generateMakeupProductResults(imageBase64, products, makeupLook) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Remove data URL prefix if present
  const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const productList = Object.entries(products)
    .filter(([key]) => key !== 'totalEstimate')
    .map(([category, product]) => `${category}: ${product.brand} ${product.product}`)
    .join('\n');

  const prompt = `Visualize how this person would look with the following specific makeup products applied:

PRODUCTS TO APPLY:
${productList}

MAKEUP STYLE:
${makeupLook.occasion || 'Natural'} look with ${makeupLook.personality || 'classic'} style

APPLICATION GUIDELINES:
- Apply makeup exactly as these specific products would appear
- Show realistic product finish and color payoff
- Maintain the person's natural features and identity
- Keep expression, pose, hair, and background unchanged
- Show professional makeup application technique
- Colors should match the product descriptions
- Blend naturally for a polished but realistic result

Create a realistic result showing how this person looks with these exact products professionally applied.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 4096,
            // Critical: Tell the model to output images
            responseModalities: ["Text", "Image"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate try-on');
    }

    const data = await response.json();

    // Extract the generated image and description
    let imageUrl = null;
    let description = null;
    let expectedChanges = [];

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          // Got an actual image!
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        } else if (part.text) {
          description = part.text;
          // Try to extract expected changes from text
          const changesList = part.text.match(/[-•]\s+(.+)/g);
          if (changesList) {
            expectedChanges = changesList.map(item => item.replace(/^[-•]\s+/, '').trim());
          }
        }
      }
    }

    // If no image was generated, throw an error
    if (!imageUrl) {
      throw new Error('Failed to generate preview image. Please try again.');
    }

    return {
      success: true,
      imageUrl,
      description: description || 'Your makeup would look beautiful with these specific products.',
      expectedChanges: expectedChanges.length > 0 ? expectedChanges : [
        'Professional makeup application',
        'Enhanced facial features',
        'Polished, finished look',
        'Product-specific colors and finishes'
      ]
    };

  } catch (error) {
    console.error('Makeup try-on error:', error);
    throw error;
  }
}

/**
 * Compare before and after for skincare
 */
export function compareSkincareResults(beforeImage, analysisResults) {
  return {
    before: {
      image: beforeImage,
      concerns: analysisResults.concerns,
      texture: analysisResults.skinTexture
    },
    after: {
      improvements: analysisResults.recommendations.focusAreas,
      expectedResults: 'Healthier, more radiant skin with reduced concerns'
    }
  };
}
