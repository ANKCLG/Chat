import { useState, useCallback, useRef, useEffect } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { chatAgent } from '../services/chatAgent';

interface VoiceChatState {
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  status: string;
  statusType: 'success' | 'error' | 'warning' | 'loading' | 'idle';
  transcript: string;
  lastResponse: string;
}

export const useVoiceChat = () => {
  const [state, setState] = useState<VoiceChatState>({
    isActive: false,
    isListening: false,
    isSpeaking: false,
    status: 'Ready to chat!',
    statusType: 'success',
    transcript: '',
    lastResponse: ''
  });

  const speechRecognition = useSpeechRecognition();
  const speechSynthesis = useSpeechSynthesis();
  const processingRef = useRef(false);
  const lastProcessedRef = useRef('');
  const shouldRestartRef = useRef(false);

  const updateStatus = useCallback((status: string, statusType: VoiceChatState['statusType']) => {
    setState(prev => ({ ...prev, status, statusType }));
  }, []);

  const processUserInput = useCallback(async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput || processingRef.current || trimmedInput === lastProcessedRef.current) return;

    processingRef.current = true;
    lastProcessedRef.current = trimmedInput;
    shouldRestartRef.current = false;
    
    // Stop any ongoing speech immediately
    speechSynthesis.stop();
    
    updateStatus('Processing...', 'loading');

    try {
      const response = await chatAgent.generateResponse(trimmedInput);
      
      setState(prev => ({ 
        ...prev, 
        lastResponse: response.message,
        isSpeaking: true
      }));
      
      updateStatus('Speaking...', 'warning');
      
      await speechSynthesis.speak(response.message);
      
      setState(prev => ({ ...prev, isSpeaking: false }));
      
      // Schedule restart listening after speaking is done
      if (state.isActive) {
        shouldRestartRef.current = true;
      }
    } catch (error) {
      updateStatus('Error occurred', 'error');
      if (state.isActive) {
        shouldRestartRef.current = true;
      }
    } finally {
      processingRef.current = false;
      speechRecognition.resetTranscript();
    }
  }, [speechSynthesis, speechRecognition, updateStatus, state.isActive]);

  const startListeningIfNeeded = useCallback(() => {
    if (state.isActive && !speechRecognition.isListening && !speechSynthesis.isSpeaking && !processingRef.current) {
      updateStatus('Listening...', 'success');
      speechRecognition.startListening();
    }
  }, [state.isActive, speechRecognition, speechSynthesis.isSpeaking, updateStatus]);

  const startVoiceChat = useCallback(async () => {
    if (!speechRecognition.isSupported || !speechSynthesis.isSupported) {
      updateStatus('Voice not supported', 'error');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setState(prev => ({ 
        ...prev, 
        isActive: true,
        isListening: false
      }));
      
      shouldRestartRef.current = true;
      
    } catch (error) {
      updateStatus('Microphone access denied', 'error');
    }
  }, [speechRecognition, speechSynthesis, updateStatus]);

  const stopVoiceChat = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      isActive: false,
      isListening: false,
      isSpeaking: false
    }));
    
    speechRecognition.stopListening();
    speechSynthesis.stop();
    shouldRestartRef.current = false;
    
    updateStatus('Chat ended', 'warning');
    speechRecognition.resetTranscript();
    lastProcessedRef.current = '';
  }, [speechRecognition, speechSynthesis, updateStatus]);

  // Handle speech recognition end - process transcript or restart
  useEffect(() => {
    if (!speechRecognition.isListening && state.isActive && !processingRef.current) {
      const transcript = speechRecognition.transcript.trim();
      if (transcript && transcript !== lastProcessedRef.current) {
        processUserInput(transcript);
      } else if (shouldRestartRef.current) {
        // Small delay to prevent rapid restart loops
        setTimeout(startListeningIfNeeded, 200);
      }
    }
  }, [speechRecognition.isListening, speechRecognition.transcript, state.isActive, processUserInput, startListeningIfNeeded]);

  // Start listening when shouldRestart is true and conditions are met
  useEffect(() => {
    if (shouldRestartRef.current && !speechSynthesis.isSpeaking && !processingRef.current) {
      shouldRestartRef.current = false;
      setTimeout(startListeningIfNeeded, 100);
    }
  }, [speechSynthesis.isSpeaking, startListeningIfNeeded]);

  // Update transcript display
  useEffect(() => {
    setState(prev => ({ ...prev, transcript: speechRecognition.transcript }));
  }, [speechRecognition.transcript]);

  // Update listening state
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isListening: speechRecognition.isListening && state.isActive
    }));
  }, [speechRecognition.isListening, state.isActive]);

  // Update speaking state
  useEffect(() => {
    setState(prev => ({ ...prev, isSpeaking: speechSynthesis.isSpeaking }));
  }, [speechSynthesis.isSpeaking]);

  // Handle interruption when user speaks while assistant is talking
  useEffect(() => {
    if (speechRecognition.transcript && state.isSpeaking) {
      speechSynthesis.stop();
    }
  }, [speechRecognition.transcript, state.isSpeaking, speechSynthesis]);

  return {
    ...state,
    isSupported: speechRecognition.isSupported && speechSynthesis.isSupported,
    startVoiceChat,
    stopVoiceChat
  };
};