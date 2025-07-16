import { useState, useCallback, useRef } from 'react';

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

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!isSupported || !text.trim()) {
        resolve();
        return;
      }

      // Stop any current speech
      speechSynthesis.cancel();
      setIsSpeaking(false);

      // Wait for cancellation to complete
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtteranceRef.current = utterance;
        
        // Configure speech
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Get available voices
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Find a good English voice
          const englishVoice = voices.find(voice => 
            voice.lang.startsWith('en') && voice.localService
          ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
          
          utterance.voice = englishVoice;
          console.log('🔊 Using voice:', englishVoice.name);
        }

        utterance.onstart = () => {
          console.log('🔊 Speech started:', text);
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          console.log('🔇 Speech ended');
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('🚫 Speech error:', event.error);
          setIsSpeaking(false);
          currentUtteranceRef.current = null;
          resolve();
        };

        speechSynthesis.speak(utterance);
      }, 100);
    });
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
      console.log('🔇 Speech stopped');
    }
  }, [isSupported]);

  return {
    speak,
    isSpeaking,
    isSupported,
    stop
  };
};