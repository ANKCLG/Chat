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

  const processUserInput = useCallback(async (input: string) => {
    if (!input.trim() || processingRef.current) return;

    processingRef.current = true;
    clearRestartTimeout();
    
    console.log('💭 Processing:', input);
    
    speechSynthesis.stop();
    speechRecognition.stopListening();
    
    updateStatus('Processing...', 'loading');

    try {
      const response = await chatAgent.generateResponse(input);
      
      setState(prev => ({ 
        ...prev, 
        lastResponse: response.message
      }));
      
      updateStatus('Speaking...', 'warning');
      
      await speechSynthesis.speak(response.message);
      
      if (state.isActive) {
        updateStatus('Listening...', 'success');
        setTimeout(() => {
          if (state.isActive && !processingRef.current) {
            speechRecognition.startListening();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error processing input:', error);
      updateStatus('Error occurred', 'error');
    } finally {
      processingRef.current = false;
      speechRecognition.resetTranscript();
    }
  }, [speechSynthesis, speechRecognition, updateStatus, clearRestartTimeout, state.isActive]);

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
      clearRestartTimeout();
      
      updateStatus('Starting...', 'loading');
      
      setTimeout(() => {
        updateStatus('Listening...', 'success');
        speechRecognition.startListening();
      }, 1000);
      
    } catch (error) {
      console.error('Microphone access error:', error);
      updateStatus('Microphone access denied', 'error');
    }
  }, [speechRecognition, speechSynthesis, updateStatus, clearRestartTimeout]);

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
    
    updateStatus('Chat ended', 'warning');
  }, [speechRecognition, speechSynthesis, updateStatus, clearRestartTimeout]);

  // Update state based on speech recognition
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isListening: speechRecognition.isListening && state.isActive
    }));
  }, [speechRecognition.isListening, state.isActive]);

  // Update state based on speech synthesis
  useEffect(() => {
    setState(prev => ({ ...prev, isSpeaking: speechSynthesis.isSpeaking }));
  }, [speechSynthesis.isSpeaking]);

  // Update transcript
  useEffect(() => {
    setState(prev => ({ ...prev, transcript: speechRecognition.transcript }));
  }, [speechRecognition.transcript]);

  // Handle when recognition ends with transcript
  useEffect(() => {
    if (!speechRecognition.isListening && 
        state.isActive && 
        speechRecognition.transcript && 
        !processingRef.current &&
        !speechSynthesis.isSpeaking) {
      
      processUserInput(speechRecognition.transcript);
    } else if (!speechRecognition.isListening && 
               state.isActive && 
               !speechRecognition.transcript && 
               !processingRef.current &&
               !speechSynthesis.isSpeaking) {
      
      // No transcript, restart listening after a delay
      restartTimeoutRef.current = setTimeout(() => {
        if (state.isActive && !processingRef.current && !speechSynthesis.isSpeaking) {
          speechRecognition.startListening();
        }
      }, 2000);
    }
  }, [
    speechRecognition.isListening, 
    speechRecognition.transcript, 
    state.isActive, 
    speechSynthesis.isSpeaking,
    processUserInput,
    speechRecognition
  ]);

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