import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isStartingRef = useRef(false);
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const initializeRecognition = useCallback(() => {
    if (!isSupported || recognitionRef.current) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      isStartingRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        console.log('🎤 Transcript:', finalTranscript);
        setTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.log('🚫 Speech recognition error:', event.error);
      setIsListening(false);
      isStartingRef.current = false;
    };

    recognition.onend = () => {
      console.log('🔇 Speech recognition ended');
      setIsListening(false);
      isStartingRef.current = false;
    };

    recognitionRef.current = recognition;
  }, [isSupported]);

  const startListening = useCallback(async (): Promise<void> => {
    if (!isSupported || isStartingRef.current) return;
    
    // Stop any existing recognition first
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!recognitionRef.current) {
      initializeRecognition();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const recognition = recognitionRef.current;
    if (!recognition) return;

    try {
      isStartingRef.current = true;
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      isStartingRef.current = false;
    }
  }, [isSupported, isListening, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
    isStartingRef.current = false;
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};