# Gemini API Setup Guide 🔑

## Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

## Configuration

### Step 1: Create Environment File

Create a `.env` file in the project root:

```bash
# In project root directory
touch .env
```

### Step 2: Add Your API Key

Open `.env` and add:

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

**Example:**
```env
VITE_GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwx
```

### Step 3: Restart Development Server

```bash
npm run dev
```

## Features Enabled

With Gemini API configured, you unlock:

### 1. **AI Facial Analysis** 📊
- Skin type detection (oily, dry, combination, etc.)
- Face shape analysis
- Skin tone and undertone identification
- Personalized recommendations

### 2. **Virtual Makeup Try-On** 💄
- **Real AI-generated makeup images**
- 5 professional looks (Natural, Glam, Fresh, Evening, Radiant)
- Adjustable intensity (0-100%)
- HD quality results
- Before/after comparison slider

### 3. **Skin Analysis Dashboard** 📈
- AI-powered skin health scoring
- 6 detailed metrics
- Personalized skincare recommendations
- Progress tracking

## API Models Used

### Gemini 2.5 Flash (gemini-2.0-flash-exp)
- **Purpose**: Image-to-image generation for makeup application
- **Input**: Photo + makeup style prompt
- **Output**: Photo with professionally applied makeup
- **Response Time**: 5-15 seconds
- **Max Image Size**: 4MB

### Gemini 1.5 Flash (gemini-1.5-flash)
- **Purpose**: Image analysis and text generation
- **Input**: Photo + analysis prompt
- **Output**: JSON with facial analysis
- **Response Time**: 2-5 seconds

## API Limits & Pricing

### Free Tier
- **60 requests per minute**
- **1,500 requests per day**
- **Perfect for development and testing**

### Paid Tier (If needed)
- Increased rate limits
- Priority access
- See [Google AI Pricing](https://ai.google.dev/pricing)

## Security Best Practices ✅

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Use `.env.example` as template

2. **Don't expose API key in client code**
   - Always use environment variables
   - Backend calls preferred for production

3. **Rotate keys regularly**
   - Generate new keys periodically
   - Revoke old keys

4. **Monitor usage**
   - Check [API Console](https://console.cloud.google.com)
   - Set up billing alerts

## Troubleshooting

### "Gemini API key not configured"
- Check `.env` file exists in project root
- Verify `VITE_GEMINI_API_KEY` is set
- Restart dev server after adding key

### "Failed to generate makeup image"
- Check API key is valid
- Verify image is under 4MB
- Check console for detailed errors
- Ensure image format is JPEG or PNG

### "Rate limit exceeded"
- Wait 60 seconds and try again
- Reduce frequency of requests
- Consider upgrading to paid tier

### API Key Not Working
1. Verify key is correct (no extra spaces)
2. Check key permissions in AI Studio
3. Try regenerating the key
4. Ensure billing is enabled (if required)

## Testing the Integration

### 1. Check API Status

Open browser console and run:
```javascript
// Should show: "Gemini AI is ready"
console.log(import.meta.env.VITE_GEMINI_API_KEY ? 'Configured' : 'Not configured');
```

### 2. Test Facial Analysis

1. Upload a selfie in the app
2. Watch console for "AI Analysis Complete"
3. Check for analysis results

### 3. Test Makeup Generation

1. Click on uploaded photo
2. Click "✨ Try Virtual Makeup"
3. Select a look and intensity
4. Click "Generate AI Makeup"
5. Wait 10-15 seconds for result

## Environment Variables Reference

```env
# Required for chat and main features
VITE_OPENAI_API_KEY=your_openai_key_here

# Required for AI makeup and analysis
VITE_GEMINI_API_KEY=your_gemini_key_here
```

## Support

### Documentation
- [Gemini API Docs](https://ai.google.dev/docs)
- [Google GenAI SDK](https://github.com/google/generative-ai-js)

### Get Help
- Check browser console for errors
- Review API usage in AI Studio
- Open an issue on GitHub

## What's Next?

Once configured, you can:
- ✨ Generate unlimited makeup variations
- 📊 Get AI skin analysis
- 🎨 Download HD results
- 🔄 Try different looks instantly

**Enjoy your AI-powered beauty advisor!** 💄✨
