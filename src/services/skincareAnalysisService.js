/**
 * Skincare Analysis Service
 * Uses Gemini API to analyze skin and provide personalized product recommendations
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
 * Analyze skin from uploaded image
 * Detects: skin type, concerns, tone, estimated age, texture issues
 */
export async function analyzeSkinFromImage(imageBase64) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Remove data URL prefix if present
  const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

  const prompt = `You are an expert dermatologist and skincare specialist. Analyze this person's facial skin in detail.

Provide a comprehensive skin analysis in the following JSON format:

{
  "skinType": "oily|dry|combination|normal|sensitive",
  "skinTone": "fair|light|medium|tan|deep|dark",
  "estimatedAge": 25,
  "ethnicity": "Caucasian|African|Asian|Hispanic|Middle Eastern|Mixed",
  "concerns": [
    {
      "concern": "concern name (e.g., acne, dark spots, fine lines, etc.)",
      "severity": "mild|moderate|severe",
      "description": "brief description of the issue"
    }
  ],
  "skinTexture": {
    "smoothness": "smooth|slightly rough|rough",
    "poreSize": "small|medium|large",
    "hydration": "well-hydrated|slightly dry|very dry|oily"
  },
  "recommendations": {
    "focusAreas": ["list of main areas to focus on"],
    "avoidIngredients": ["ingredients to avoid based on skin type"],
    "beneficialIngredients": ["key ingredients that would help"]
  },
  "personalizedNote": "A warm, encouraging note about their skin with 2-3 sentences"
}

Be specific, accurate, and professional. Focus on visible skin characteristics. Return ONLY the JSON, no other text.`;

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
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to analyze skin');
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Skin analysis error:', error);
    throw error;
  }
}

/**
 * Get personalized 5-step skincare routine with product recommendations
 */
export async function getSkincareRoutine(skinAnalysis, location, manualAge = null) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const age = manualAge || skinAnalysis.estimatedAge;
  const { skinType, skinTone, ethnicity, concerns, skinTexture, recommendations } = skinAnalysis;

  const concernsList = concerns.map(c => `${c.concern} (${c.severity})`).join(', ');
  const focusAreas = recommendations.focusAreas.join(', ');
  const beneficialIngredients = recommendations.beneficialIngredients.join(', ');

  const prompt = `You are a skincare expert. Create a personalized 5-STEP skincare routine with specific product recommendations.

CLIENT PROFILE:
- Age: ${age} years old
- Skin Type: ${skinType}
- Skin Tone: ${skinTone}
- Ethnicity: ${ethnicity}
- Location: ${location.city}, ${location.country}
- Main Concerns: ${concernsList}
- Skin Texture: ${skinTexture.smoothness}, ${skinTexture.poreSize} pores, ${skinTexture.hydration}
- Focus Areas: ${focusAreas}
- Key Ingredients Needed: ${beneficialIngredients}

Provide recommendations in this EXACT JSON format with REAL products available internationally and in ${location.country}:

{
  "routineSummary": "2-3 sentence overview of the routine approach",
  "morning": {
    "step1_cleanser": {
      "stepName": "Gentle Cleanse",
      "product": "Specific Product Name",
      "brand": "Brand Name",
      "price": "$XX",
      "keyIngredients": ["ingredient1", "ingredient2"],
      "benefits": "Why this product for their skin",
      "application": "How to use it",
      "searchQuery": "brand product name cleanser"
    },
    "step2_toner": {
      "stepName": "Tone & Balance",
      "product": "Product Name",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["ingredient1", "ingredient2"],
      "benefits": "Benefits",
      "application": "How to apply",
      "searchQuery": "search term"
    },
    "step3_serum": {
      "stepName": "Treat & Target",
      "product": "Serum Name",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["active ingredients"],
      "benefits": "What it treats",
      "application": "Application method",
      "searchQuery": "search term"
    },
    "step4_moisturizer": {
      "stepName": "Hydrate & Lock",
      "product": "Moisturizer Name",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["ingredients"],
      "benefits": "Hydration benefits",
      "application": "How to apply",
      "searchQuery": "search term"
    },
    "step5_sunscreen": {
      "stepName": "Protect (SPF 30+)",
      "product": "Sunscreen Name",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["SPF type", "other ingredients"],
      "benefits": "Why this SPF",
      "application": "Application tips",
      "searchQuery": "search term"
    }
  },
  "evening": {
    "step1_cleanser": {
      "stepName": "Deep Cleanse",
      "product": "Product (can be same or different from AM)",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["ingredients"],
      "benefits": "Evening cleansing benefits",
      "application": "Double cleanse if needed",
      "searchQuery": "search term"
    },
    "step2_toner": {
      "stepName": "Prep & Restore",
      "product": "Product Name",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["ingredients"],
      "benefits": "Benefits",
      "application": "How to apply",
      "searchQuery": "search term"
    },
    "step3_treatment": {
      "stepName": "Active Treatment",
      "product": "Treatment/Serum Name",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["active ingredients like retinol, AHA, BHA"],
      "benefits": "Overnight treatment benefits",
      "application": "Evening application",
      "searchQuery": "search term"
    },
    "step4_eyeCream": {
      "stepName": "Eye Care",
      "product": "Eye Cream Name",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["ingredients"],
      "benefits": "Eye area benefits",
      "application": "Gentle tapping motion",
      "searchQuery": "search term"
    },
    "step5_nightCream": {
      "stepName": "Nourish & Repair",
      "product": "Night Cream/Moisturizer",
      "brand": "Brand",
      "price": "$XX",
      "keyIngredients": ["ingredients"],
      "benefits": "Overnight repair",
      "application": "How to apply",
      "searchQuery": "search term"
    }
  },
  "weeklyTreatments": [
    {
      "treatment": "Treatment type (mask, exfoliant, etc.)",
      "product": "Product Name",
      "brand": "Brand",
      "price": "$XX",
      "frequency": "2x per week",
      "benefits": "Benefits",
      "searchQuery": "search term"
    }
  ],
  "totalMonthlyInvestment": "$XXX - $XXX",
  "ethnicityConsiderations": "Specific advice for ${ethnicity} skin, including hyperpigmentation prevention, product absorption, etc.",
  "locationAdvice": "Skincare considerations for ${location.city}, ${location.country} climate and environment",
  "ageSpecificTips": [
    "Age-appropriate skincare tip for ${age}-year-old skin"
  ],
  "lifestyleRecommendations": [
    "Diet tip",
    "Sleep tip",
    "Lifestyle habit"
  ]
}

Use REAL brands like: CeraVe, La Roche-Posay, The Ordinary, Paula's Choice, Neutrogena, Olay, SK-II, Drunk Elephant, Sunday Riley, Kiehl's, Clinique, Estée Lauder, etc. Consider affordability and availability in ${location.country}.

Return ONLY the JSON, no other text.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get skincare routine');
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      throw new Error('No response from AI');
    }

    // Parse JSON from response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Skincare routine error:', error);
    throw error;
  }
}

/**
 * Generate shopping URLs
 */
export function getProductSearchUrls(searchQuery) {
  const encodedQuery = encodeURIComponent(searchQuery);
  return {
    amazon: `https://www.amazon.com/s?k=${encodedQuery}`,
    sephora: `https://www.sephora.com/search?keyword=${encodedQuery}`,
    ulta: `https://www.ulta.com/search?q=${encodedQuery}`,
    lookfantastic: `https://www.lookfantastic.com/search?search=${encodedQuery}`,
  };
}
