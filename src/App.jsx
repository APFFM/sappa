import { useState, useEffect } from 'react';
import ChatForm from './components/ChatForm';
import ChatDisplay from './components/ChatDisplay';
import SuggestionButtons from './components/SuggestionButtons';
import LoadingIndicator from './components/LoadingIndicator';
import WelcomeGuide from './components/WelcomeGuide';
import ProductRecommendations from './components/ProductRecommendations';
import ThemeToggle from './components/ThemeToggle';
import SkinAnalysisDashboard from './components/SkinAnalysisDashboard';
import ApiKeySettings from './components/ApiKeySettings';
import MakeupRecommender from './components/MakeupRecommender';
import styles from './App.module.css';
import { detectLanguage, getLanguageInstruction, getLanguageName } from './services/languageService';

function App() {
  const [messages, setMessages] = useState(() => {
    // Load saved messages from localStorage on initial mount
    try {
      const savedMessages = localStorage.getItem('chat_messages');
      return savedMessages ? JSON.parse(savedMessages) : [];
    } catch (e) {
      console.error('Error loading chat history:', e);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [error, setError] = useState(null);
  const [activeDrawer, setActiveDrawer] = useState(null); // 'guide' | 'products' | null
  const [isMobile, setIsMobile] = useState(false);
  const [showMakeupRecommender, setShowMakeupRecommender] = useState(false);

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

    // Add API key verification - check both localStorage and environment variables
    const hasLocalStorageKey = localStorage.getItem('openai_api_key');
    const hasEnvKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!hasLocalStorageKey && !hasEnvKey) {
      setError('OpenAI API key is missing. Please add your API key in the settings (🔑 button).');
      console.error('OpenAI API key is not set');
    }

    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem('chat_messages', JSON.stringify(messages));
      } catch (e) {
        console.error('Error saving chat history:', e);
      }
    }
  }, [messages]);

  const getApiKey = () => {
    // First check localStorage for user-provided key (from ApiKeySettings)
    const localStorageKey = localStorage.getItem('openai_api_key');
    if (localStorageKey && localStorageKey.trim()) {
      return localStorageKey.trim();
    }

    // Fall back to environment variables
    const envKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!envKey) {
      throw new Error('OpenAI API key is not configured. Please add your API key in the settings (🔑 button).');
    }
    return envKey.trim();
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

      // Detect user's language and get instruction
      const detectedLang = detectLanguage(userMessage);
      const languageInstruction = getLanguageInstruction(detectedLang);
      console.log('Detected language:', getLanguageName(detectedLang));

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
          1. Start with "✨ Hey beautiful!" or a similar warm greeting (adapt greeting to user's language)
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
          "✨ Hey gorgeous! I'm loving your natural glow! Let's chat about how to enhance that radiance even more..."${languageInstruction}`
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
            image: image,
            language: detectedLang
          },
          {
            role: 'assistant',
            content: formattedContent,
            audioContent: audioSummary,
            language: detectedLang // Pass language to assistant message for TTS
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

  const openDrawer = (drawer) => {
    setActiveDrawer(drawer);
    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    setActiveDrawer(null);
    document.body.style.overflow = '';
  };

  // Handle touch events for swipe-to-close
  const handleDrawerTouchStart = (e) => {
    const touch = e.touches[0];
    e.currentTarget.dataset.startY = touch.clientY;
  };

  const handleDrawerTouchMove = (e) => {
    const touch = e.touches[0];
    const startY = parseFloat(e.currentTarget.dataset.startY);
    const deltaY = touch.clientY - startY;
    
    if (deltaY > 0) {
      e.currentTarget.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleDrawerTouchEnd = (e) => {
    const startY = parseFloat(e.currentTarget.dataset.startY);
    const endY = e.changedTouches[0].clientY;
    const deltaY = endY - startY;
    
    if (deltaY > 100) {
      closeDrawer();
    }
    e.currentTarget.style.transform = '';
  };

  return (
    <div className={styles.container}>
      <ThemeToggle />
      <ApiKeySettings />
      <button
        className={styles.makeupRecommenderButton}
        onClick={() => setShowMakeupRecommender(true)}
        title="Personalized Makeup Recommender"
      >
        💄
      </button>
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

      {/* Mobile Navigation */}
      {isMobile && (
        <nav className={`${styles.mobileNav} ${styles.visible}`}>
          <button
            className={`${styles.mobileNavButton} ${!activeDrawer ? styles.active : ''}`}
            onClick={closeDrawer}
            aria-label="Chat"
          >
            <span className={styles.mobileNavIcon}>💬</span>
            <span className={styles.mobileNavLabel}>Chat</span>
          </button>
          <button
            className={`${styles.mobileNavButton} ${activeDrawer === 'guide' ? styles.active : ''}`}
            onClick={() => openDrawer('guide')}
            aria-label="Welcome Guide"
          >
            <span className={styles.mobileNavIcon}>✨</span>
            <span className={styles.mobileNavLabel}>Guide</span>
          </button>
          <button
            className={`${styles.mobileNavButton} ${activeDrawer === 'products' ? styles.active : ''}`}
            onClick={() => openDrawer('products')}
            aria-label="Product Recommendations"
          >
            <span className={styles.mobileNavIcon}>💫</span>
            <span className={styles.mobileNavLabel}>Products</span>
          </button>
        </nav>
      )}

      {/* Overlay for drawers */}
      <div 
        className={`${styles.overlay} ${activeDrawer ? styles.visible : ''}`}
        onClick={closeDrawer}
        aria-hidden={!activeDrawer}
      />

      {/* Welcome Guide Drawer */}
      <div 
        className={`${styles.drawer} ${activeDrawer === 'guide' ? styles.visible : ''}`}
        onTouchStart={handleDrawerTouchStart}
        onTouchMove={handleDrawerTouchMove}
        onTouchEnd={handleDrawerTouchEnd}
        role="dialog"
        aria-label="Welcome Guide"
        aria-hidden={activeDrawer !== 'guide'}
      >
        <div className={styles.drawerHandle} />
        <button 
          className={styles.drawerClose}
          onClick={closeDrawer}
          aria-label="Close drawer"
        >
          ✕
        </button>
        <WelcomeGuide isMobile={true} />
      </div>

      {/* Product Recommendations Drawer */}
      <div 
        className={`${styles.drawer} ${activeDrawer === 'products' ? styles.visible : ''}`}
        onTouchStart={handleDrawerTouchStart}
        onTouchMove={handleDrawerTouchMove}
        onTouchEnd={handleDrawerTouchEnd}
        role="dialog"
        aria-label="Product Recommendations"
        aria-hidden={activeDrawer !== 'products'}
      >
        <div className={styles.drawerHandle} />
        <button 
          className={styles.drawerClose}
          onClick={closeDrawer}
          aria-label="Close drawer"
        >
          ✕
        </button>
        <ProductRecommendations messages={messages} isMobile={true} />
      </div>

      {/* Skin Analysis Dashboard */}
      <SkinAnalysisDashboard messages={messages} />

      {/* Makeup Recommender Modal */}
      {showMakeupRecommender && (
        <MakeupRecommender
          onClose={() => setShowMakeupRecommender(false)}
        />
      )}
    </div>
  );
}

export default App;
