import { useState, useRef } from 'react';
import styles from './AudioMessage.module.css';
import { getElevenLabsVoice, getElevenLabsModel, getOpenAIVoice, getLanguageName } from '../services/languageService';

const ELEVEN_LABS_KEY = import.meta.env.VITE_ELEVEN_LABS_KEY;

export default function AudioMessage({ text, isSummary, language = 'en' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const audioRef = useRef(null);

  // Get the appropriate voice based on detected language
  const elevenLabsVoiceId = getElevenLabsVoice(language);
  const elevenLabsModel = getElevenLabsModel(language);
  const openAIVoice = getOpenAIVoice(language);

  const generateOpenAISpeech = async () => {
    // Get OpenAI API key from localStorage or env
    const apiKey = localStorage.getItem('openai_api_key') || import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: openAIVoice,
        input: text,
        speed: 0.9, // Slightly slower for better comprehension
      }),
    });
    return response;
  };

  const generateElevenLabsSpeech = async () => {
    if (!ELEVEN_LABS_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: elevenLabsModel, // Use multilingual model for non-English
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.75,
            style: 0.45,
            speaking_rate: 0.9,
            pause_duration: 0.1
          }
        })
      }
    );
    return response;
  };

  const generateSpeech = async () => {
    setIsLoading(true);
    try {
      console.log(`Generating speech in ${getLanguageName(language)} using ${useElevenLabs ? 'ElevenLabs' : 'OpenAI'}`);

      const response = useElevenLabs ?
        await generateElevenLabsSpeech() :
        await generateOpenAISpeech();

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS Error:', errorText);
        throw new Error('Speech generation failed');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }

      setAudioUrl(url);
    } catch (error) {
      console.error('Speech Error:', error);
      // Try fallback to other provider if one fails
      if (useElevenLabs) {
        console.log('Falling back to OpenAI TTS...');
        setUseElevenLabs(false);
        try {
          const fallbackResponse = await generateOpenAISpeech();
          if (fallbackResponse.ok) {
            const audioBlob = await fallbackResponse.blob();
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayClick = async () => {
    if (!audioUrl) {
      await generateSpeech();
    }
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    }
  };

  // Get language indicator emoji
  const getLanguageEmoji = () => {
    const langEmojis = {
      en: '🇬🇧',
      de: '🇩🇪',
      fr: '🇫🇷',
      es: '🇪🇸',
      it: '🇮🇹',
      pt: '🇵🇹',
      nl: '🇳🇱',
      ru: '🇷🇺',
      zh: '🇨🇳',
      ja: '🇯🇵',
      ko: '🇰🇷',
      ar: '🇸🇦',
      hi: '🇮🇳',
      tr: '🇹🇷',
      pl: '🇵🇱',
    };
    return langEmojis[language] || '🌍';
  };

  return (
    <div className={styles.audioContainer}>
      <button
        onClick={handlePlayClick}
        className={styles.playButton}
        disabled={isLoading}
        title={`Play ${isSummary ? 'summary' : 'response'} in ${getLanguageName(language)}`}
      >
        {isLoading ? '🎵' : isPlaying ? '⏸️' : isSummary ? '📝' : '🎧'}
      </button>
      <button
        onClick={() => {
          setUseElevenLabs(!useElevenLabs);
          setAudioUrl(null); // Reset audio when switching voice
        }}
        className={`${styles.voiceToggle} ${useElevenLabs ? styles.eleven : styles.openai}`}
        title={`Switch to ${useElevenLabs ? 'OpenAI' : 'ElevenLabs'} voice`}
      >
        {useElevenLabs ? '🎭' : '🤖'}
      </button>
      {language !== 'en' && (
        <span className={styles.languageIndicator} title={getLanguageName(language)}>
          {getLanguageEmoji()}
        </span>
      )}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}
