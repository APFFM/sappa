/**
 * Gemini AI Service for Virtual Makeup Analysis
 * Uses Google's latest Gemini API for advanced image understanding
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Analyzes an image using Gemini Vision API
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} prompt - Analysis prompt
 * @returns {Promise<Object>} - Analysis results
 */
export async function analyzeImageWithGemini(imageBase64, prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64.split(',')[1] // Remove data:image/jpeg;base64, prefix
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini AI analysis failed:', error);
    throw error;
  }
}

/**
 * Analyzes facial features for makeup recommendations
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} - Facial analysis with makeup recommendations
 */
export async function analyzeFacialFeatures(imageBase64) {
  const prompt = `Analyze this face image and provide detailed makeup recommendations in JSON format. Include:

1. Face Shape (oval, round, square, heart, diamond)
2. Skin Type (oily, dry, combination, normal, sensitive)
3. Skin Tone (fair, light, medium, tan, deep, very deep)
4. Undertone (warm, cool, neutral)
5. Eye Shape (almond, round, hooded, monolid, downturned, upturned)
6. Eye Color
7. Lip Shape (thin, full, heart, bow, round)
8. Face Concerns (acne, wrinkles, dark circles, hyperpigmentation, etc.)

Then provide specific makeup recommendations for:
- Foundation shade and formula
- Concealer recommendations
- Best blush placement and color
- Eye makeup techniques
- Best lip colors
- Contouring strategy
- Highlighting placement
- Overall look suggestions (natural, glam, fresh, evening)

Return ONLY valid JSON with this structure:
{
  "analysis": {
    "faceShape": "string",
    "skinType": "string",
    "skinTone": "string",
    "undertone": "string",
    "eyeShape": "string",
    "eyeColor": "string",
    "lipShape": "string",
    "concerns": ["string"]
  },
  "recommendations": {
    "foundation": {
      "shade": "string",
      "formula": "string",
      "brands": ["string"]
    },
    "concealer": {
      "shades": ["string"],
      "application": "string"
    },
    "blush": {
      "colors": ["string"],
      "placement": "string"
    },
    "eyeMakeup": {
      "techniques": ["string"],
      "colors": ["string"]
    },
    "lipColors": ["string"],
    "contouring": {
      "areas": ["string"],
      "products": ["string"]
    },
    "highlighting": {
      "areas": ["string"],
      "intensity": "string"
    }
  },
  "looks": {
    "natural": "description",
    "glam": "description",
    "fresh": "description",
    "evening": "description",
    "radiant": "description"
  }
}`;

  try {
    const result = await analyzeImageWithGemini(imageBase64, prompt);
    
    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = result;
    if (result.includes('```json')) {
      jsonStr = result.split('```json')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      jsonStr = result.split('```')[1].split('```')[0].trim();
    }
    
    const analysis = JSON.parse(jsonStr);
    return analysis;
  } catch (error) {
    console.error('Failed to analyze facial features:', error);
    throw error;
  }
}

/**
 * Gets makeup application guidance for specific look
 * @param {Object} facialAnalysis - Previous facial analysis
 * @param {string} lookType - Type of look (natural, glam, fresh, evening, radiant)
 * @param {number} intensity - Makeup intensity (0-100)
 * @returns {Promise<Object>} - Step-by-step makeup guide
 */
export async function getMakeupApplicationGuide(facialAnalysis, lookType, intensity) {
  const prompt = `Based on this facial analysis:
${JSON.stringify(facialAnalysis.analysis, null, 2)}

Create a detailed step-by-step makeup application guide for a "${lookType}" look with ${intensity}% intensity.

Return ONLY valid JSON with this structure:
{
  "lookName": "string",
  "difficulty": "beginner|intermediate|advanced",
  "estimatedTime": "string",
  "requiredProducts": [
    {
      "product": "string",
      "purpose": "string",
      "optional": boolean
    }
  ],
  "steps": [
    {
      "stepNumber": number,
      "title": "string",
      "description": "string",
      "tips": ["string"],
      "estimatedTime": "string"
    }
  ],
  "proTips": ["string"],
  "commonMistakes": ["string"]
}`;

  try {
    const result = await analyzeImageWithGemini('data:image/jpeg;base64,', prompt);
    
    let jsonStr = result;
    if (result.includes('```json')) {
      jsonStr = result.split('```json')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      jsonStr = result.split('```')[1].split('```')[0].trim();
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to get makeup guide:', error);
    throw error;
  }
}

/**
 * Analyzes skin health and provides skincare recommendations
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} - Skin health analysis
 */
export async function analyzeSkinHealth(imageBase64) {
  const prompt = `Analyze the skin in this image and provide a detailed skin health assessment in JSON format.

Evaluate and score (0-100) these aspects:
1. Hydration level
2. Texture smoothness
3. Clarity (blemishes, spots)
4. Firmness and elasticity
5. Radiance and glow
6. Even tone

Also identify:
- Skin concerns (acne, wrinkles, dark circles, hyperpigmentation, redness, etc.)
- Skin type (oily, dry, combination, normal, sensitive)
- Recommended skincare routine
- Product recommendations
- Lifestyle suggestions

Return ONLY valid JSON with this structure:
{
  "scores": {
    "hydration": number,
    "texture": number,
    "clarity": number,
    "firmness": number,
    "radiance": number,
    "evenTone": number,
    "overall": number
  },
  "skinType": "string",
  "concerns": [
    {
      "issue": "string",
      "severity": "mild|moderate|severe",
      "recommendation": "string"
    }
  ],
  "routine": {
    "morning": [
      {
        "step": "string",
        "product": "string",
        "reason": "string"
      }
    ],
    "evening": [
      {
        "step": "string",
        "product": "string",
        "reason": "string"
      }
    ]
  },
  "productRecommendations": [
    {
      "category": "string",
      "products": ["string"],
      "priority": "high|medium|low"
    }
  ],
  "lifestyleTips": ["string"]
}`;

  try {
    const result = await analyzeImageWithGemini(imageBase64, prompt);
    
    let jsonStr = result;
    if (result.includes('```json')) {
      jsonStr = result.split('```json')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      jsonStr = result.split('```')[1].split('```')[0].trim();
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to analyze skin health:', error);
    throw error;
  }
}

/**
 * Check if Gemini API is available
 * @returns {boolean} - Whether API key is configured
 */
export function isGeminiAvailable() {
  return !!GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here';
}

/**
 * Gets precise makeup application coordinates from Gemini AI
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} lookType - Type of makeup look
 * @param {number} intensity - Makeup intensity (0-100)
 * @returns {Promise<Object>} - Precise coordinates for makeup application
 */
export async function getMakeupCoordinates(imageBase64, lookType, intensity) {
  const prompt = `Analyze this face image and provide EXACT pixel coordinates for makeup application.

For a "${lookType}" look with ${intensity}% intensity, provide:

1. Face Detection:
   - Bounding box coordinates (x, y, width, height)
   - Face landmarks for key points

2. Foundation Area:
   - Entire face region coordinates
   - Recommended opacity and blend mode

3. Concealer Points:
   - Under-eye triangle coordinates (left and right)
   - Blemish covering areas

4. Blush Placement:
   - Cheek centers (left and right)
   - Radius and intensity for each
   - Recommended color in RGB

5. Eye Makeup:
   - Eyelid regions (left and right)
   - Crease line coordinates
   - Lower lash line
   - Recommended colors and gradients

6. Lip Coordinates:
   - Upper lip curve points
   - Lower lip curve points
   - Cupid's bow center
   - Recommended lip color RGB

7. Contouring Lines:
   - Cheekbone paths
   - Jawline points
   - Nose bridge coordinates

8. Highlighting Points:
   - Cheekbone highlights
   - Nose bridge
   - Cupid's bow
   - Inner eye corners

Return ONLY valid JSON with this structure:
{
  "faceBounds": {
    "x": number,
    "y": number,
    "width": number,
    "height": number
  },
  "foundation": {
    "region": [[x, y], ...],
    "color": {"r": number, "g": number, "b": number},
    "opacity": number
  },
  "concealer": {
    "areas": [
      {
        "points": [[x, y], ...],
        "opacity": number
      }
    ]
  },
  "blush": {
    "left": {
      "center": {"x": number, "y": number},
      "radius": number,
      "color": {"r": number, "g": number, "b": number},
      "intensity": number
    },
    "right": {
      "center": {"x": number, "y": number},
      "radius": number,
      "color": {"r": number, "g": number, "b": number},
      "intensity": number
    }
  },
  "eyeshadow": {
    "left": {
      "lid": [[x, y], ...],
      "crease": [[x, y], ...],
      "colors": [
        {"r": number, "g": number, "b": number, "position": "lid|crease|outer"}
      ]
    },
    "right": {
      "lid": [[x, y], ...],
      "crease": [[x, y], ...],
      "colors": [
        {"r": number, "g": number, "b": number, "position": "lid|crease|outer"}
      ]
    }
  },
  "lips": {
    "upperLip": [[x, y], ...],
    "lowerLip": [[x, y], ...],
    "color": {"r": number, "g": number, "b": number},
    "gloss": number
  },
  "contour": {
    "cheeks": {
      "left": [[x, y], ...],
      "right": [[x, y], ...]
    },
    "nose": [[x, y], ...],
    "jawline": [[x, y], ...]
  },
  "highlight": {
    "points": [
      {
        "position": {"x": number, "y": number},
        "intensity": number,
        "radius": number
      }
    ]
  }
}`;

  try {
    const result = await analyzeImageWithGemini(imageBase64, prompt);
    
    let jsonStr = result;
    if (result.includes('```json')) {
      jsonStr = result.split('```json')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      jsonStr = result.split('```')[1].split('```')[0].trim();
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to get makeup coordinates:', error);
    throw error;
  }
}

/**
 * Alternative: Use TensorFlow Face Mesh + Gemini recommendations
 * This provides real-time face tracking coordinates
 */
export async function getEnhancedMakeupData(imageBase64, lookType, intensity, faceMeshData) {
  const prompt = `Given these facial landmarks from TensorFlow Face Mesh:
${JSON.stringify(faceMeshData, null, 2)}

And for a "${lookType}" makeup look with ${intensity}% intensity, provide:

1. Exact makeup colors (RGB values) for:
   - Foundation (based on skin tone)
   - Blush (2-3 shades for gradient)
   - Eyeshadow (main, crease, highlight colors)
   - Lip color (main + gloss)
   - Contour shade
   - Highlighter color

2. Application intensities for each area (0.0-1.0)

3. Blend modes and techniques for realistic rendering

4. Product finish types (matte, satin, glossy, shimmer)

Return ONLY valid JSON with this structure:
{
  "colors": {
    "foundation": {"r": number, "g": number, "b": number, "coverage": number},
    "blush": [
      {"r": number, "g": number, "b": number, "position": "inner|outer"}
    ],
    "eyeshadow": {
      "lid": {"r": number, "g": number, "b": number},
      "crease": {"r": number, "g": number, "b": number},
      "highlight": {"r": number, "g": number, "b": number}
    },
    "lips": {
      "base": {"r": number, "g": number, "b": number},
      "gloss": {"r": number, "g": number, "b": number, "opacity": number}
    },
    "contour": {"r": number, "g": number, "b": number},
    "highlighter": {"r": number, "g": number, "b": number}
  },
  "intensities": {
    "foundation": number,
    "blush": number,
    "eyeshadow": number,
    "lips": number,
    "contour": number,
    "highlight": number
  },
  "blendModes": {
    "foundation": "multiply|overlay|normal",
    "blush": "multiply|overlay|normal",
    "eyeshadow": "multiply|overlay|normal",
    "lips": "multiply|overlay|normal",
    "contour": "multiply|overlay|normal",
    "highlight": "screen|overlay|normal"
  },
  "finishes": {
    "foundation": "matte|satin|dewy",
    "blush": "matte|satin|shimmer",
    "eyeshadow": "matte|satin|shimmer|metallic",
    "lips": "matte|satin|glossy|cream"
  }
}`;

  try {
    const result = await analyzeImageWithGemini('data:image/jpeg;base64,', prompt);
    
    let jsonStr = result;
    if (result.includes('```json')) {
      jsonStr = result.split('```json')[1].split('```')[0].trim();
    } else if (result.includes('```')) {
      jsonStr = result.split('```')[1].split('```')[0].trim();
    }
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Failed to get enhanced makeup data:', error);
    throw error;
  }
}


/**
 * Get API status and information
 * @returns {Object} - API status information
 */
export function getGeminiStatus() {
  return {
    available: isGeminiAvailable(),
    configured: !!GEMINI_API_KEY,
    message: isGeminiAvailable() 
      ? "Gemini AI is ready for advanced image analysis"
      : "Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file",
    note: "Note: Gemini provides image analysis. For image generation, consider using Imagen 3 (Vertex AI), Stability AI, or DALL-E."
  };
}
