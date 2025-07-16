import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => Promise<void>;
  isSpeaking: boolean;
  isSupported: boolean;
  stop: () => void;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSupported = 'speechSynthesis' in window;

  // Load voices when component mounts
  useEffect(() => {
    if (isSupported) {
      // Load voices
      speechSynthesis.getVoices();
      
      // Listen for voices changed event
      const handleVoicesChanged = () => {
        speechSynthesis.getVoices();
      };
      
      speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, [isSupported]);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!isSupported || !text.trim()) {
        resolve();
        return;
      }

      // Stop any ongoing speech immediately
      speechSynthesis.cancel();
      setIsSpeaking(false);

      // Wait a moment for cancellation to complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtteranceRef.current = utterance;
        
        // Configure speech settings
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to use a good voice
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Prefer English voices
          const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en') && !voice.name.includes('Google')
          ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
          
          utterance.voice = englishVoice;
          console.log('🔊 Using voice:', englishVoice.name);
        }

        utterance.onstart = () => {
          console.log('🔊 Speech synthesis started');
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log('🔇 Speech synthesis ended');
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('🚫 Speech synthesis error:', event.error);
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          resolve();
        };

        console.log('🔊 Speaking:', text);
        speechSynthesis.speak(utterance);
      }, 50);
    });
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      console.log('🔇 Speech synthesis stopped');
    }
  }, [isSupported]);

  return {
    speak,
    isSpeaking,
    isSupported,
    stop
  };
};