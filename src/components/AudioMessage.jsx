import { useState, useRef } from 'react';
import styles from './AudioMessage.module.css';

const ELEVEN_LABS_KEY = import.meta.env.VITE_ELEVEN_LABS_KEY;
const ELEVEN_LABS_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Alice voice

export default function AudioMessage({ text, isSummary }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [useElevenLabs, setUseElevenLabs] = useState(true);
  const audioRef = useRef(null);

  const generateOpenAISpeech = async () => {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "nova",
        input: text,
        speed: 0.85, // Slower speed for better comprehension (range 0.25-4.0)
      }),
    });
    return response;
  };

  const generateElevenLabsSpeech = async () => {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.35,  // More natural variations
            similarity_boost: 0.75,
            style: 0.45,     // More expressive for Alice
            speaking_rate: 0.85, // Slower rate for better clarity
            pause_duration: 0.1  // Add slight pauses between sentences
          }
        })
      }
    );
    return response;
  };

  const generateSpeech = async () => {
    setIsLoading(true);
    try {
      const response = useElevenLabs ? 
        await generateElevenLabsSpeech() : 
        await generateOpenAISpeech();

      if (!response.ok) throw new Error('Speech generation failed');

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      
      if (audioRef.current?.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      
      setAudioUrl(url);
    } catch (error) {
      console.error('Speech Error:', error);
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

  return (
    <div className={styles.audioContainer}>
      <button 
        onClick={handlePlayClick}
        className={styles.playButton}
        disabled={isLoading}
        title={isSummary ? "Play quick summary" : "Play full response"}
      >
        {isLoading ? '🎵' : isPlaying ? '⏸️' : isSummary ? '📝' : '🎧'}
      </button>
      <button
        onClick={() => {
          setUseElevenLabs(!useElevenLabs);
          setAudioUrl(null); // Reset audio when switching voice
        }}
        className={`${styles.voiceToggle} ${useElevenLabs ? styles.eleven : styles.openai}`}
        title={`Switch to ${useElevenLabs ? 'Nova' : 'Alice'} voice`}
      >
        {useElevenLabs ? '🎭' : '🤖'}
      </button>
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
