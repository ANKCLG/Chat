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
  const isActiveRef = useRef(false);

  const updateStatus = useCallback((status: string, statusType: VoiceChatState['statusType']) => {
    setState(prev => ({ ...prev, status, statusType }));
  }, []);

  const processUserInput = useCallback(async (input: string) => {
    if (!input.trim() || processingRef.current || !isActiveRef.current) return;

    processingRef.current = true;
    console.log('💭 Processing:', input);
    
    speechSynthesis.stop();
    speechRecognition.stopListening();
    
    updateStatus('Processing...', 'loading');

    try {
      const response = await chatAgent.generateResponse(input);
      
      if (!isActiveRef.current) return;
      
      setState(prev => ({ 
        ...prev, 
        lastResponse: response.message
      }));
      
      updateStatus('Speaking...', 'warning');
      
      await speechSynthesis.speak(response.message);
      
      // Wait a bit then restart listening
      if (isActiveRef.current) {
        updateStatus('Listening...', 'success');
        setTimeout(async () => {
          if (isActiveRef.current && !processingRef.current) {
            await speechRecognition.startListening();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error processing input:', error);
      updateStatus('Error occurred', 'error');
    } finally {
      processingRef.current = false;
      speechRecognition.resetTranscript();
    }
  }, [speechSynthesis, speechRecognition, updateStatus]);

  const startVoiceChat = useCallback(async () => {
    if (!speechRecognition.isSupported || !speechSynthesis.isSupported) {
      updateStatus('Voice not supported', 'error');
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      isActiveRef.current = true;
      setState(prev => ({ 
        ...prev, 
        isActive: true,
        transcript: '',
        lastResponse: ''
      }));
      
      processingRef.current = false;
      
      updateStatus('Starting...', 'loading');
      
      setTimeout(async () => {
        if (isActiveRef.current) {
          updateStatus('Listening...', 'success');
          await speechRecognition.startListening();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Microphone access error:', error);
      updateStatus('Microphone access denied', 'error');
      isActiveRef.current = false;
    }
  }, [speechRecognition, speechSynthesis, updateStatus]);

  const stopVoiceChat = useCallback(() => {
    isActiveRef.current = false;
    
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
  }, [speechRecognition, speechSynthesis, updateStatus]);

  // Update state based on speech recognition
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      isListening: speechRecognition.isListening && isActiveRef.current
    }));
  }, [speechRecognition.isListening]);

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
        isActiveRef.current && 
        speechRecognition.transcript && 
        !processingRef.current &&
        !speechSynthesis.isSpeaking) {
      
      processUserInput(speechRecognition.transcript);
    }
  }, [
    speechRecognition.isListening, 
    speechRecognition.transcript, 
    speechSynthesis.isSpeaking,
    processUserInput
  ]);

  return {
    ...state,
    isSupported: speechRecognition.isSupported && speechSynthesis.isSupported,
    startVoiceChat,
    stopVoiceChat
  };
};