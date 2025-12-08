import { useState, useEffect } from 'react';
import ChatForm from './components/ChatForm';
import ChatDisplay from './components/ChatDisplay';
import SuggestionButtons from './components/SuggestionButtons';
import LoadingIndicator from './components/LoadingIndicator';
import WelcomeGuide from './components/WelcomeGuide';
import ProductRecommendations from './components/ProductRecommendations';
import styles from './App.module.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [error, setError] = useState(null);

  const MAX_TOKENS_PER_HOUR = 20000;
  const RATE_LIMIT_DURATION = 3600000; // 1 hour in milliseconds

  const BEAUTY_EMOJIS = {
    'hydration': '💧',
    'sun': '☀️',
    'protection': '🛡️',
    'skin': '✨',
    'analysis': '🔍',
    'routine': '⭐',
    'professional': '👩‍⚕️',
    'advice': '💫',
    'treatment': '🌟',
    'nutrition': '🥗',
    'sleep': '😴',
    'water': '💦',
    'beautiful': '🌸',
    'enhance': '✨',
    'care': '💝',
    'glow': '⭐',
    'natural': '🌿',
    'embrace': '🤗',
  };

  useEffect(() => {
    const resetTime = localStorage.getItem('tokenResetTime');
    if (!resetTime || Date.now() > parseInt(resetTime)) {
      localStorage.setItem('tokenCount', '0');
      localStorage.setItem('tokenResetTime', (Date.now() + RATE_LIMIT_DURATION).toString());
      setTokenCount(0);
    } else {
      setTokenCount(parseInt(localStorage.getItem('tokenCount') || '0'));
    }

    // Add API key verification
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      setError('OpenAI API key is missing. Please check your environment variables.');
      console.error('OpenAI API key is not set');
    }
  }, []);

  const getApiKey = () => {
    const key = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is not configured');
    }
    return key.trim();
  };

  const updateTokenCount = (newTokens) => {
    const updatedCount = tokenCount + newTokens;
    setTokenCount(updatedCount);
    localStorage.setItem('tokenCount', updatedCount.toString());
  };

  const formatResponse = (content) => {
    // First pass: fix specific patterns and cleanup
    let cleanContent = content
      // Fix SPF numbers and other common number patterns
      .replace(/SPF\s*(\d+)\s*(\d+)/g, 'SPF$1$2')
      .replace(/(\d+)\s*\n+\s*(\d+)/g, '$1$2')
      .replace(/(\d+)\s+(\d+)/g, '$1$2')
      // Clean up other formatting
      .replace(/#+\s*/g, '')
      .replace(/\*+\s*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/(?<=\d)\s+(?=\d)/g, '')
      .replace(/^\d+\s*\.\s*/gm, '')
      .replace(/([A-Za-z])-(\d)/g, '$1 $2')
      .replace(/(\d)-([A-Za-z])/g, '$1 $2')
      .trim();

    // Second pass: fix specific formatting patterns
    cleanContent = cleanContent
      // Fix number-text spacing
      .replace(/(\d+)([A-Za-z])/g, '$1 $2')
      // Fix text-number spacing
      .replace(/([A-Za-z])(\d+)/g, '$1 $2')
      // Fix colons
      .replace(/([^:]):(?!\s)/g, '$1: ')
      .replace(/:\s*:/g, ':')
      .replace(/\s+-\s+/g, ': ')
      // Clean up multiple spaces
      .replace(/\s{2,}/g, ' ');

    // Third pass: structure sections
    const sections = cleanContent.split(/(?=[\p{Emoji}|✨|🌟])/gu);
    
    return sections.map(section => {
      // Process section content
      let processedSection = section
        .replace(/([\p{Emoji}|✨|🌟])\s*/gu, '$1 ')
        .replace(/(?<=:)([^\n])/g, ' $1')
        .trim();

      // Handle line breaks and bullet points
      processedSection = processedSection
        .split('\n')
        .map(line => {
          line = line.trim();
          // Add newlines before points
          if (line.includes(':')) {
            return '\n' + line;
          }
          return line;
        })
        .join('\n')
        .replace(/\n{3,}/g, '\n\n');

      return processedSection;
    }).join('\n\n');
  };

  const createSummary = (content) => {
    // Extract key points for audio
    const sections = content.split(/(?=[\p{Emoji}|✨|🌟])/gu);
    const summary = sections
      .map(section => {
        // Keep first sentence of each section
        const sentences = section.split(/[.!?]/)
          .filter(s => s.trim().length > 0)
          .slice(0, 1);
        return sentences.join('. ');
      })
      .filter(Boolean)
      .join(' ');

    return `Hey gorgeous! Here's the quick rundown: ${summary} Stay beautiful! 💖`;
  };

  const handleSubmit = async (message, image) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const apiKey = getApiKey();
      if (tokenCount >= MAX_TOKENS_PER_HOUR) {
        setError('Rate limit exceeded. Please try again in an hour.');
        setIsLoading(false);
        return;
      }

      let base64Image = null;
      if (image) {
        base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
        console.log('Processing image...');
      }

      // Construct context-aware prompt
      const userMessage = selectedPrompt || message;

      const payload = {
        model: "gpt-4-turbo-2024-04-09",
        messages: [
          {
            role: "system",
            content: `You are a friendly, enthusiastic beauty advisor - think of a supportive best friend or a Gossip Girl-style narrator, but focused on beauty and self-care. 

          Communication Style:
          - Use casual, warm, and engaging language
          - Add some playful comments and gentle humor
          - Be encouraging and uplifting
          - Speak directly to the user like a close friend
          - Keep a positive, energetic tone

          Response Structure:
          1. Start with "✨ Hey beautiful!" or a similar warm greeting
          2. Give a genuine, specific compliment
          3. Share advice in a conversational way
          4. End with an encouraging message and a friendly sign-off

          Remember to:
          - Keep responses concise and chatty
          - Use emojis to add personality
          - Be supportive and boost confidence
          - Make suggestions feel like friendly tips
          - End on a positive, uplifting note

          Example tone:
          "✨ Hey gorgeous! I'm loving your natural glow! Let's chat about how to enhance that radiance even more..."`
          },
          {
            role: "user",
            content: base64Image ? [
              { 
                type: "text", 
                text: `${userMessage} - Please analyze this image and provide specific advice based on what you see.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "auto"
                }
              }
            ] : [
              {
                type: "text",
                text: userMessage
              }
            ]
          }
        ],
        max_tokens: 1000
      };

      console.log('Sending request to OpenAI...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      console.log('Received response:', data);
      
      if (data.choices && data.choices[0]) {
        const fullContent = data.choices[0].message.content;
        const formattedContent = formatResponse(fullContent);
        const audioSummary = createSummary(fullContent);
        
        setMessages([...messages, 
          { 
            role: 'user', 
            content: message,
            image: image 
          },
          { 
            role: 'assistant', 
            content: formattedContent,
            audioContent: audioSummary
          }
        ]);
        updateTokenCount(data.usage.total_tokens);
      }
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message || 'Failed to connect to OpenAI API');
      setMessages([...messages,
        { role: 'user', content: message, image: image },
        { role: 'assistant', content: `Error: ${error.message}. Please try again with a smaller image or different question.` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setSelectedPrompt(suggestion);
    if (suggestion.includes('Analyze')) {
      setMessages([
        { 
          role: 'assistant', 
          content: '📸 Perfect! Now please upload a selfie, and I\'ll analyze your skin concerns and provide personalized recommendations!' 
        }
      ]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 data-text="Beauty Advisor">
          <span className={styles.sparkles}>✨</span>
          Beauty Advisor
          <span className={styles.sparkles}>✨</span>
        </h1>
        <p>Your Personal AI Beauty Expert</p>
      </div>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <WelcomeGuide />
        </aside>
        <main className={styles.mainContent}>
          {error && <div className={styles.error}>{error}</div>}
          <ChatDisplay messages={messages} />
          {isLoading && <LoadingIndicator />}
          <div className={styles.tokenInfo}>
            Tokens used: {tokenCount}/{MAX_TOKENS_PER_HOUR}
          </div>
          <SuggestionButtons 
            onSelect={handleSuggestionSelect}
            currentContext={messages.length > 0 ? 'specific-issues' : 'skin-concerns'}
          />
          <ChatForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
            selectedPrompt={selectedPrompt}
            onClearPrompt={() => setSelectedPrompt('')}
          />
        </main>
        <aside className={styles.sidebar}>
          <ProductRecommendations messages={messages} />
        </aside>
      </div>
    </div>
  );
}

export default App;
