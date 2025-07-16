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
  const isInitializedRef = useRef(false);

  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  const initializeRecognition = useCallback(() => {
    if (!isSupported || isInitializedRef.current) return recognitionRef.current;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
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
      
      // Don't treat no-speech as a critical error
      if (event.error === 'no-speech') {
        console.log('No speech detected, will retry...');
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    isInitializedRef.current = true;
    return recognition;
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      console.warn('Speech recognition not supported');
      return;
    }

    // Don't start if already listening
    if (isListening) {
      console.log('Already listening, skipping start');
      return;
    }

    const recognition = recognitionRef.current || initializeRecognition();
    if (!recognition) return;

    try {
      recognition.start();
      console.log('Starting speech recognition...');
    } catch (error) {
      console.error('Error starting recognition:', error);
      
      // Handle the case where recognition is already started
      if (error.name === 'InvalidStateError') {
        console.log('Recognition already started, updating state');
        setIsListening(true);
      }
    }
  }, [isSupported, isListening, initializeRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Stopping speech recognition...');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
    setIsListening(false);
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