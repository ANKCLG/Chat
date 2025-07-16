import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isStartingRef = useRef(false);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const initializeRecognition = useCallback(() => {
    if (!isSupported || recognitionRef.current) return recognitionRef.current;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      isStartingRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error('🚫 Speech recognition error:', event.error);
      setIsListening(false);
      isStartingRef.current = false;
    };

    recognition.onend = () => {
      console.log('🔇 Speech recognition ended');
      setIsListening(false);
      isStartingRef.current = false;
    };

    recognitionRef.current = recognition;
    return recognition;
  }, [isSupported]);

  const startListening = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      console.warn('Speech recognition not supported');
      return;
    }

    // Prevent multiple simultaneous starts
    if (isListening || isStartingRef.current) {
      console.log('Already listening or starting, skipping...');
      return;
    }

    const recognition = recognitionRef.current || initializeRecognition();
    if (!recognition) return;

    isStartingRef.current = true;

    try {
      // Stop any existing recognition first
      recognition.stop();
      
      // Wait a bit before starting
      await new Promise(resolve => setTimeout(resolve, 100));
      
      recognition.start();
      console.log('🎤 Starting speech recognition...');
    } catch (error) {
      console.error('Error starting recognition:', error);
      isStartingRef.current = false;
    }
  }, [isSupported, isListening, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('🔇 Stopping speech recognition...');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
    isStartingRef.current = false;
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
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
    confidence,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
};