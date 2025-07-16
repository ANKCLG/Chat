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
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateStatus = useCallback((status: string, statusType: VoiceChatState['statusType']) => {
    setState(prev => ({ ...prev, status, statusType }));
  }, []);

  const clearRestartTimeout = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const scheduleRestart = useCallback(() => {
    clearRestartTimeout();
    if (state.isActive && !processingRef.current && !speechSynthesis.isSpeaking) {
      restartTimeoutRef.current = setTimeout(() => {
        if (state.isActive && !speechRecognition.isListening && !speechSynthesis.isSpeaking && !processingRef.current) {
          updateStatus('Listening...', 'success');
          speechRecognition.startListening();
        }
      }, 500);
    }
  }, [state.isActive, speechRecognition, speechSynthesis.isSpeaking, updateStatus, clearRestartTimeout]);

  const processUserInput = useCallback(async (input: string) => {
    const trimmedInput = input.trim();
    if (!trimmedInput || processingRef.current || trimmedInput === lastProcessedRef.current) {
      return;
    }

    processingRef.current = true;
    lastProcessedRef.current = trimmedInput;
    clearRestartTimeout();
    
    // Stop any ongoing speech and recognition
    speechSynthesis.stop();
    speechRecognition.stopListening();
    
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
      
      // Schedule restart after speaking
      if (state.isActive) {
        scheduleRestart();
      }
    } catch (error) {
      console.error('Error processing input:', error);
      updateStatus('Error occurred', 'error');
      if (state.isActive) {
        scheduleRestart();
      }
    } finally {
      processingRef.current = false;
      speechRecognition.resetTranscript();
    }
  }, [speechSynthesis, speechRecognition, updateStatus, state.isActive, scheduleRestart, clearRestartTimeout]);

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
        transcript: '',
        lastResponse: ''
      }));
      
      processingRef.current = false;
      lastProcessedRef.current = '';
      
      updateStatus('Starting...', 'loading');
      
      // Start listening after a brief delay
      setTimeout(() => {
        if (state.isActive) {
          updateStatus('Listening...', 'success');
          speechRecognition.startListening();
        }
      }, 300);
      
    } catch (error) {
      console.error('Microphone access error:', error);
      updateStatus('Microphone access denied', 'error');
    }
  }, [speechRecognition, speechSynthesis, updateStatus, state.isActive]);

  const stopVoiceChat = useCallback(() => {
    clearRestartTimeout();
    
    setState(prev => ({ 
      ...prev, 
      isActive: false,
      isListening: false,
      isSpeaking: false,
      transcript: '',
      lastResponse: ''
    }));
    
    speechRecognition.stopListening();
    speechSynthesis.stop();
    processingRef.current = false;
    lastProcessedRef.current = '';
    
    updateStatus('Chat ended', 'warning');
  }, [speechRecognition, speechSynthesis, updateStatus, clearRestartTimeout]);

  // Handle speech recognition state changes
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isListening: speechRecognition.isListening && state.isActive
    }));
  }, [speechRecognition.isListening, state.isActive]);

  // Handle speech synthesis state changes
  useEffect(() => {
    setState(prev => ({ ...prev, isSpeaking: speechSynthesis.isSpeaking }));
  }, [speechSynthesis.isSpeaking]);

  // Handle transcript updates
  useEffect(() => {
    setState(prev => ({ ...prev, transcript: speechRecognition.transcript }));
  }, [speechRecognition.transcript]);

  // Handle recognition end - process transcript or restart
  useEffect(() => {
    if (!speechRecognition.isListening && state.isActive && !processingRef.current && !speechSynthesis.isSpeaking) {
      const transcript = speechRecognition.transcript.trim();
      if (transcript && transcript !== lastProcessedRef.current) {
        processUserInput(transcript);
      } else {
        // Schedule restart if no valid transcript
        scheduleRestart();
      }
    }
  }, [speechRecognition.isListening, speechRecognition.transcript, state.isActive, speechSynthesis.isSpeaking, processUserInput, scheduleRestart]);

  // Handle interruption when user speaks while assistant is talking
  useEffect(() => {
    if (speechRecognition.transcript && speechSynthesis.isSpeaking) {
      console.log('User interrupted, stopping speech');
      speechSynthesis.stop();
    }
  }, [speechRecognition.transcript, speechSynthesis.isSpeaking, speechSynthesis]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearRestartTimeout();
    };
  }, [clearRestartTimeout]);

  return {
    ...state,
    isSupported: speechRecognition.isSupported && speechSynthesis.isSupported,
    startVoiceChat,
    stopVoiceChat
  };
};