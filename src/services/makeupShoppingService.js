/**
 * Makeup Shopping & Appointment Service
 * Uses Gemini API to recommend products and find makeup artists
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
 * Generate shoppable product recommendations based on makeup look
 */
export async function getProductRecommendations(lookDetails) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const { occasion, personality, makeupType, skinTone, intensity, imageAnalysis, budget, country } = lookDetails;

  // Budget tier guidance for makeup
  const budgetGuidance = {
    budget: 'Budget-friendly products under $30 each (drugstore brands: Maybelline, L\'Oreal, NYX, e.l.f., ColourPop, Wet n Wild, etc.)',
    middle: 'Mid-range products $30-80 each (MAC, Urban Decay, Too Faced, Anastasia Beverly Hills, NARS, Benefit, etc.)',
    high: 'Premium products $80-150 each (Charlotte Tilbury, Natasha Denona, Pat McGrath Labs, Hourglass, Tom Ford, etc.)',
    luxury: 'Luxury products $150+ each (Tom Ford, Chanel, Dior, Giorgio Armani, La Mer makeup, Sisley, etc.)'
  };

  const budgetTier = budget || 'middle';

  const prompt = `You are a makeup product expert. Based on the following makeup look preferences, recommend specific, real products that can be purchased.

LOOK DETAILS:
- Occasion: ${occasion || 'General'}
- Style: ${personality || 'Classic'}
- Makeup Type: ${makeupType || 'Natural'}
- Skin Tone: ${skinTone || 'Medium'}
- Intensity: ${intensity || 50}% (${intensity < 35 ? 'subtle' : intensity > 65 ? 'bold' : 'moderate'})
- Budget Tier: ${budgetTier.toUpperCase()} - ${budgetGuidance[budgetTier.toLowerCase()]}
- Location: ${country || 'International'}
${imageAnalysis ? `- AI Analysis: ${imageAnalysis}` : ''}

IMPORTANT: Recommend ONLY products that fit within the ${budgetTier.toUpperCase()} budget tier. All products must be available in ${country || 'major markets'}.

Provide product recommendations in the following JSON format. Include REAL product names from actual brands appropriate for the ${budgetTier} tier:

{
  "foundation": {
    "product": "Product Name",
    "brand": "Brand Name",
    "shade": "Recommended shade range",
    "price": "$XX",
    "searchQuery": "brand product name foundation"
  },
  "concealer": {
    "product": "Product Name",
    "brand": "Brand Name",
    "shade": "Recommended shade",
    "price": "$XX",
    "searchQuery": "brand product name concealer"
  },
  "eyeshadow": {
    "product": "Product/Palette Name",
    "brand": "Brand Name",
    "colors": ["color1", "color2"],
    "price": "$XX",
    "searchQuery": "brand palette name eyeshadow"
  },
  "eyeliner": {
    "product": "Product Name",
    "brand": "Brand Name",
    "color": "Color",
    "price": "$XX",
    "searchQuery": "brand product name eyeliner"
  },
  "mascara": {
    "product": "Product Name",
    "brand": "Brand Name",
    "effect": "Volumizing/Lengthening/etc",
    "price": "$XX",
    "searchQuery": "brand product name mascara"
  },
  "lipstick": {
    "product": "Product Name",
    "brand": "Brand Name",
    "shade": "Shade name",
    "finish": "Matte/Satin/Gloss",
    "price": "$XX",
    "searchQuery": "brand product name lipstick shade"
  },
  "blush": {
    "product": "Product Name",
    "brand": "Brand Name",
    "shade": "Shade name",
    "price": "$XX",
    "searchQuery": "brand product name blush"
  },
  "highlighter": {
    "product": "Product Name",
    "brand": "Brand Name",
    "shade": "Shade name",
    "price": "$XX",
    "searchQuery": "brand product name highlighter"
  },
  "settingSpray": {
    "product": "Product Name",
    "brand": "Brand Name",
    "price": "$XX",
    "searchQuery": "brand product name setting spray"
  },
  "totalEstimate": "$XXX - $XXX"
}

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
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get product recommendations');
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
    console.error('Product recommendation error:', error);
    throw error;
  }
}

/**
 * Search for makeup artists/salons in a location
 */
export async function searchMakeupArtists(city, country, lookType) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const prompt = `You are a local business expert. Find makeup artists and beauty salons in ${city}, ${country} that specialize in ${lookType || 'professional makeup'} services.

Provide recommendations in the following JSON format with REALISTIC business names and information for the given location:

{
  "location": "${city}, ${country}",
  "artists": [
    {
      "name": "Business/Artist Name",
      "type": "Makeup Artist/Beauty Salon/Bridal Studio",
      "specialty": "What they specialize in",
      "priceRange": "€XX - €XXX",
      "rating": "4.X/5",
      "services": ["Service 1", "Service 2", "Service 3"],
      "searchQuery": "makeup artist business name ${city}",
      "bookingTip": "How to book"
    }
  ],
  "searchTips": [
    "Tip for finding makeup artists in this area"
  ],
  "averagePrices": {
    "basicMakeup": "€XX - €XX",
    "bridalMakeup": "€XXX - €XXX",
    "specialEvent": "€XX - €XXX",
    "lessonSession": "€XX - €XX"
  }
}

Include 4-5 realistic recommendations. If you don't know specific businesses in that location, suggest the types of places to search for and how to find them locally.

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
            temperature: 0.8,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to search for makeup artists');
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
    console.error('Makeup artist search error:', error);
    throw error;
  }
}

/**
 * Generate Amazon search URL for a product
 */
export function getAmazonSearchUrl(searchQuery) {
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.amazon.com/s?k=${encodedQuery}`;
}

/**
 * Generate Sephora search URL
 */
export function getSephoraSearchUrl(searchQuery) {
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.sephora.com/search?keyword=${encodedQuery}`;
}

/**
 * Generate Ulta search URL
 */
export function getUltaSearchUrl(searchQuery) {
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.ulta.com/search?q=${encodedQuery}`;
}

/**
 * Generate Google search URL for makeup artists
 */
export function getGoogleSearchUrl(searchQuery) {
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.google.com/search?q=${encodedQuery}`;
}

/**
 * Generate Google Maps search URL
 */
export function getGoogleMapsUrl(searchQuery, city, country) {
  const fullQuery = `${searchQuery} in ${city}, ${country}`;
  const encodedQuery = encodeURIComponent(fullQuery);
  return `https://www.google.com/maps/search/${encodedQuery}`;
}
