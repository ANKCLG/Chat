import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  confidence: number;
  isSupported: boolean;
  startListening: () => void;
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
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
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
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      isStartingRef.current = false;
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      isStartingRef.current = false;
    };

    return recognition;
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported || isStartingRef.current) return;

    // If already listening, don't start again
    if (isListening) {
      console.log('Already listening, skipping start');
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = initializeRecognition();
    }

    if (recognitionRef.current) {
      try {
        isStartingRef.current = true;
        recognitionRef.current.start();
        console.log('Starting speech recognition...');
      } catch (error) {
        console.error('Error starting recognition:', error);
        isStartingRef.current = false;
        
        // If it's already started, just update our state
        if (error.name === 'InvalidStateError') {
          setIsListening(true);
        }
      }
    }
  }, [isSupported, isListening, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && (isListening || isStartingRef.current)) {
      try {
        recognitionRef.current.stop();
        console.log('Stopping speech recognition...');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    isStartingRef.current = false;
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      isStartingRef.current = false;
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