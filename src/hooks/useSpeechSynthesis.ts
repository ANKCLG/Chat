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

      // Stop any ongoing speech immediately
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      currentUtteranceRef.current = utterance;
      
      // Faster speech settings
      utterance.rate = 1.2;
      utterance.pitch = 1;
      utterance.volume = 0.9;

      // Use first available voice for speed
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        resolve();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        currentUtteranceRef.current = null;
        resolve();
      };

      speechSynthesis.speak(utterance);
    });
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtteranceRef.current = null;
    }
  }, [isSupported]);

  return {
    speak,
    isSpeaking,
    isSupported,
    stop
  };
};