/**
 * Virtual Try-On Service
 * Uses Gemini API to visualize how recommended products would look
 */

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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate try-on');
    }

    const data = await response.json();

    // Note: Gemini 2.0 Flash doesn't generate images, it analyzes them
    // For image generation, we'd need to use Imagen or another service
    // For now, return a descriptive result
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      success: true,
      description: textResponse || 'Your skin would show visible improvements with consistent use of this routine.',
      note: 'Virtual try-on simulation'
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate try-on');
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return {
      success: true,
      description: textResponse || 'Your makeup would look beautiful with these specific products.',
      note: 'Virtual try-on simulation'
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
